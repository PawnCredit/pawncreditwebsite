'use client'

import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useApp } from '@/lib/app-context'
import { LoanStatus, LOAN_STATUS_LABELS, LOAN_STATUS_COLORS } from '@/lib/web3-config'
import { 
  useUserBorrowerLoans, 
  useUserLenderLoans, 
  useCancelLoanOffer, 
  useRepayLoan, 
  useClaimDefault,
  getTokenByAddress, 
  formatTokenAmount,
  type ContractLoan 
} from '@/lib/contract-hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TierMeter } from './tier-meter'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle, CheckCircle, ExternalLink, Coins, ArrowDownToLine, ArrowUpFromLine, Loader2, Wallet } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface PortfolioProps {
  className?: string
}

export function Portfolio({ className }: PortfolioProps) {
  const { viewMode } = useApp()
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('borrowed')
  
  // Fetch real user loans from contract
  const { loans: borrowerLoans, isLoading: isLoadingBorrower } = useUserBorrowerLoans()
  const { loans: lenderLoans, isLoading: isLoadingLender } = useUserLenderLoans()

  const isLoading = isLoadingBorrower || isLoadingLender

  // Calculate real stats
  const stats = useMemo(() => {
    let totalBorrowed = BigInt(0)
    let totalLent = BigInt(0)
    let activeLoansCount = 0
    let completedLoansCount = 0

    for (const { loan } of borrowerLoans) {
      if (loan.status === LoanStatus.ACTIVE) {
        totalBorrowed += loan.loanAmount
        activeLoansCount++
      } else if (loan.status === LoanStatus.REPAID) {
        completedLoansCount++
      }
    }

    for (const { loan } of lenderLoans) {
      if (loan.status === LoanStatus.ACTIVE) {
        totalLent += loan.loanAmount
        activeLoansCount++
      } else if (loan.status === LoanStatus.REPAID || loan.status === LoanStatus.DEFAULTED) {
        completedLoansCount++
      }
    }

    return {
      totalBorrowed,
      totalLent,
      activeLoansCount,
      completedLoansCount,
    }
  }, [borrowerLoans, lenderLoans])

  // Mock PAWN balance (would come from token balance hook in production)
  const pawnBalance = 450

  if (!isConnected) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <Wallet className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 text-lg font-semibold">Connect Your Wallet</h2>
        <p className="text-center text-sm text-muted-foreground">
          Connect your wallet to view your portfolio and manage your loans
        </p>
      </div>
    )
  }

  if (viewMode === 'advanced') {
    return (
      <PortfolioTerminal 
        className={className}
        pawnBalance={pawnBalance}
        borrowerLoans={borrowerLoans}
        lenderLoans={lenderLoans}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard 
          label="Total Borrowed" 
          value={`${formatTokenAmount(stats.totalBorrowed, 6)}`}
          icon={<ArrowDownToLine className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard 
          label="Total Lent" 
          value={`${formatTokenAmount(stats.totalLent, 6)}`}
          icon={<ArrowUpFromLine className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard 
          label="Active Loans" 
          value={stats.activeLoansCount.toString()}
          icon={<Clock className="h-4 w-4" />}
          highlight
          isLoading={isLoading}
        />
        <StatCard 
          label="Completed" 
          value={stats.completedLoansCount.toString()}
          icon={<CheckCircle className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* Tier Meter */}
      <TierMeter balance={pawnBalance} />

      {/* Loans Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="borrowed">
            Borrowed ({borrowerLoans.length})
          </TabsTrigger>
          <TabsTrigger value="lent">
            Lent ({lenderLoans.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="borrowed" className="mt-4 space-y-3">
          {isLoading ? (
            <LoadingState message="Loading your borrowed positions..." />
          ) : borrowerLoans.length === 0 ? (
            <EmptyState message="No borrowed positions" />
          ) : (
            borrowerLoans.map(({ loan, isExpired }) => (
              <BorrowerLoanCard key={loan.id.toString()} loan={loan} isExpired={isExpired} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="lent" className="mt-4 space-y-3">
          {isLoading ? (
            <LoadingState message="Loading your lending positions..." />
          ) : lenderLoans.length === 0 ? (
            <EmptyState message="No lending positions" />
          ) : (
            lenderLoans.map(({ loan, isExpired }) => (
              <LenderLoanCard key={loan.id.toString()} loan={loan} isExpired={isExpired} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  icon,
  highlight,
  isLoading 
}: { 
  label: string
  value: string
  icon: React.ReactNode
  highlight?: boolean
  isLoading?: boolean
}) {
  return (
    <div className={cn(
      'rounded-xl border border-border p-3',
      highlight && 'border-primary bg-primary/5'
    )}>
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      {isLoading ? (
        <div className="h-7 w-16 animate-pulse rounded bg-secondary" />
      ) : (
        <p className="font-mono text-xl font-semibold">{value}</p>
      )}
    </div>
  )
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Coins className="mb-3 h-12 w-12 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function BorrowerLoanCard({ loan, isExpired }: { loan: ContractLoan; isExpired: boolean }) {
  const collateralToken = getTokenByAddress(loan.collateralToken) || { symbol: '???', decimals: 18 }
  const loanToken = getTokenByAddress(loan.loanToken) || { symbol: '???', decimals: 18 }
  
  const { cancelLoan, isPending: isCancelling } = useCancelLoanOffer()
  const { repayLoan, isPending: isRepaying } = useRepayLoan()

  const getTimeRemaining = () => {
    if (loan.status !== LoanStatus.ACTIVE || !loan.startTime) return null
    const endTime = Number(loan.startTime) + Number(loan.duration)
    const now = Date.now() / 1000
    if (now >= endTime) return 'Expired'
    return formatDistanceToNow(new Date(endTime * 1000), { addSuffix: false })
  }

  const timeRemaining = getTimeRemaining()
  const isExpiringSoon = loan.status === LoanStatus.ACTIVE && 
    loan.startTime && 
    (Number(loan.startTime) + Number(loan.duration) - Date.now() / 1000) < 24 * 60 * 60

  const handleCancel = async () => {
    try {
      await cancelLoan(loan.id)
    } catch (error) {
      console.error('Failed to cancel loan:', error)
    }
  }

  const handleRepay = async () => {
    try {
      await repayLoan(loan.id)
    } catch (error) {
      console.error('Failed to repay loan:', error)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">
            Loan #{loan.id.toString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTokenAmount(loan.collateralAmount, collateralToken.decimals)} {collateralToken.symbol} → {formatTokenAmount(loan.loanAmount, loanToken.decimals)} {loanToken.symbol}
          </p>
        </div>
        <span className={cn('text-xs font-medium', LOAN_STATUS_COLORS[loan.status as LoanStatus])}>
          {isExpired && loan.status === LoanStatus.OPEN ? 'Expired' : LOAN_STATUS_LABELS[loan.status as LoanStatus]}
        </span>
      </div>

      {/* Time Warning */}
      {loan.status === LoanStatus.ACTIVE && timeRemaining && (
        <div className={cn(
          'mb-3 flex items-center justify-between rounded-lg px-3 py-2',
          isExpiringSoon ? 'bg-destructive/10' : 'bg-secondary'
        )}>
          {isExpiringSoon && <AlertTriangle className="h-4 w-4 text-destructive" />}
          <Clock className={cn('h-4 w-4', !isExpiringSoon && 'text-muted-foreground')} />
          <span className={cn(
            'ml-2 flex-1 text-xs',
            isExpiringSoon ? 'font-medium text-destructive' : 'text-muted-foreground'
          )}>
            {isExpiringSoon ? 'Expires soon!' : 'Time remaining'}
          </span>
          <span className={cn(
            'font-mono text-sm font-medium',
            isExpiringSoon ? 'text-destructive' : 'text-[var(--pawn-amber)]'
          )}>
            {timeRemaining}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {loan.status === LoanStatus.OPEN && !isExpired && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Cancel Offer
          </Button>
        )}
        {loan.status === LoanStatus.ACTIVE && (
          <Button 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleRepay}
            disabled={isRepaying}
          >
            {isRepaying ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Repay {formatTokenAmount(loan.loanAmount, loanToken.decimals)} {loanToken.symbol}
          </Button>
        )}
        <Link href={`/app/loan/${loan.id.toString()}`}>
          <Button variant="ghost" size="sm" className="text-xs">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function LenderLoanCard({ loan, isExpired }: { loan: ContractLoan; isExpired: boolean }) {
  const collateralToken = getTokenByAddress(loan.collateralToken) || { symbol: '???', decimals: 18 }
  const loanToken = getTokenByAddress(loan.loanToken) || { symbol: '???', decimals: 18 }
  
  const { claimDefault, isPending: isClaiming } = useClaimDefault()

  const canClaim = loan.status === LoanStatus.ACTIVE && isExpired

  const handleClaim = async () => {
    try {
      await claimDefault(loan.id)
    } catch (error) {
      console.error('Failed to claim collateral:', error)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">
            Loan #{loan.id.toString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Lent {formatTokenAmount(loan.loanAmount, loanToken.decimals)} {loanToken.symbol}
          </p>
          <p className="text-xs text-muted-foreground">
            Collateral: {formatTokenAmount(loan.collateralAmount, collateralToken.decimals)} {collateralToken.symbol}
          </p>
        </div>
        <span className={cn('text-xs font-medium', LOAN_STATUS_COLORS[loan.status as LoanStatus])}>
          {canClaim ? 'Claimable' : LOAN_STATUS_LABELS[loan.status as LoanStatus]}
        </span>
      </div>

      {/* Expired / Claimable */}
      {canClaim && (
        <div className="mb-3 rounded-lg bg-[var(--pawn-green)]/10 px-3 py-2">
          <p className="text-xs text-[var(--pawn-green)]">
            Borrower defaulted. You can claim {formatTokenAmount(loan.collateralAmount, collateralToken.decimals)} {collateralToken.symbol}
          </p>
        </div>
      )}

      {loan.status === LoanStatus.DEFAULTED && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
          <CheckCircle className="h-4 w-4 text-[var(--pawn-green)]" />
          <p className="text-xs text-muted-foreground">
            Collateral claimed
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {canClaim && (
          <Button 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleClaim}
            disabled={isClaiming}
          >
            {isClaiming ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Claim Collateral
          </Button>
        )}
        <Link href={`/app/loan/${loan.id.toString()}`}>
          <Button variant="ghost" size="sm" className="text-xs">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

interface TerminalLoanData {
  loan: ContractLoan
  isExpired: boolean
}

interface PortfolioTerminalProps {
  className?: string
  pawnBalance: number
  borrowerLoans: TerminalLoanData[]
  lenderLoans: TerminalLoanData[]
  isLoading: boolean
}

function PortfolioTerminal({ className, pawnBalance, borrowerLoans, lenderLoans, isLoading }: PortfolioTerminalProps) {
  return (
    <div className={cn('font-mono text-xs', className)}>
      {/* Header */}
      <div className="mb-4 border-b border-border pb-2">
        <span className="text-[var(--pawn-amber)]">PORTFOLIO_OVERVIEW</span>
        {isLoading && <span className="ml-4 animate-pulse text-[var(--pawn-amber)]">LOADING...</span>}
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <span className="text-muted-foreground">BORROWED_POSITIONS: </span>
          <span className="text-[var(--pawn-green)]">{borrowerLoans.length}</span>
        </div>
        <div>
          <span className="text-muted-foreground">LENT_POSITIONS: </span>
          <span className="text-[var(--pawn-green)]">{lenderLoans.length}</span>
        </div>
        <div>
          <span className="text-muted-foreground">ACTIVE_LOANS: </span>
          <span className="text-[var(--pawn-amber)]">
            {borrowerLoans.filter(l => l.loan.status === LoanStatus.ACTIVE).length + 
             lenderLoans.filter(l => l.loan.status === LoanStatus.ACTIVE).length}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">$PAWN_BALANCE: </span>
          <span className="text-foreground">{pawnBalance}</span>
        </div>
      </div>

      <TierMeter balance={pawnBalance} className="mb-4" />

      {/* Borrower Loans */}
      <div className="mb-4">
        <div className="mb-2 text-[var(--pawn-amber)]">BORROWED_POSITIONS:</div>
        {borrowerLoans.length === 0 ? (
          <div className="text-muted-foreground">NO_POSITIONS</div>
        ) : (
          borrowerLoans.map(({ loan, isExpired }) => {
            const collateralToken = getTokenByAddress(loan.collateralToken) || { symbol: '???', decimals: 18 }
            const loanToken = getTokenByAddress(loan.loanToken) || { symbol: '???', decimals: 18 }
            return (
              <div key={loan.id.toString()} className="mb-1 flex items-center justify-between py-0.5">
                <span>
                  <span className="text-[var(--pawn-blue)]">#{loan.id.toString()}</span>
                  <span className="ml-2 text-muted-foreground">
                    {formatTokenAmount(loan.collateralAmount, collateralToken.decimals)} {collateralToken.symbol} → {formatTokenAmount(loan.loanAmount, loanToken.decimals)} {loanToken.symbol}
                  </span>
                </span>
                <span className={cn(
                  loan.status === LoanStatus.ACTIVE && 'text-[var(--pawn-green)]',
                  loan.status === LoanStatus.OPEN && !isExpired && 'text-[var(--pawn-blue)]',
                  isExpired && 'text-destructive'
                )}>
                  {isExpired && loan.status === LoanStatus.OPEN ? 'EXPIRED' : LOAN_STATUS_LABELS[loan.status as LoanStatus].toUpperCase()}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Lender Loans */}
      <div>
        <div className="mb-2 text-[var(--pawn-amber)]">LENT_POSITIONS:</div>
        {lenderLoans.length === 0 ? (
          <div className="text-muted-foreground">NO_POSITIONS</div>
        ) : (
          lenderLoans.map(({ loan, isExpired }) => {
            const loanToken = getTokenByAddress(loan.loanToken) || { symbol: '???', decimals: 18 }
            return (
              <div key={loan.id.toString()} className="mb-1 flex items-center justify-between py-0.5">
                <span>
                  <span className="text-[var(--pawn-blue)]">#{loan.id.toString()}</span>
                  <span className="ml-2 text-muted-foreground">
                    {formatTokenAmount(loan.loanAmount, loanToken.decimals)} {loanToken.symbol}
                  </span>
                </span>
                <span className={cn(
                  loan.status === LoanStatus.ACTIVE && !isExpired && 'text-[var(--pawn-green)]',
                  loan.status === LoanStatus.ACTIVE && isExpired && 'text-[var(--pawn-amber)]',
                  loan.status === LoanStatus.DEFAULTED && 'text-destructive'
                )}>
                  {loan.status === LoanStatus.ACTIVE && isExpired ? 'CLAIMABLE' : LOAN_STATUS_LABELS[loan.status as LoanStatus].toUpperCase()}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

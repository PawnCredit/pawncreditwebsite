"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Copy,
  Timer,
  Coins,
  TrendingUp,
  Wallet,
  Loader2,
  Check
} from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import { useAccount } from "wagmi"
import { 
  useLoanDetails, 
  useFundLoan, 
  useRepayLoan, 
  useClaimDefault,
  useCancelLoanOffer,
  useApproveToken,
  useTokenAllowance,
  formatTokenAmount,
  getTokenByAddress
} from "@/lib/contract-hooks"
import { 
  LoanStatus, 
  LOAN_STATUS_LABELS, 
  PAWN_PLATFORM_ADDRESS 
} from "@/lib/web3-config"

export default function LoanDetailPage() {
  const params = useParams()
  const { isTerminalMode } = useAppContext()
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)
  
  const loanId = params.id as string
  const { data: loanData, isLoading, refetch } = useLoanDetails(BigInt(loanId))
  
  // Contract write hooks
  const { fundLoan, isPending: isFunding, isConfirming: isFundingConfirming, isSuccess: fundSuccess } = useFundLoan()
  const { repayLoan, isPending: isRepaying, isConfirming: isRepayConfirming, isSuccess: repaySuccess } = useRepayLoan()
  const { claimDefault, isPending: isClaiming, isConfirming: isClaimConfirming, isSuccess: claimSuccess } = useClaimDefault()
  const { cancelLoan, isPending: isCancelling, isConfirming: isCancelConfirming, isSuccess: cancelSuccess } = useCancelLoanOffer()
  const { approve, isPending: isApproving, isConfirming: isApprovalConfirming, isSuccess: approvalSuccess } = useApproveToken()

  // Refetch on success
  useEffect(() => {
    if (fundSuccess || repaySuccess || claimSuccess || cancelSuccess) {
      refetch()
    }
  }, [fundSuccess, repaySuccess, claimSuccess, cancelSuccess, refetch])

  const loan = loanData?.[0]
  const isExpired = loanData?.[1] ?? false

  // Token info
  const collateralToken = loan ? getTokenByAddress(loan.collateralToken) : undefined
  const loanToken = loan ? getTokenByAddress(loan.loanToken) : undefined

  // Check allowance for funding/repaying
  const { data: loanTokenAllowance } = useTokenAllowance(
    loan?.loanToken,
    address,
    PAWN_PLATFORM_ADDRESS
  )

  // Time calculations
  const now = Date.now()
  const startTime = loan?.startTime ? Number(loan.startTime) * 1000 : 0
  const duration = loan?.duration ? Number(loan.duration) * 1000 : 0
  const endTime = startTime + duration
  const timeRemaining = Math.max(0, endTime - now)
  const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000))
  const hoursRemaining = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const timeProgress = startTime && duration ? ((now - startTime) / duration) * 100 : 0

  // User role
  const isBorrower = loan && address && loan.borrower.toLowerCase() === address.toLowerCase()
  const isLender = loan && address && loan.lender.toLowerCase() === address.toLowerCase() && loan.lender !== "0x0000000000000000000000000000000000000000"

  // Action handlers
  const handleFund = async () => {
    if (!loan) return
    const needsApproval = !loanTokenAllowance || loanTokenAllowance < loan.loanAmount
    if (needsApproval) {
      await approve(loan.loanToken, PAWN_PLATFORM_ADDRESS, loan.loanAmount)
    } else {
      await fundLoan(BigInt(loanId))
    }
  }

  const handleRepay = async () => {
    if (!loan) return
    const needsApproval = !loanTokenAllowance || loanTokenAllowance < loan.loanAmount
    if (needsApproval) {
      await approve(loan.loanToken, PAWN_PLATFORM_ADDRESS, loan.loanAmount)
    } else {
      await repayLoan(BigInt(loanId))
    }
  }

  const handleClaim = async () => {
    await claimDefault(BigInt(loanId))
  }

  const handleCancel = async () => {
    await cancelLoan(BigInt(loanId))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case LoanStatus.OPEN: return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case LoanStatus.ACTIVE: return "bg-green-500/10 text-green-500 border-green-500/20"
      case LoanStatus.REPAID: return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case LoanStatus.DEFAULTED: return "bg-red-500/10 text-red-500 border-red-500/20"
      case LoanStatus.CANCELLED: return "bg-muted text-muted-foreground"
      default: return ""
    }
  }

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not found
  if (!loan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl p-4 md:p-6">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Loan Not Found</h3>
              <p className="mt-2 text-muted-foreground">
                This loan doesn&apos;t exist or has been removed.
              </p>
              <Button asChild className="mt-4">
                <Link href="/app">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Check if can claim default
  const canClaimDefault = loan.status === LoanStatus.ACTIVE && isExpired && isLender

  if (isTerminalMode) {
    return (
      <div className="min-h-screen bg-background p-4 font-mono text-sm">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center gap-4">
            <Link href="/app" className="text-muted-foreground hover:text-foreground">
              {"<"} BACK
            </Link>
            <span className="text-muted-foreground">|</span>
            <span>LOAN_DETAIL #{loanId}</span>
            <span className="text-muted-foreground">|</span>
            <span className={cn(
              loan.status === LoanStatus.ACTIVE && "text-green-500",
              loan.status === LoanStatus.OPEN && "text-blue-500",
              loan.status === LoanStatus.DEFAULTED && "text-red-500",
              loan.status === LoanStatus.REPAID && "text-emerald-500"
            )}>
              {LOAN_STATUS_LABELS[loan.status as LoanStatus]}
            </span>
            {isExpired && loan.status === LoanStatus.ACTIVE && (
              <span className="text-red-500">[EXPIRED]</span>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded border border-border bg-card p-4">
              <div className="mb-2 text-muted-foreground">COLLATERAL_INFO</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TOKEN:</span>
                  <span>{collateralToken?.symbol || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AMOUNT:</span>
                  <span>{formatTokenAmount(loan.collateralAmount, collateralToken?.decimals || 18)}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded border border-border bg-card p-4">
              <div className="mb-2 text-muted-foreground">LOAN_INFO</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TOKEN:</span>
                  <span>{loanToken?.symbol || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AMOUNT:</span>
                  <span>{formatTokenAmount(loan.loanAmount, loanToken?.decimals || 18)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FEE:</span>
                  <span>{formatTokenAmount(loan.originationFee, loanToken?.decimals || 18)}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded border border-border bg-card p-4">
              <div className="mb-2 text-muted-foreground">TIME_INFO</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DURATION:</span>
                  <span>{Math.floor(Number(loan.duration) / 86400)}d</span>
                </div>
                {loan.status === LoanStatus.ACTIVE && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">REMAINING:</span>
                      <span className={daysRemaining < 3 ? "text-red-500" : ""}>
                        {isExpired ? "EXPIRED" : `${daysRemaining}d ${hoursRemaining}h`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PROGRESS:</span>
                      <span>{Math.min(100, timeProgress).toFixed(1)}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="rounded border border-border bg-card p-4">
              <div className="mb-2 text-muted-foreground">PARTICIPANTS</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BORROWER:</span>
                  <span className="font-mono text-xs">{shortenAddress(loan.borrower)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LENDER:</span>
                  <span className="font-mono text-xs">
                    {loan.lender === "0x0000000000000000000000000000000000000000" 
                      ? "---" 
                      : shortenAddress(loan.lender)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            {loan.status === LoanStatus.OPEN && !isBorrower && isConnected && (
              <Button 
                onClick={handleFund}
                disabled={isFunding || isFundingConfirming || isApproving || isApprovalConfirming}
                className="bg-primary font-mono"
              >
                {(isFunding || isFundingConfirming || isApproving || isApprovalConfirming) 
                  ? "[PROCESSING...]" 
                  : "[FUND_LOAN]"}
              </Button>
            )}
            {loan.status === LoanStatus.OPEN && isBorrower && (
              <Button 
                onClick={handleCancel}
                disabled={isCancelling || isCancelConfirming}
                variant="destructive"
                className="font-mono"
              >
                {(isCancelling || isCancelConfirming) ? "[CANCELLING...]" : "[CANCEL_LOAN]"}
              </Button>
            )}
            {loan.status === LoanStatus.ACTIVE && isBorrower && !isExpired && (
              <Button 
                onClick={handleRepay}
                disabled={isRepaying || isRepayConfirming || isApproving || isApprovalConfirming}
                className="bg-green-600 font-mono hover:bg-green-700"
              >
                {(isRepaying || isRepayConfirming || isApproving || isApprovalConfirming) 
                  ? "[PROCESSING...]" 
                  : "[REPAY_LOAN]"}
              </Button>
            )}
            {canClaimDefault && (
              <Button 
                onClick={handleClaim}
                disabled={isClaiming || isClaimConfirming}
                className="bg-amber-600 font-mono hover:bg-amber-700"
              >
                {(isClaiming || isClaimConfirming) ? "[CLAIMING...]" : "[CLAIM_COLLATERAL]"}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/app">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Loan #{loanId}</h1>
            <p className="text-muted-foreground">
              {loan.status === LoanStatus.ACTIVE && startTime > 0
                ? `Started ${new Date(startTime).toLocaleDateString()}`
                : "Awaiting lender"}
            </p>
          </div>
          <Badge className={cn("ml-auto", getStatusColor(loan.status))}>
            {loan.status === LoanStatus.ACTIVE && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {loan.status === LoanStatus.OPEN && <Clock className="mr-1 h-3 w-3" />}
            {loan.status === LoanStatus.DEFAULTED && <AlertTriangle className="mr-1 h-3 w-3" />}
            {LOAN_STATUS_LABELS[loan.status as LoanStatus]}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Loan Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-sm text-muted-foreground">Collateral</div>
                    <div className="mt-1 text-2xl font-bold">
                      {formatTokenAmount(loan.collateralAmount, collateralToken?.decimals || 18)} {collateralToken?.symbol || "???"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-sm text-muted-foreground">Loan Amount</div>
                    <div className="mt-1 text-2xl font-bold">
                      {formatTokenAmount(loan.loanAmount, loanToken?.decimals || 18)} {loanToken?.symbol || "???"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Borrower receives: {formatTokenAmount(loan.borrowerReceives, loanToken?.decimals || 18)}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-semibold">{Math.floor(Number(loan.duration) / 86400)} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Interest</div>
                    <div className="font-semibold text-green-500">0%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Fee</div>
                    <div className="font-semibold">
                      {formatTokenAmount(loan.originationFee, loanToken?.decimals || 18)} {loanToken?.symbol}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Remaining */}
            {loan.status === LoanStatus.ACTIVE && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Time Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">
                        {isExpired ? "Expired" : `${daysRemaining}d ${hoursRemaining}h`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(endTime).toLocaleDateString()} {new Date(endTime).toLocaleTimeString()}
                      </div>
                    </div>
                    {(isExpired || daysRemaining < 3) && (
                      <Badge variant="destructive" className={isExpired ? "" : "animate-pulse"}>
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {isExpired ? "Expired" : "Expiring Soon"}
                      </Badge>
                    )}
                  </div>
                  <Progress value={Math.min(100, timeProgress)} className="h-3" />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Funded</span>
                    <span>{Math.min(100, timeProgress).toFixed(0)}% elapsed</span>
                    <span>Due</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      Borrower
                      {isBorrower && <Badge variant="secondary" className="text-xs">You</Badge>}
                    </div>
                    <div className="font-mono text-sm">{shortenAddress(loan.borrower)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(loan.borrower)}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <a
                      href={`https://basescan.org/address/${loan.borrower}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
                
                {loan.lender !== "0x0000000000000000000000000000000000000000" ? (
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        Lender
                        {isLender && <Badge variant="secondary" className="text-xs">You</Badge>}
                      </div>
                      <div className="font-mono text-sm">{shortenAddress(loan.lender)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(loan.lender)}
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <a
                        href={`https://basescan.org/address/${loan.lender}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-muted p-4 text-center">
                    <div className="text-muted-foreground">Awaiting Lender</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isConnected && (
                  <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                    Connect your wallet to interact with this loan
                  </div>
                )}
                
                {loan.status === LoanStatus.OPEN && !isBorrower && isConnected && (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleFund}
                    disabled={isFunding || isFundingConfirming || isApproving || isApprovalConfirming}
                  >
                    {(isFunding || isFundingConfirming || isApproving || isApprovalConfirming) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Fund This Loan
                  </Button>
                )}

                {loan.status === LoanStatus.OPEN && isBorrower && (
                  <Button 
                    variant="destructive"
                    className="w-full" 
                    size="lg"
                    onClick={handleCancel}
                    disabled={isCancelling || isCancelConfirming}
                  >
                    {(isCancelling || isCancelConfirming) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cancel Loan
                  </Button>
                )}

                {loan.status === LoanStatus.ACTIVE && isBorrower && !isExpired && (
                  <>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      size="lg"
                      onClick={handleRepay}
                      disabled={isRepaying || isRepayConfirming || isApproving || isApprovalConfirming}
                    >
                      {(isRepaying || isRepayConfirming || isApproving || isApprovalConfirming) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Repay Loan
                    </Button>
                    <div className="rounded-lg bg-green-500/10 p-3 text-center text-sm text-green-600">
                      Repay {formatTokenAmount(loan.loanAmount, loanToken?.decimals || 18)} {loanToken?.symbol} to reclaim your collateral
                    </div>
                  </>
                )}

                {canClaimDefault && (
                  <>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700" 
                      size="lg"
                      onClick={handleClaim}
                      disabled={isClaiming || isClaimConfirming}
                    >
                      {(isClaiming || isClaimConfirming) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Claim Collateral
                    </Button>
                    <div className="rounded-lg bg-amber-500/10 p-3 text-center text-sm text-amber-600">
                      Loan expired. Claim {formatTokenAmount(loan.collateralAmount, collateralToken?.decimals || 18)} {collateralToken?.symbol} collateral
                    </div>
                  </>
                )}

                {loan.status === LoanStatus.REPAID && (
                  <div className="rounded-lg bg-emerald-500/10 p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                    <div className="font-semibold text-emerald-600">Loan Repaid</div>
                    <div className="text-sm text-muted-foreground">
                      Collateral returned to borrower
                    </div>
                  </div>
                )}

                {loan.status === LoanStatus.DEFAULTED && (
                  <div className="rounded-lg bg-red-500/10 p-4 text-center">
                    <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
                    <div className="font-semibold text-red-600">Loan Defaulted</div>
                    <div className="text-sm text-muted-foreground">
                      Collateral transferred to lender
                    </div>
                  </div>
                )}

                {loan.status === LoanStatus.CANCELLED && (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="font-semibold">Loan Cancelled</div>
                    <div className="text-sm text-muted-foreground">
                      Collateral returned to borrower
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This is a zero-interest pawn loan. The borrower has deposited collateral and is 
                  seeking a loan in exchange.
                </p>
                <p>
                  If the borrower repays before the deadline, they get their collateral back. 
                  If they don&apos;t repay in time, the lender can claim the collateral.
                </p>
                <Separator />
                <div className="text-xs">
                  No liquidation risk. No margin calls. Simple deadline-based mechanics.
                </div>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Contract
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span>Base</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-mono text-xs">{shortenAddress(PAWN_PLATFORM_ADDRESS)}</span>
                </div>
                <a
                  href={`https://basescan.org/address/${PAWN_PLATFORM_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on BaseScan
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

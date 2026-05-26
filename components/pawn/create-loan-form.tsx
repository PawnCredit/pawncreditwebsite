'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useApp } from '@/lib/app-context'
import { 
  TOKENS, 
  type TokenInfo, 
  getTierByBalance, 
  PAWN_PLATFORM_ADDRESS,
  PAWN_TOKEN_ADDRESS,
  PAWN_TOKEN_COMING_SOON
} from '@/lib/web3-config'
import { 
  useTokenBalance, 
  useTokenAllowance, 
  useApproveToken, 
  useCreateLoanOffer,
  useOriginationFee,
  useUserTier,
  parseTokenAmount,
  formatTokenAmount
} from '@/lib/contract-hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TierMeter } from './tier-meter'
import { cn } from '@/lib/utils'
import { AlertCircle, ArrowRight, Info, Plus, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import { base } from 'wagmi/chains'

interface CreateLoanFormProps {
  className?: string
}

// Filter out PAWN if coming soon, and don't allow it as collateral/loan token
const TOKEN_LIST = Object.values(TOKENS).filter(t => 
  !(t.symbol === 'PAWN' && PAWN_TOKEN_COMING_SOON)
)

export function CreateLoanForm({ className }: CreateLoanFormProps) {
  const { viewMode } = useApp()
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  
  // Form state
  const [collateralToken, setCollateralToken] = useState<TokenInfo>(TOKENS.WETH)
  const [collateralAmount, setCollateralAmount] = useState('')
  const [loanToken, setLoanToken] = useState<TokenInfo>(TOKENS.USDC)
  const [loanAmount, setLoanAmount] = useState('')
  const [duration, setDuration] = useState(30)
  const [customTokenAddress, setCustomTokenAddress] = useState('')
  const [showCustomToken, setShowCustomToken] = useState(false)
  
  // Contract hooks
  const { data: pawnBalance } = useTokenBalance(
    PAWN_TOKEN_COMING_SOON ? undefined : PAWN_TOKEN_ADDRESS as `0x${string}`,
    address
  )
  const { data: collateralBalance } = useTokenBalance(
    collateralToken.address,
    address
  )
  const { data: allowance } = useTokenAllowance(
    collateralToken.address,
    address,
    PAWN_PLATFORM_ADDRESS
  )
  const { data: userTier } = useUserTier(address)
  const { data: originationFeeBps } = useOriginationFee(address)
  
  const { approve, isPending: isApproving, isConfirming: isApprovalConfirming, isSuccess: approvalSuccess, hash: approveHash } = useApproveToken()
  const { createLoan, isPending: isCreating, isConfirming: isLoanConfirming, isSuccess: loanSuccess, hash: loanHash } = useCreateLoanOffer()
  
  // Mock PAWN balance for demo if token not deployed
  const pawnBalanceDisplay = PAWN_TOKEN_COMING_SOON 
    ? 450 
    : pawnBalance 
      ? Number(formatTokenAmount(pawnBalance, 18)) 
      : 0
  
  const currentTier = getTierByBalance(pawnBalanceDisplay)
  const actualFeeBps = originationFeeBps ? Number(originationFeeBps) : currentTier.feeBps
  
  // Parse amounts
  const collateralAmountParsed = parseTokenAmount(collateralAmount, collateralToken.decimals)
  const loanAmountParsed = parseTokenAmount(loanAmount, loanToken.decimals)
  const durationSeconds = BigInt(duration * 24 * 60 * 60)
  
  // Calculate preview values
  const loanAmountNum = parseFloat(loanAmount) || 0
  const fee = (loanAmountNum * actualFeeBps) / 10000
  const borrowerReceives = loanAmountNum - fee
  
  // Check if approval needed
  const needsApproval = allowance !== undefined && collateralAmountParsed > 0n && allowance < collateralAmountParsed
  
  // Check balance
  const collateralBalanceNum = collateralBalance ? Number(formatTokenAmount(collateralBalance, collateralToken.decimals)) : 0
  const hasInsufficientBalance = parseFloat(collateralAmount) > collateralBalanceNum

  const isWrongNetwork = chainId !== base.id

  const handleApprove = useCallback(async () => {
    if (!isConnected || !collateralAmountParsed) return
    await approve(collateralToken.address, PAWN_PLATFORM_ADDRESS, collateralAmountParsed)
  }, [isConnected, collateralAmountParsed, collateralToken.address, approve])

  const handleCreateLoan = useCallback(async () => {
    if (!isConnected || needsApproval) return
    await createLoan(
      collateralToken.address,
      collateralAmountParsed,
      loanToken.address,
      loanAmountParsed,
      durationSeconds
    )
  }, [isConnected, needsApproval, collateralToken.address, collateralAmountParsed, loanToken.address, loanAmountParsed, durationSeconds, createLoan])

  const isValid = 
    collateralAmount && 
    parseFloat(collateralAmount) > 0 && 
    loanAmount && 
    parseFloat(loanAmount) > 0 &&
    collateralToken.address !== loanToken.address &&
    !hasInsufficientBalance

  const isLoading = isApproving || isApprovalConfirming || isCreating || isLoanConfirming

  if (viewMode === 'advanced') {
    return (
      <CreateLoanFormTerminal 
        className={className}
        pawnBalance={pawnBalanceDisplay}
      />
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tier Status */}
      <TierMeter balance={pawnBalanceDisplay} />

      {/* Form */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Create Loan Offer</h2>

        {/* Network Warning */}
        {isConnected && isWrongNetwork && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-[var(--pawn-amber)]/10 p-3 border border-[var(--pawn-amber)]/30">
            <div className="flex items-center gap-2 text-[var(--pawn-amber)]">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Please switch to Base network</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => switchChain({ chainId: base.id })}
              className="border-[var(--pawn-amber)]/50 text-[var(--pawn-amber)] hover:bg-[var(--pawn-amber)]/10"
            >
              Switch Network
            </Button>
          </div>
        )}
        
        {/* Collateral Section */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Collateral</Label>
            {isConnected && (
              <span className="text-xs text-muted-foreground">
                Balance: {collateralBalanceNum.toLocaleString()} {collateralToken.symbol}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Select 
              value={collateralToken.address}
              onValueChange={(addr) => {
                const token = TOKEN_LIST.find(t => t.address === addr)
                if (token) setCollateralToken(token)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOKEN_LIST.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
          {hasInsufficientBalance && (
            <p className="text-xs text-destructive">Insufficient balance</p>
          )}
          {showCustomToken && (
            <Input
              placeholder="Custom token address (0x...)"
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              className="font-mono text-xs"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowCustomToken(!showCustomToken)}
          >
            <Plus className="mr-1 h-3 w-3" />
            {showCustomToken ? 'Hide custom token' : 'Use custom token'}
          </Button>
        </div>

        {/* Arrow */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-secondary p-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Loan Section */}
        <div className="mb-6 space-y-3">
          <Label className="text-sm font-medium">Requesting</Label>
          <div className="flex gap-2">
            <Select 
              value={loanToken.address}
              onValueChange={(addr) => {
                const token = TOKEN_LIST.find(t => t.address === addr)
                if (token) setLoanToken(token)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOKEN_LIST.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Duration</Label>
            <span className="text-sm font-medium">{duration} days</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={([val]) => setDuration(val)}
            min={7}
            max={90}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>7 days</span>
            <span>90 days</span>
          </div>
        </div>

        {/* Same Token Warning */}
        {collateralToken.address === loanToken.address && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs">Collateral and loan tokens must be different.</p>
          </div>
        )}

        {/* Preview */}
        {loanAmountNum > 0 && (
          <div className="mb-6 rounded-lg bg-secondary/50 p-4">
            <h3 className="mb-3 text-sm font-medium">Transaction Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="font-mono">{loanAmountNum.toLocaleString()} {loanToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Platform Fee ({actualFeeBps / 100}%)
                </span>
                <span className="font-mono text-destructive">-{fee.toFixed(4)} {loanToken.symbol}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-medium">
                  <span>You Receive</span>
                  <span className="font-mono text-[var(--pawn-green)]">
                    {borrowerReceives.toLocaleString()} {loanToken.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-[var(--pawn-blue)]/10 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pawn-blue)]" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Zero interest.</strong> If you fail to repay by the deadline, 
            you lose your collateral. No additional penalties or fees.
          </p>
        </div>

        {/* Transaction Status */}
        {(approveHash || loanHash) && (
          <div className="mb-6 rounded-lg border border-[var(--pawn-green)]/30 bg-[var(--pawn-green)]/5 p-3">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--pawn-green)]" />
              ) : (
                <CheckCircle className="h-4 w-4 text-[var(--pawn-green)]" />
              )}
              <span className="text-sm text-[var(--pawn-green)]">
                {isApprovalConfirming && 'Confirming approval...'}
                {isLoanConfirming && 'Confirming loan creation...'}
                {approvalSuccess && !loanHash && 'Approval confirmed! Now create loan.'}
                {loanSuccess && 'Loan created successfully!'}
              </span>
            </div>
            {(approveHash || loanHash) && (
              <a 
                href={`https://basescan.org/tx/${loanHash || approveHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                View on Basescan
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Submit */}
        {!isConnected ? (
          <Button className="w-full" size="lg" disabled>
            Connect Wallet
          </Button>
        ) : isWrongNetwork ? (
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => switchChain({ chainId: base.id })}
          >
            Switch to Base
          </Button>
        ) : needsApproval ? (
          <Button 
            className="w-full" 
            size="lg"
            disabled={!isValid || isLoading}
            onClick={handleApprove}
          >
            {isApproving || isApprovalConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isApproving ? 'Approving...' : 'Confirming...'}
              </>
            ) : (
              `Approve ${collateralToken.symbol}`
            )}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            size="lg"
            disabled={!isValid || isLoading}
            onClick={handleCreateLoan}
          >
            {isCreating || isLoanConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreating ? 'Creating...' : 'Confirming...'}
              </>
            ) : (
              'Create Loan Offer'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function CreateLoanFormTerminal({ className, pawnBalance }: { className?: string; pawnBalance: number }) {
  const [collateral, setCollateral] = useState('WETH')
  const [collateralAmt, setCollateralAmt] = useState('')
  const [loan, setLoan] = useState('USDC')
  const [loanAmt, setLoanAmt] = useState('')
  const [duration, setDuration] = useState('30')
  
  const currentTier = getTierByBalance(pawnBalance)
  const loanAmountNum = parseFloat(loanAmt) || 0
  const fee = (loanAmountNum * currentTier.feeBps) / 10000
  const borrowerReceives = loanAmountNum - fee

  return (
    <div className={cn('font-mono text-xs', className)}>
      <div className="mb-4 border-b border-border pb-2">
        <span className="text-[var(--pawn-amber)]">CREATE_LOAN_OFFER</span>
      </div>

      <TierMeter balance={pawnBalance} className="mb-4" />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-24 text-muted-foreground">COLLATERAL:</span>
          <input
            type="text"
            value={collateral}
            onChange={(e) => setCollateral(e.target.value.toUpperCase())}
            className="w-16 bg-transparent text-foreground outline-none"
          />
          <input
            type="text"
            value={collateralAmt}
            onChange={(e) => setCollateralAmt(e.target.value)}
            placeholder="0.00"
            className="w-20 bg-transparent text-[var(--pawn-green)] outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-muted-foreground">LOAN_TOKEN:</span>
          <input
            type="text"
            value={loan}
            onChange={(e) => setLoan(e.target.value.toUpperCase())}
            className="w-16 bg-transparent text-foreground outline-none"
          />
          <input
            type="text"
            value={loanAmt}
            onChange={(e) => setLoanAmt(e.target.value)}
            placeholder="0.00"
            className="w-20 bg-transparent text-[var(--pawn-green)] outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-muted-foreground">DURATION_D:</span>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-16 bg-transparent text-foreground outline-none"
          />
        </div>
      </div>

      {loanAmountNum > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="text-[var(--pawn-amber)]">PREVIEW:</div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">LOAN_AMT:</span>
              <span className="text-foreground">{loanAmountNum.toFixed(2)} {loan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">FEE ({currentTier.feeBps}bps):</span>
              <span className="text-destructive">-{fee.toFixed(4)} {loan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">RECEIVE:</span>
              <span className="text-[var(--pawn-green)]">{borrowerReceives.toFixed(4)} {loan}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <button className="w-full bg-[var(--pawn-green)] px-4 py-2 text-background hover:opacity-90">
          [SUBMIT_LOAN_OFFER]
        </button>
      </div>
    </div>
  )
}

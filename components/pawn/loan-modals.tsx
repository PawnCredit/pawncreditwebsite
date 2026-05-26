'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TOKENS, type TokenInfo, LoanStatus, getTierByBalance } from '@/lib/web3-config'
import { cn } from '@/lib/utils'
import { AlertCircle, Clock, Shield, Coins, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

interface Loan {
  id: number
  borrower: string
  collateralToken: TokenInfo
  collateralAmount: number
  loanToken: TokenInfo
  loanAmount: number
  borrowerReceives: number
  duration: number
  status: LoanStatus
  ltv: number
}

interface FundLoanModalProps {
  loan: Loan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FundLoanModal({ loan, open, onOpenChange }: FundLoanModalProps) {
  const { address, isConnected } = useAccount()
  const [step, setStep] = useState<'preview' | 'approving' | 'funding' | 'success'>('preview')
  
  if (!loan) return null

  const durationDays = Math.floor(loan.duration / (24 * 60 * 60))
  const isOwner = address?.toLowerCase() === loan.borrower.toLowerCase()

  const handleFund = async () => {
    setStep('approving')
    // Simulate approval
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStep('funding')
    // Simulate funding
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStep('success')
  }

  const handleClose = () => {
    setStep('preview')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'success' ? (
          <>
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--pawn-green)]/10">
                <CheckCircle className="h-8 w-8 text-[var(--pawn-green)]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">Loan Funded!</h2>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully funded loan #{loan.id}. The borrower will now repay {loan.loanAmount.toLocaleString()} {loan.loanToken.symbol} before the deadline.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Fund Loan #{loan.id}</DialogTitle>
              <DialogDescription>
                Review the loan details before funding.
              </DialogDescription>
            </DialogHeader>

            {/* Loan Summary */}
            <div className="space-y-4 py-4">
              {/* Token Flow */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                    {loan.loanToken.symbol.slice(0, 2)}
                  </div>
                  <p className="text-xs text-muted-foreground">You Send</p>
                  <p className="font-mono text-sm font-medium">
                    {loan.loanAmount.toLocaleString()} {loan.loanToken.symbol}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {loan.collateralToken.symbol.slice(0, 2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Collateral</p>
                  <p className="font-mono text-sm font-medium">
                    {loan.collateralAmount} {loan.collateralToken.symbol}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <Clock className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-mono text-sm font-medium">{durationDays} days</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <Shield className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">LTV</p>
                  <p className="font-mono text-sm font-medium">{loan.ltv}%</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <Coins className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Repayment</p>
                  <p className="font-mono text-sm font-medium">{loan.loanAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* What Happens */}
              <div className="rounded-lg bg-secondary/30 p-3">
                <h4 className="mb-2 text-sm font-medium">What happens next:</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>1. Your {loan.loanAmount.toLocaleString()} {loan.loanToken.symbol} goes to the borrower</li>
                  <li>2. Their collateral is locked in escrow</li>
                  <li>3. If repaid on time: you get {loan.loanAmount.toLocaleString()} {loan.loanToken.symbol} back</li>
                  <li>4. If defaulted: you receive {loan.collateralAmount} {loan.collateralToken.symbol} (minus 1% fee)</li>
                </ul>
              </div>

              {/* Warning for owner */}
              {isOwner && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-xs">You cannot fund your own loan.</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              {step === 'approving' && (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving {loan.loanToken.symbol}...
                </Button>
              )}
              {step === 'funding' && (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Funding Loan...
                </Button>
              )}
              {step === 'preview' && (
                <>
                  <Button 
                    onClick={handleFund} 
                    disabled={!isConnected || isOwner}
                    className="w-full"
                  >
                    Fund Loan
                  </Button>
                  <Button variant="ghost" onClick={handleClose} className="w-full">
                    Cancel
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface RepayLoanModalProps {
  loan: Loan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RepayLoanModal({ loan, open, onOpenChange }: RepayLoanModalProps) {
  const [step, setStep] = useState<'preview' | 'approving' | 'repaying' | 'success'>('preview')
  
  if (!loan) return null

  const handleRepay = async () => {
    setStep('approving')
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStep('repaying')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStep('success')
  }

  const handleClose = () => {
    setStep('preview')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'success' ? (
          <>
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--pawn-green)]/10">
                <CheckCircle className="h-8 w-8 text-[var(--pawn-green)]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">Loan Repaid!</h2>
              <p className="text-sm text-muted-foreground">
                Your collateral of {loan.collateralAmount} {loan.collateralToken.symbol} has been returned to your wallet.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Repay Loan #{loan.id}</DialogTitle>
              <DialogDescription>
                Repay your loan to reclaim your collateral.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">Repayment Amount</span>
                  <span className="font-mono font-medium">
                    {loan.loanAmount.toLocaleString()} {loan.loanToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You Receive Back</span>
                  <span className="font-mono font-medium text-[var(--pawn-green)]">
                    {loan.collateralAmount} {loan.collateralToken.symbol}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              {step === 'approving' && (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </Button>
              )}
              {step === 'repaying' && (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Repaying...
                </Button>
              )}
              {step === 'preview' && (
                <>
                  <Button onClick={handleRepay} className="w-full">
                    Repay {loan.loanAmount.toLocaleString()} {loan.loanToken.symbol}
                  </Button>
                  <Button variant="ghost" onClick={handleClose} className="w-full">
                    Cancel
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

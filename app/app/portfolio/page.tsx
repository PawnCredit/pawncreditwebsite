'use client'

import { Portfolio } from '@/components/pawn/portfolio'
import { useApp } from '@/lib/app-context'
import { useAccount } from 'wagmi'
import { cn } from '@/lib/utils'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PortfolioPage() {
  const { viewMode } = useApp()
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Wallet className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Connect Your Wallet</h2>
        <p className="mb-6 max-w-sm text-muted-foreground">
          Connect your wallet to view your loan positions and manage your portfolio.
        </p>
        <Button>Connect Wallet</Button>
      </div>
    )
  }

  return (
    <div className={cn(
      viewMode === 'advanced' && 'terminal-grid rounded-lg border border-border bg-card p-4'
    )}>
      {viewMode === 'advanced' && (
        <div className="mb-4 border-b border-border pb-2 font-mono text-xs">
          <span className="text-[var(--pawn-amber)]">PAWN.CREDIT</span>
          <span className="ml-4 text-[var(--pawn-green)]">PORTFOLIO_VIEW</span>
        </div>
      )}

      {viewMode === 'simple' && (
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your active loans, track repayments, and claim collateral.
          </p>
        </div>
      )}

      <Portfolio />
    </div>
  )
}

'use client'

import { LoanMarket } from '@/components/pawn/loan-market'
import { TierMeter } from '@/components/pawn/tier-meter'
import { useApp } from '@/lib/app-context'
import { cn } from '@/lib/utils'

export default function MarketPage() {
  const { viewMode } = useApp()
  const pawnBalance = 450 // Mock balance

  return (
    <div className={cn(
      viewMode === 'advanced' && 'terminal-grid rounded-lg border border-border bg-card p-4'
    )}>
      {viewMode === 'advanced' && (
        <div className="mb-4 border-b border-border pb-2 font-mono text-xs">
          <span className="text-[var(--pawn-amber)]">PAWN.CREDIT</span>
          <span className="ml-4 text-[var(--pawn-green)]">MARKET_VIEW</span>
          <span className="ml-4 text-muted-foreground">
            {new Date().toISOString().split('T')[0]}
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <TierMeter balance={pawnBalance} className="mb-4" />
          
          {viewMode === 'simple' && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-medium">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Open Offers</span>
                  <span className="font-mono font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Loans</span>
                  <span className="font-mono font-medium">34</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Volume</span>
                  <span className="font-mono font-medium">$847K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Duration</span>
                  <span className="font-mono font-medium">21 days</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className={cn(
            viewMode === 'simple' && 'rounded-xl border border-border bg-card p-4'
          )}>
            {viewMode === 'simple' && (
              <h2 className="mb-4 text-lg font-semibold">Available Loans</h2>
            )}
            <LoanMarket />
          </div>
        </div>
      </div>
    </div>
  )
}

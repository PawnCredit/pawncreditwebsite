'use client'

import { LoanMarket } from '@/components/pawn/loan-market'
import { useApp } from '@/lib/app-context'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'

export default function LendPage() {
  const { viewMode } = useApp()

  return (
    <div className={cn(
      viewMode === 'advanced' && 'terminal-grid rounded-lg border border-border bg-card p-4'
    )}>
      {viewMode === 'advanced' && (
        <div className="mb-4 border-b border-border pb-2 font-mono text-xs">
          <span className="text-[var(--pawn-amber)]">PAWN.CREDIT</span>
          <span className="ml-4 text-[var(--pawn-green)]">LEND_MODULE</span>
        </div>
      )}

      {viewMode === 'simple' && (
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold">Lend</h1>
          <p className="mb-4 text-muted-foreground">
            Browse loan offers and fund borrowers. Earn collateral if they default.
          </p>
          
          {/* Info Card */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-[var(--pawn-blue)]/5 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--pawn-blue)]" />
            <div className="text-sm">
              <p className="mb-1 font-medium">How lending works</p>
              <p className="text-muted-foreground">
                When you fund a loan, your tokens go to the borrower. If they repay on time, 
                you get your tokens back. If they default, you receive their locked collateral 
                (minus a 1% platform fee).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        viewMode === 'simple' && 'rounded-xl border border-border bg-card p-4'
      )}>
        {viewMode === 'simple' && (
          <h2 className="mb-4 text-lg font-semibold">Open Loan Offers</h2>
        )}
        <LoanMarket />
      </div>
    </div>
  )
}

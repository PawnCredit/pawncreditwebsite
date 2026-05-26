'use client'

import { TIERS, getTierByBalance, getNextTier, PAWN_TOKEN_COMING_SOON } from '@/lib/web3-config'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/app-context'
import { Sparkles } from 'lucide-react'

interface TierMeterProps {
  balance: number
  className?: string
  compact?: boolean
}

export function TierMeter({ balance, className, compact = false }: TierMeterProps) {
  const { viewMode } = useApp()
  const currentTier = getTierByBalance(balance)
  const nextTier = getNextTier(balance)
  
  // Calculate progress percentage
  const maxBalance = TIERS.GOLD.threshold
  const progressPercent = Math.min((balance / maxBalance) * 100, 100)
  
  // Calculate tier marker positions
  const bronzePosition = 0
  const silverPosition = (TIERS.SILVER.threshold / maxBalance) * 100
  const goldPosition = 100

  if (viewMode === 'advanced') {
    return <TierMeterTerminal balance={balance} className={className} />
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className={cn(
          'flex h-6 items-center justify-center rounded-full px-3 text-xs font-semibold text-white',
          currentTier.name === 'Gold' && 'tier-gold',
          currentTier.name === 'Silver' && 'tier-silver',
          currentTier.name === 'Bronze' && 'tier-bronze'
        )}>
          {currentTier.name}
        </div>
        <span className="text-xs text-muted-foreground">
          {currentTier.feeBps / 100}% fee
        </span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Loyalty Tier</h3>
        <div className={cn(
          'flex h-6 items-center justify-center rounded-full px-3 text-xs font-semibold text-white',
          currentTier.name === 'Gold' && 'tier-gold',
          currentTier.name === 'Silver' && 'tier-silver',
          currentTier.name === 'Bronze' && 'tier-bronze'
        )}>
          {currentTier.name}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-2 h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
            currentTier.name === 'Gold' && 'tier-gold',
            currentTier.name === 'Silver' && 'tier-silver',
            currentTier.name === 'Bronze' && 'tier-bronze'
          )}
          style={{ width: `${progressPercent}%` }}
        />
        
        {/* Tier Markers */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-border" 
          style={{ left: `${silverPosition}%` }}
        />
        <div 
          className="absolute top-0 h-full w-0.5 bg-border" 
          style={{ left: `${goldPosition}%` }}
        />
      </div>

      {/* Tier Labels */}
      <div className="relative mb-4 flex text-[10px]">
        <span 
          className="absolute rounded-full px-2 py-0.5 text-white tier-bronze" 
          style={{ left: `${bronzePosition}%` }}
        >
          Bronze
        </span>
        <span 
          className="absolute rounded-full px-2 py-0.5 text-white tier-silver" 
          style={{ left: `${silverPosition}%`, transform: 'translateX(-50%)' }}
        >
          Silver
        </span>
        <span 
          className="absolute rounded-full px-2 py-0.5 text-white tier-gold" 
          style={{ right: 0 }}
        >
          Gold
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Your $PAWN</p>
          <p className="font-mono text-lg font-semibold">{balance.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Fee Rate</p>
          <p className="font-mono text-lg font-semibold text-[var(--pawn-green)]">
            {(currentTier.feeBps / 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Next Tier CTA */}
      {nextTier && (
        <div className="mt-4 rounded-lg bg-secondary/50 p-3">
          <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span>Hold</span>
            <span className="font-semibold text-foreground">{nextTier.tokensNeeded.toLocaleString()}</span>
            <span>more $PAWN to unlock</span>
            <span className={cn(
              'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-white',
              nextTier.tier.name === 'Gold' && 'tier-gold',
              nextTier.tier.name === 'Silver' && 'tier-silver'
            )}>
              {nextTier.tier.name}
            </span>
            <span>and save {((currentTier.feeBps - nextTier.tier.feeBps) / currentTier.feeBps * 100).toFixed(0)}% on fees</span>
          </p>
        </div>
      )}

      {/* Coming Soon Badge */}
      {PAWN_TOKEN_COMING_SOON && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--pawn-amber)]/10 border border-[var(--pawn-amber)]/20 p-3">
          <Sparkles className="h-4 w-4 text-[var(--pawn-amber)]" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-[var(--pawn-amber)]">$PAWN Token Coming Soon</span>
            {' - '}Hold tokens to unlock lower fees
          </p>
        </div>
      )}
    </div>
  )
}

function TierMeterTerminal({ balance, className }: { balance: number; className?: string }) {
  const currentTier = getTierByBalance(balance)
  const nextTier = getNextTier(balance)
  const maxBalance = TIERS.GOLD.threshold
  const progressPercent = Math.min((balance / maxBalance) * 100, 100)

  const barWidth = 30
  const filledBars = Math.round((progressPercent / 100) * barWidth)
  const emptyBars = barWidth - filledBars

  return (
    <div className={cn('font-mono text-xs', className)}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[var(--pawn-amber)]">TIER_STATUS</span>
        <span className={cn(
          'rounded-full px-2 py-0.5 text-xs text-white',
          currentTier.name === 'Gold' && 'tier-gold',
          currentTier.name === 'Silver' && 'tier-silver',
          currentTier.name === 'Bronze' && 'tier-bronze'
        )}>
          {currentTier.name.toUpperCase()}
        </span>
      </div>
      <div className="mb-1">
        <span className="text-muted-foreground">$PAWN: </span>
        <span className="text-[var(--pawn-green)]">{balance.toLocaleString()}</span>
      </div>
      <div className="mb-1">
        <span className="text-muted-foreground">FEE_BPS: </span>
        <span className="text-[var(--pawn-green)]">{currentTier.feeBps}</span>
        <span className="text-muted-foreground"> ({(currentTier.feeBps / 100).toFixed(2)}%)</span>
      </div>
      <div className="mb-2">
        [<span className="text-[var(--pawn-green)]">{'█'.repeat(filledBars)}</span>
        <span className="text-muted-foreground">{'░'.repeat(emptyBars)}</span>]
        <span className="ml-2 text-muted-foreground">{progressPercent.toFixed(1)}%</span>
      </div>
      {nextTier && (
        <div className="flex items-center gap-2 text-[var(--pawn-amber)]">
          <span>+{nextTier.tokensNeeded.toLocaleString()} $PAWN</span>
          <span>→</span>
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs text-white',
            nextTier.tier.name === 'Gold' && 'tier-gold',
            nextTier.tier.name === 'Silver' && 'tier-silver'
          )}>
            {nextTier.tier.name.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

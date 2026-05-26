'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, Activity, Users, Coins, Clock, Loader2 } from 'lucide-react'
import { usePlatformStats, formatTokenAmount } from '@/lib/contract-hooks'

interface PlatformStatsProps {
  className?: string
  showEmpty?: boolean // If false, hides when no data
}

export function PlatformStats({ className, showEmpty = false }: PlatformStatsProps) {
  const { stats, isLoading } = usePlatformStats()

  // Don't show anything if there's no activity (per user request)
  const hasActivity = stats.totalLoansCreated > 0
  if (!showEmpty && !hasActivity && !isLoading) {
    return null
  }

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-4 w-4 rounded bg-muted" />
            </div>
            <div className="h-8 w-16 rounded bg-muted mb-1" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      <StatCard
        label="Total Loans"
        value={stats.totalLoansCreated.toString()}
        icon={<Coins className="h-4 w-4" />}
      />
      <StatCard
        label="Active Loans"
        value={stats.activeLoans.toString()}
        icon={<Activity className="h-4 w-4" />}
        highlight
      />
      <StatCard
        label="Open Offers"
        value={stats.openLoans.toString()}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        label="Completed"
        value={stats.completedLoans.toString()}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  change?: number
  icon: React.ReactNode
  highlight?: boolean
}

function StatCard({ label, value, change, icon, highlight }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-4',
      highlight && 'border-primary bg-primary/5'
    )}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted-foreground">{icon}</span>
        {change !== undefined && (
          <span className={cn(
            'flex items-center gap-1 text-xs font-medium',
            change >= 0 ? 'text-[var(--pawn-green)]' : 'text-destructive'
          )}>
            <TrendingUp className="h-3 w-3" />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

interface ProtocolMetricsProps {
  className?: string
}

export function ProtocolMetrics({ className }: ProtocolMetricsProps) {
  const { stats, isLoading } = usePlatformStats()

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
        <h3 className="mb-4 font-medium">Protocol Metrics</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <h3 className="mb-4 font-medium">Protocol Metrics</h3>
      <div className="space-y-4">
        <MetricRow label="Total Loans Created" value={stats.totalLoansCreated.toString()} />
        <MetricRow label="Active Loans" value={stats.activeLoans.toString()} valueColor="green" />
        <MetricRow label="Open Offers" value={stats.openLoans.toString()} />
        <MetricRow label="Loans Completed" value={stats.completedLoans.toString()} />
        <MetricRow label="Platform Fee" value="0.5%" valueColor="amber" />
      </div>
    </div>
  )
}

function MetricRow({ 
  label, 
  value, 
  valueColor 
}: { 
  label: string
  value: string
  valueColor?: 'green' | 'amber' | 'red'
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        'font-mono font-medium',
        valueColor === 'green' && 'text-[var(--pawn-green)]',
        valueColor === 'amber' && 'text-[var(--pawn-amber)]',
        valueColor === 'red' && 'text-destructive'
      )}>
        {value}
      </span>
    </div>
  )
}

// Keeping this for future use if needed
export function TokenPriceTicker({ className }: { className?: string }) {
  // This would integrate with a price feed in production
  return null
}

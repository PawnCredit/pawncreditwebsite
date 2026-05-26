'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/app-context'
import { TOKENS, LoanStatus, LOAN_STATUS_LABELS, getTierByBalance } from '@/lib/web3-config'
import { cn } from '@/lib/utils'

// Mock market data
const MARKET_DATA = [
  { symbol: 'WETH', price: 3245.67, change: 2.34, volume: '1.2M' },
  { symbol: 'USDC', price: 1.00, change: 0.01, volume: '890K' },
  { symbol: 'DAI', price: 0.9998, change: -0.02, volume: '450K' },
  { symbol: 'PAWN', price: 0.0234, change: 5.67, volume: '2.1M' },
]

const RECENT_ACTIVITY = [
  { type: 'FUND', id: 45, token: 'USDC', amount: 5000, time: '2m ago' },
  { type: 'CREATE', id: 46, token: 'WETH', amount: 2.5, time: '5m ago' },
  { type: 'REPAY', id: 42, token: 'USDC', amount: 3000, time: '12m ago' },
  { type: 'CLAIM', id: 38, token: 'WETH', amount: 1.2, time: '23m ago' },
  { type: 'CREATE', id: 47, token: 'DAI', amount: 8000, time: '31m ago' },
]

interface TerminalDashboardProps {
  className?: string
}

export function TerminalDashboard({ className }: TerminalDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const pawnBalance = 450

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={cn('terminal-grid min-h-screen bg-background p-4 font-mono text-xs', className)}>
      {/* Header Bar */}
      <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-4">
          <span className="text-[var(--pawn-amber)] text-sm font-bold">PAWN.CREDIT</span>
          <span className="text-[var(--pawn-green)]">TERMINAL v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">BASE_CHAIN</span>
          <span className="text-[var(--pawn-green)]">{currentTime.toISOString()}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Market Data Panel */}
        <div className="col-span-4 border border-border p-3">
          <div className="mb-2 text-[var(--pawn-amber)]">MARKET_DATA</div>
          <div className="mb-2 grid grid-cols-4 gap-2 text-muted-foreground">
            <span>SYM</span>
            <span>PRICE</span>
            <span>CHG%</span>
            <span>VOL</span>
          </div>
          {MARKET_DATA.map((token) => (
            <div key={token.symbol} className="grid grid-cols-4 gap-2 py-0.5">
              <span className="text-foreground">{token.symbol}</span>
              <span className="text-[var(--pawn-green)]">${token.price.toLocaleString()}</span>
              <span className={token.change >= 0 ? 'text-[var(--pawn-green)]' : 'text-destructive'}>
                {token.change >= 0 ? '+' : ''}{token.change}%
              </span>
              <span className="text-muted-foreground">{token.volume}</span>
            </div>
          ))}
        </div>

        {/* Order Book Panel */}
        <div className="col-span-4 border border-border p-3">
          <div className="mb-2 text-[var(--pawn-amber)]">OPEN_ORDERS</div>
          <div className="mb-2 grid grid-cols-5 gap-1 text-muted-foreground">
            <span>ID</span>
            <span>COLL</span>
            <span>LOAN</span>
            <span>DUR</span>
            <span>ACT</span>
          </div>
          <div className="space-y-0.5">
            <OrderRow id={1} coll="2.5 WETH" loan="5K USDC" dur="30d" />
            <OrderRow id={2} coll="10K DAI" loan="3 WETH" dur="14d" />
            <OrderRow id={4} coll="8K USDC" loan="2.5 WETH" dur="60d" />
            <OrderRow id={6} coll="1.5 WETH" loan="3K USDC" dur="7d" />
            <OrderRow id={8} coll="5K DAI" loan="1.5 WETH" dur="21d" />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="col-span-4 border border-border p-3">
          <div className="mb-2 text-[var(--pawn-amber)]">ACTIVITY_FEED</div>
          <div className="space-y-1">
            {RECENT_ACTIVITY.map((activity, i) => (
              <div key={i} className="flex items-center justify-between">
                <span>
                  <span className={cn(
                    activity.type === 'FUND' && 'text-[var(--pawn-green)]',
                    activity.type === 'CREATE' && 'text-[var(--pawn-blue)]',
                    activity.type === 'REPAY' && 'text-[var(--pawn-amber)]',
                    activity.type === 'CLAIM' && 'text-destructive',
                  )}>
                    {activity.type}
                  </span>
                  <span className="ml-2 text-muted-foreground">#{activity.id}</span>
                  <span className="ml-2 text-foreground">{activity.amount} {activity.token}</span>
                </span>
                <span className="text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="col-span-6 border border-border p-3">
          <div className="mb-2 text-[var(--pawn-amber)]">PORTFOLIO_SUMMARY</div>
          <div className="grid grid-cols-4 gap-4">
            <StatBox label="TOTAL_BORROWED" value="$2,000" color="green" />
            <StatBox label="TOTAL_LENT" value="$7,200" color="green" />
            <StatBox label="ACTIVE_LOANS" value="2" color="amber" />
            <StatBox label="PAWN_BALANCE" value={pawnBalance.toString()} color="blue" />
          </div>
          
          <div className="mt-4">
            <div className="mb-1 text-muted-foreground">TIER_STATUS:</div>
            <TierBar balance={pawnBalance} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-6 border border-border p-3">
          <div className="mb-2 text-[var(--pawn-amber)]">QUICK_ACTIONS</div>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton label="CREATE_LOAN" href="/app/borrow" />
            <ActionButton label="FUND_LOAN" href="/app/lend" />
            <ActionButton label="VIEW_PORTFOLIO" href="/app/portfolio" />
            <ActionButton label="SETTINGS" href="/app/settings" />
          </div>
          
          <div className="mt-4 border-t border-border pt-3">
            <div className="text-muted-foreground">COMMANDS:</div>
            <div className="mt-1 text-[var(--pawn-green)]">
              {'>'} Type /help for available commands
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="col-span-12 border border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-muted-foreground">
                CONTRACT: <span className="text-[var(--pawn-green)]">OPERATIONAL</span>
              </span>
              <span className="text-muted-foreground">
                GAS: <span className="text-foreground">12 gwei</span>
              </span>
              <span className="text-muted-foreground">
                BLOCK: <span className="text-foreground">18,234,567</span>
              </span>
              <span className="text-muted-foreground">
                TVL: <span className="text-[var(--pawn-green)]">$2,400,000</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--pawn-green)]" />
              <span className="text-[var(--pawn-green)]">CONNECTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderRow({ id, coll, loan, dur }: { id: number; coll: string; loan: string; dur: string }) {
  return (
    <div className="grid grid-cols-5 gap-1 py-0.5 hover:bg-secondary/30">
      <span className="text-[var(--pawn-blue)]">#{id}</span>
      <span className="text-foreground">{coll}</span>
      <span className="text-foreground">{loan}</span>
      <span className="text-muted-foreground">{dur}</span>
      <button className="text-[var(--pawn-amber)] hover:underline">[FUND]</button>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: 'green' | 'amber' | 'blue' }) {
  const colorClass = {
    green: 'text-[var(--pawn-green)]',
    amber: 'text-[var(--pawn-amber)]',
    blue: 'text-[var(--pawn-blue)]',
  }[color]

  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className={cn('text-lg', colorClass)}>{value}</div>
    </div>
  )
}

function TierBar({ balance }: { balance: number }) {
  const tier = getTierByBalance(balance)
  const maxBalance = 10000
  const progressPercent = Math.min((balance / maxBalance) * 100, 100)
  const barWidth = 40
  const filledBars = Math.round((progressPercent / 100) * barWidth)
  const emptyBars = barWidth - filledBars

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={cn(
          tier.name === 'Gold' && 'text-[var(--pawn-gold)]',
          tier.name === 'Silver' && 'text-[var(--pawn-silver)]',
          tier.name === 'Bronze' && 'text-[var(--pawn-bronze)]'
        )}>
          {tier.name.toUpperCase()}
        </span>
        <span className="text-muted-foreground">({tier.feeBps}bps fee)</span>
      </div>
      <div className="mt-1">
        [<span className="text-[var(--pawn-green)]">{'█'.repeat(filledBars)}</span>
        <span className="text-muted-foreground">{'░'.repeat(emptyBars)}</span>]
        <span className="ml-2 text-muted-foreground">{balance.toLocaleString()} $PAWN</span>
      </div>
    </div>
  )
}

function ActionButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="border border-border bg-secondary/30 px-4 py-2 text-center text-[var(--pawn-amber)] hover:bg-secondary"
    >
      [{label}]
    </a>
  )
}

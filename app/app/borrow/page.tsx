'use client'

import { CreateLoanForm } from '@/components/pawn/create-loan-form'
import { useApp } from '@/lib/app-context'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Zap, TrendingUp, Shield, ArrowRight } from 'lucide-react'

const SUPPORTED_TOKENS = [
  { symbol: '$ETH', color: '#627EEA' },
  { symbol: '$USDC', color: '#2775CA' },
  { symbol: '$AERO', color: '#00D395' },
  { symbol: '$BRETT', color: '#FF6B35' },
  { symbol: '$DEGEN', color: '#A855F7' },
  { symbol: '$HIGHER', color: '#22C55E' },
  { symbol: '$TOSHI', color: '#F59E0B' },
  { symbol: '$AEON', color: '#3B82F6' },
]

function TokenCycler() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SUPPORTED_TOKENS.length)
        setIsAnimating(false)
      }, 200)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const currentToken = SUPPORTED_TOKENS[currentIndex]
  const nextToken = SUPPORTED_TOKENS[(currentIndex + 1) % SUPPORTED_TOKENS.length]

  return (
    <span className="relative inline-block min-w-[120px] text-left">
      <span
        className={cn(
          'inline-block font-bold transition-all duration-200',
          isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        )}
        style={{ color: currentToken.color }}
      >
        {currentToken.symbol}
      </span>
    </span>
  )
}

function FloatingToken({ symbol, color, delay, position }: { 
  symbol: string
  color: string
  delay: number
  position: { top: string; left: string }
}) {
  return (
    <div
      className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card/80 font-mono text-[10px] font-bold shadow-lg backdrop-blur-sm"
      style={{
        top: position.top,
        left: position.left,
        color,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="animate-float-slow" style={{ animationDelay: `${delay}s` }}>
        {symbol.replace('$', '')}
      </div>
    </div>
  )
}

function BorrowJumbotron() {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-8">
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      
      {/* Floating token badges */}
      <div className="pointer-events-none absolute inset-0">
        <FloatingToken symbol="$ETH" color="#627EEA" delay={0} position={{ top: '10%', left: '5%' }} />
        <FloatingToken symbol="$USDC" color="#2775CA" delay={0.5} position={{ top: '60%', left: '8%' }} />
        <FloatingToken symbol="$AERO" color="#00D395" delay={1} position={{ top: '20%', left: '85%' }} />
        <FloatingToken symbol="$BRETT" color="#FF6B35" delay={1.5} position={{ top: '70%', left: '88%' }} />
        <FloatingToken symbol="$DEGEN" color="#A855F7" delay={2} position={{ top: '5%', left: '70%' }} />
      </div>

      {/* Glowing orb effect */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--pawn-green)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[var(--pawn-amber)]/10 blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--pawn-green)]/10 ring-1 ring-[var(--pawn-green)]/20">
            <Zap className="h-6 w-6 text-[var(--pawn-green)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Borrow Against</h1>
            <div className="flex items-center gap-2 text-2xl">
              <TokenCycler />
              <span className="text-muted-foreground">on Base</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-6 max-w-md text-muted-foreground">
          Lock your tokens as collateral and borrow any supported asset. 
          <span className="font-medium text-foreground"> Zero interest</span> — only pay a small platform fee.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
            <Shield className="h-4 w-4 text-[var(--pawn-green)]" />
            <span>No Liquidations</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-[var(--pawn-amber)]" />
            <span>0% Interest</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
            <ArrowRight className="h-4 w-4 text-[var(--pawn-emerald)]" />
            <span>Instant Settlement</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BorrowPage() {
  const { viewMode } = useApp()

  return (
    <div className={cn(
      'mx-auto max-w-2xl',
      viewMode === 'advanced' && 'max-w-4xl terminal-grid rounded-lg border border-border bg-card p-4'
    )}>
      {viewMode === 'advanced' && (
        <div className="mb-4 border-b border-border pb-2 font-mono text-xs">
          <span className="text-[var(--pawn-amber)]">PAWN.CREDIT</span>
          <span className="ml-4 text-[var(--pawn-green)]">BORROW_MODULE</span>
        </div>
      )}

      {viewMode === 'simple' && <BorrowJumbotron />}

      <CreateLoanForm />
    </div>
  )
}

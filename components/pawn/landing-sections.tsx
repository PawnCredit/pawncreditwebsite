'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/app-context'
import { cn } from '@/lib/utils'
import { PAWN_PLATFORM_ADDRESS, PAWN_TOKEN_COMING_SOON } from '@/lib/web3-config'
import { ArrowRight, Shield, Zap, Users, TrendingUp, Lock, Clock, Sparkles, ExternalLink, Copy, Check, ArrowUpRight, ArrowDownLeft, Circle, BadgeCheck } from 'lucide-react'
import { GridLines, PixelDots, CornerAccents, NoiseOverlay, HexagonPattern } from '@/components/ui/visual-effects'
import { useState, useEffect } from 'react'
import { Logo, LogoIcon } from './logo'

// Supported tokens on Base for cycling display
const BASE_TOKENS = [
  { symbol: 'ETH', color: '#627EEA', name: 'Ethereum' },
  { symbol: 'USDC', color: '#2775CA', name: 'USD Coin' },
  { symbol: 'AERO', color: '#00D395', name: 'Aerodrome' },
  { symbol: 'BRETT', color: '#FF6B35', name: 'Brett' },
  { symbol: 'DEGEN', color: '#A855F7', name: 'Degen' },
  { symbol: 'HIGHER', color: '#22C55E', name: 'Higher' },
  { symbol: 'TOSHI', color: '#F59E0B', name: 'Toshi' },
  { symbol: 'AEON', color: '#3B82F6', name: 'Aeon' },
]

// Token badge component for floating effect
function TokenBadge({ symbol, color, style, delay = 0 }: { 
  symbol: string
  color: string
  style?: React.CSSProperties
  delay?: number
}) {
  return (
    <div
      className="absolute flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-card/90 font-mono text-xs font-bold shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
      style={{
        ...style,
        color,
        animation: `float 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {symbol}
    </div>
  )
}

// Animated token cycling display
function TokenCycler() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % BASE_TOKENS.length)
        setIsAnimating(false)
      }, 150)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const token = BASE_TOKENS[currentIndex]

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl border-2 font-mono text-sm font-bold transition-all duration-150",
          isAnimating ? "scale-90 opacity-0" : "scale-100 opacity-100"
        )}
        style={{ 
          borderColor: token.color,
          backgroundColor: `${token.color}15`,
          color: token.color,
        }}
      >
        {token.symbol}
      </div>
      <ArrowRight className="h-5 w-5 text-primary animate-pulse" />
    </div>
  )
}

// Main hero graphic with orbiting tokens
function HeroGraphic() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Outer orbit ring */}
      <div className="absolute inset-0 rounded-full border border-dashed border-primary/20 animate-[spin_120s_linear_infinite]" />
      
      {/* Middle orbit ring */}
      <div className="absolute inset-8 rounded-full border border-primary/10 animate-[spin_90s_linear_infinite_reverse]" />
      
      {/* Inner glow ring */}
      <div className="absolute inset-16 rounded-full border-2 border-primary/30 shadow-[0_0_60px_-15px] shadow-primary/30" />
      
      {/* Center content */}
      <div className="absolute inset-20 rounded-full bg-gradient-to-br from-primary/10 via-card to-card flex items-center justify-center border border-primary/20">
        <div className="text-center">
          <div className="rotate-45">
            <LogoIcon size="lg" />
          </div>
          <div className="mt-2 font-mono text-xs text-primary">PAWN.CREDIT</div>
        </div>
      </div>

      {/* Orbiting token badges */}
      <TokenBadge symbol="ETH" color="#627EEA" style={{ top: '5%', left: '45%' }} delay={0} />
      <TokenBadge symbol="USDC" color="#2775CA" style={{ top: '25%', right: '5%' }} delay={0.5} />
      <TokenBadge symbol="AERO" color="#00D395" style={{ bottom: '25%', right: '0%' }} delay={1} />
      <TokenBadge symbol="BRETT" color="#FF6B35" style={{ bottom: '5%', left: '40%' }} delay={1.5} />
      <TokenBadge symbol="DEGEN" color="#A855F7" style={{ bottom: '30%', left: '0%' }} delay={2} />
      <TokenBadge symbol="HIGHER" color="#22C55E" style={{ top: '30%', left: '2%' }} delay={2.5} />

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="50%" y1="50%" x2="50%" y2="10%" stroke="url(#lineGradient)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="90%" y2="30%" stroke="url(#lineGradient)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="95%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="45%" y2="95%" stroke="url(#lineGradient)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="5%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="8%" y2="35%" stroke="url(#lineGradient)" strokeWidth="1" />
      </svg>

      {/* Animated particles */}
      <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-primary/60 animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-1/3 right-1/4 h-1.5 w-1.5 rounded-full bg-[var(--pawn-amber)]/60 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 h-1 w-1 rounded-full bg-[var(--pawn-emerald)]/60 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
    </div>
  )
}

// Animated flow demonstration
function FlowDemo() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-8 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Step 1: Collateral */}
        <div className={cn(
          "flex flex-col items-center gap-2 transition-all duration-300",
          step === 0 ? "scale-110 opacity-100" : "scale-100 opacity-50"
        )}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#627EEA] bg-[#627EEA]/10 font-mono text-xs font-bold text-[#627EEA]">
            ETH
          </div>
          <span className="text-[10px] text-muted-foreground">Collateral</span>
        </div>

        {/* Arrow 1 */}
        <div className={cn(
          "transition-all duration-300",
          step >= 1 ? "text-primary" : "text-muted-foreground/30"
        )}>
          <ArrowRight className="h-5 w-5" />
        </div>

        {/* Step 2: Protocol */}
        <div className={cn(
          "flex flex-col items-center gap-2 transition-all duration-300",
          step === 1 ? "scale-110 opacity-100" : "scale-100 opacity-50"
        )}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary bg-primary/10">
            <LogoIcon size="sm" />
          </div>
          <span className="text-[10px] text-muted-foreground">Protocol</span>
        </div>

        {/* Arrow 2 */}
        <div className={cn(
          "transition-all duration-300",
          step >= 2 ? "text-primary" : "text-muted-foreground/30"
        )}>
          <ArrowRight className="h-5 w-5" />
        </div>

        {/* Step 3: Loan */}
        <div className={cn(
          "flex flex-col items-center gap-2 transition-all duration-300",
          step === 2 ? "scale-110 opacity-100" : "scale-100 opacity-50"
        )}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#2775CA] bg-[#2775CA]/10 font-mono text-xs font-bold text-[#2775CA]">
            USDC
          </div>
          <span className="text-[10px] text-muted-foreground">Loan</span>
        </div>
      </div>
    </div>
  )
}

export function LandingHero() {
  const { viewMode } = useApp()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(PAWN_PLATFORM_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (viewMode === 'advanced') {
    return <LandingHeroTerminal />
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Subtle background effects */}
      <GridLines className="opacity-30" />
      <NoiseOverlay />
      
      <div className="mx-auto max-w-7xl px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Copy */}
          <div>
            {/* Live badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-primary animate-ping" />
              </div>
              <span className="text-primary font-medium">Live on Base</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Unlock liquidity.
              <br />
              <span className="text-primary">Keep your upside.</span>
            </h1>

            {/* Subheadline - Clear value prop */}
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl leading-relaxed max-w-xl">
              The first zero-interest crypto pawn protocol. Deposit collateral, 
              borrow what you need, repay on your schedule. 
              <span className="text-foreground font-medium"> No liquidations. No margin calls. Ever.</span>
            </p>

            {/* Key benefits - scannable */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm">Borrow up to 90 days with zero interest</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm">Your collateral stays safe until deadline</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm">Only 0.5% flat fee (lower with $PAWN)</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <Button size="lg" asChild className="group">
                <Link href="/app">
                  Start Borrowing
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/app/lend">
                  Become a Lender
                </Link>
              </Button>
            </div>

            {/* Contract info */}
            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
              <span>Contract:</span>
              <code className="font-mono text-xs bg-secondary px-2 py-1 rounded">
                {PAWN_PLATFORM_ADDRESS.slice(0, 6)}...{PAWN_PLATFORM_ADDRESS.slice(-4)}
              </code>
              <button onClick={copyAddress} className="hover:text-foreground transition-colors">
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <a 
                href={`https://basescan.org/address/${PAWN_PLATFORM_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="hidden lg:block">
            <HeroGraphic />
          </div>
        </div>

        {/* Flow Demo - visible on all screens */}
        <div className="mt-12 lg:hidden">
          <FlowDemo />
        </div>
      </div>
    </section>
  )
}

function LandingHeroTerminal() {
  return (
    <section className="py-12 relative">
      <div className="mx-auto max-w-4xl px-4 font-mono text-sm relative z-10">
        <div className="rounded-lg border border-primary/30 bg-card/80 p-6 terminal-grid backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-[var(--pawn-amber)]/60" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
            </div>
            <span className="ml-4 text-[var(--pawn-amber)]">PAWN.CREDIT</span>
            <span className="ml-4 text-primary">ONLINE</span>
            <span className="ml-4 text-muted-foreground">BASE_MAINNET</span>
          </div>
          <div className="mb-6 text-xl">
            <span className="text-foreground">ZERO-INTEREST CRYPTO PAWN LENDING</span>
          </div>
          <div className="mb-4 text-primary">
            CONTRACT: {PAWN_PLATFORM_ADDRESS}
          </div>
          <div className="mb-6 space-y-1 text-muted-foreground">
            <p>{'>'} Deposit collateral {'→'} Borrow tokens {'→'} Repay or forfeit</p>
            <p>{'>'} No interest. No liquidation risk. No margin calls.</p>
            <p>{'>'} Simple deadline-based mechanics.</p>
          </div>
          <div className="mb-8 flex items-center gap-4">
            <div className="border border-[var(--pawn-amber)]/30 px-4 py-2 bg-[var(--pawn-amber)]/5">
              <span className="text-muted-foreground">INTEREST: </span>
              <span className="text-[var(--pawn-amber)]">0%</span>
            </div>
            <div className="border border-border px-4 py-2">
              <span className="text-muted-foreground">BASE_FEE: </span>
              <span className="text-foreground">0.5%</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/app" className="bg-primary px-6 py-2 text-primary-foreground hover:opacity-90 transition-opacity">
              [START_BORROWING]
            </Link>
            <Link href="/app/lend" className="border border-primary/50 px-6 py-2 hover:bg-primary/10 transition-colors">
              [BECOME_LENDER]
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  const { viewMode } = useApp()
  const steps = [
    {
      number: '01',
      title: 'Lock Collateral',
      description: 'Deposit ERC-20 tokens as collateral. Your assets are held in our audited smart contract.',
      icon: <Lock className="h-6 w-6" />,
    },
    {
      number: '02',
      title: 'Set Your Terms',
      description: 'Choose what to borrow, how much, and your deadline (7-90 days).',
      icon: <Clock className="h-6 w-6" />,
    },
    {
      number: '03',
      title: 'Get Funded',
      description: 'A lender accepts your offer. You receive tokens minus a small platform fee.',
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: '04',
      title: 'Repay or Forfeit',
      description: 'Pay back exactly what you borrowed to reclaim collateral. Miss the deadline and it goes to the lender.',
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ]

  if (viewMode === 'advanced') {
    return (
      <section id="how-it-works" className="py-12">
        <div className="mx-auto max-w-4xl px-4 font-mono text-sm">
          <div className="mb-6 text-[var(--pawn-amber)]">HOW_IT_WORKS:</div>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 py-2 border-l-2 border-primary/30 pl-4 hover:border-primary hover:bg-primary/5 transition-all">
                <span className="text-primary">[{step.number}]</span>
                <span className="text-foreground">{step.title.toUpperCase()}:</span>
                <span className="text-muted-foreground">{step.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="how-it-works" className="py-20 sm:py-32 relative bg-secondary/30">
      <PixelDots className="opacity-20" />
      <div className="mx-auto max-w-7xl px-4 lg:px-6 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Simple, transparent, trustless lending in four steps.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-px w-6 translate-x-full bg-border lg:block" />
              )}
              <div className="rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 h-full">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <span className="font-mono text-3xl font-bold text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Features() {
  const { viewMode } = useApp()
  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Zero Interest',
      description: 'Borrow without compounding debt. Pay back exactly what you borrowed.',
      highlight: true,
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'No Liquidations',
      description: 'No margin calls, no forced sales. Your collateral stays put until the deadline.',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Flexible Terms',
      description: 'Set your own duration from 7 to 90 days. You control the timeline.',
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'Non-Custodial',
      description: 'Your collateral is held in audited smart contracts. Always in your control.',
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Peer-to-Peer',
      description: 'Borrow directly from other users. No intermediaries, no banks.',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: '$PAWN Rewards',
      description: PAWN_TOKEN_COMING_SOON 
        ? 'Hold $PAWN to reduce fees. Token launching soon!'
        : 'Hold $PAWN to reduce your origination fee from 0.5% down to 0.1%.',
      comingSoon: PAWN_TOKEN_COMING_SOON,
    },
  ]

  if (viewMode === 'advanced') {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 font-mono text-sm">
          <div className="mb-6 text-[var(--pawn-amber)]">FEATURES:</div>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className={cn(
                "border p-3 transition-colors",
                f.comingSoon 
                  ? "border-[var(--pawn-amber)]/30 bg-[var(--pawn-amber)]/5" 
                  : "border-border hover:border-primary/50"
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{f.title.toUpperCase()}</span>
                  {f.comingSoon && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[var(--pawn-amber)]/20 text-[var(--pawn-amber)] rounded">
                      SOON
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground">{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      <HexagonPattern className="opacity-30" />
      <div className="mx-auto max-w-7xl px-4 lg:px-6 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Why Pawn.credit</h2>
          <p className="text-lg text-muted-foreground">
            DeFi lending, simplified.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className={cn(
                "rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg",
                feature.comingSoon 
                  ? "border-[var(--pawn-amber)]/30 hover:border-[var(--pawn-amber)]/50 hover:shadow-[var(--pawn-amber)]/5" 
                  : feature.highlight
                    ? "border-primary/30 hover:border-primary/50 hover:shadow-primary/5"
                    : "border-border hover:border-primary/30 hover:shadow-primary/5"
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  feature.comingSoon 
                    ? "bg-[var(--pawn-amber)]/10 text-[var(--pawn-amber)]"
                    : "bg-primary/10 text-primary"
                )}>
                  {feature.icon}
                </div>
                {feature.comingSoon && (
                  <span className="text-xs px-2 py-1 bg-[var(--pawn-amber)]/10 text-[var(--pawn-amber)] rounded-full font-medium border border-[var(--pawn-amber)]/20">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TokenSection() {
  return (
    <section className="py-20 sm:py-32 relative overflow-hidden bg-secondary/30">
      <PixelDots className="opacity-20" />
      <div className="mx-auto max-w-4xl px-4 lg:px-6 relative z-10">
        <div className="rounded-2xl border border-[var(--pawn-amber)]/30 bg-card p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--pawn-amber)]/10 border border-[var(--pawn-amber)]/20">
              <Sparkles className="h-6 w-6 text-[var(--pawn-amber)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">$PAWN Token</h2>
              <p className="text-sm text-[var(--pawn-amber)]">Loyalty rewards program</p>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The $PAWN token powers our loyalty tier system. Hold tokens to unlock lower fees and exclusive benefits.
            The more you hold, the less you pay in platform fees.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl p-4 bg-[var(--pawn-bronze)]/10 border border-[var(--pawn-bronze)]/20">
              <p className="text-sm text-[var(--pawn-bronze)]">Bronze</p>
              <p className="text-2xl font-bold text-foreground">0.50%</p>
              <p className="text-xs text-muted-foreground">{'< 1,000 $PAWN'}</p>
            </div>
            <div className="rounded-xl p-4 bg-[var(--pawn-silver)]/10 border border-[var(--pawn-silver)]/20">
              <p className="text-sm text-[var(--pawn-silver)]">Silver</p>
              <p className="text-2xl font-bold text-foreground">0.30%</p>
              <p className="text-xs text-muted-foreground">1,000 - 9,999 $PAWN</p>
            </div>
            <div className="rounded-xl p-4 bg-[var(--pawn-gold)]/10 border border-[var(--pawn-gold)]/20">
              <p className="text-sm text-[var(--pawn-gold)]">Gold</p>
              <p className="text-2xl font-bold text-foreground">0.10%</p>
              <p className="text-xs text-muted-foreground">10,000+ $PAWN</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--pawn-amber)]/5 border border-[var(--pawn-amber)]/20">
            <div>
              <p className="text-sm font-medium">Contract Address</p>
              <p className="text-xs text-muted-foreground">Token not yet deployed</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pawn-amber)]/10 rounded-lg text-[var(--pawn-amber)] font-medium border border-[var(--pawn-amber)]/20">
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingCTA() {
  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      <GridLines className="opacity-20" />
      <div className="mx-auto max-w-3xl px-4 text-center lg:px-6 relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <div className="h-px w-8 bg-border" />
          Built on Base
          <div className="h-px w-8 bg-border" />
        </div>
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-balance">
          Ready to unlock your crypto&apos;s potential?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Connect your wallet and create your first loan in minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="group">
            <Link href="/app">
              Launch App
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#how-it-works">
              Learn More
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12 relative">
      <NoiseOverlay className="opacity-[0.01]" />
      <div className="mx-auto max-w-7xl px-4 lg:px-6 relative z-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo size="md" />
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary" />
            Built on Base
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>Contract: {PAWN_PLATFORM_ADDRESS}</p>
        </div>
      </div>
    </footer>
  )
}

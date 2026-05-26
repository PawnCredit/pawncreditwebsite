"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Coins, 
  TrendingDown, 
  Trophy,
  Sparkles,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Twitter,
  MessageCircle,
  Shield,
  Zap,
  Users,
  Calculator
} from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import { useAccount } from "wagmi"
import { TIERS, getTierByBalance, getNextTier, PAWN_TOKEN_COMING_SOON } from "@/lib/web3-config"

const tierBenefits = [
  {
    tier: "Bronze",
    threshold: "0 $PAWN",
    fee: "0.50%",
    color: "from-amber-700 to-amber-900",
    borderColor: "border-amber-700/30",
    textColor: "text-amber-700",
    features: [
      "Access to all platform features",
      "Standard loan creation",
      "Community support"
    ]
  },
  {
    tier: "Silver",
    threshold: "1,000 $PAWN",
    fee: "0.30%",
    color: "from-gray-400 to-gray-600",
    borderColor: "border-gray-400/30",
    textColor: "text-gray-400",
    features: [
      "40% reduced platform fees",
      "Priority loan visibility",
      "Dedicated support channel"
    ]
  },
  {
    tier: "Gold",
    threshold: "10,000 $PAWN",
    fee: "0.10%",
    color: "from-yellow-400 to-yellow-600",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-500",
    features: [
      "80% reduced platform fees",
      "Top loan placement",
      "Early access to new features",
      "VIP support"
    ]
  }
]

const roadmapItems = [
  {
    phase: "Phase 1",
    title: "Protocol Launch",
    description: "Core lending platform live on Base mainnet",
    status: "complete"
  },
  {
    phase: "Phase 2",
    title: "Token Generation",
    description: "$PAWN token deployment and initial distribution",
    status: "upcoming"
  },
  {
    phase: "Phase 3",
    title: "Tier System Activation",
    description: "Fee reduction benefits go live for token holders",
    status: "upcoming"
  },
  {
    phase: "Phase 4",
    title: "Governance",
    description: "Community voting on protocol parameters",
    status: "planned"
  }
]

export default function TokenPage() {
  const { isTerminalMode } = useAppContext()
  const { address, isConnected } = useAccount()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Mock balance for now - will be real when token launches
  const pawnBalance = 0
  const currentTier = getTierByBalance(pawnBalance)
  const nextTier = getNextTier(pawnBalance)

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would call an API
    setSubmitted(true)
  }

  if (isTerminalMode) {
    return (
      <div className="min-h-screen bg-background p-4 font-mono text-xs">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 border-b border-border pb-2">
            <span className="text-primary">PAWN.CREDIT</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span>$PAWN_TOKEN</span>
            <span className="ml-4 text-[var(--pawn-amber)]">[COMING_SOON]</span>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-muted-foreground">{">"} STATUS: Token not yet launched</p>
            <p className="text-muted-foreground">{">"} UTILITY: Platform fee reduction</p>
            <p className="text-muted-foreground">{">"} NETWORK: Base (Chain ID: 8453)</p>
          </div>

          <div className="mb-6">
            <div className="mb-2 text-[var(--pawn-amber)]">TIER_SYSTEM:</div>
            <div className="space-y-1">
              {tierBenefits.map((tier) => (
                <div key={tier.tier} className="flex gap-4 border-l-2 border-primary/30 pl-4 py-1">
                  <span className={cn(
                    tier.tier === "Bronze" && "text-amber-700",
                    tier.tier === "Silver" && "text-gray-400",
                    tier.tier === "Gold" && "text-yellow-500"
                  )}>{tier.tier.toUpperCase()}</span>
                  <span className="text-muted-foreground">{tier.threshold}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-primary">{tier.fee} FEE</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 text-[var(--pawn-amber)]">YOUR_STATUS:</div>
            <div className="space-y-1 text-muted-foreground">
              <p>WALLET: {isConnected ? address?.slice(0, 10) + "..." : "NOT_CONNECTED"}</p>
              <p>BALANCE: 0 $PAWN</p>
              <p>TIER: {currentTier.name.toUpperCase()}</p>
              <p>CURRENT_FEE: {(currentTier.feeBps / 100).toFixed(2)}%</p>
            </div>
          </div>

          <div className="rounded border border-[var(--pawn-amber)]/30 p-4 bg-[var(--pawn-amber)]/5">
            <p className="text-[var(--pawn-amber)]">JOIN_WAITLIST:</p>
            <p className="text-muted-foreground mt-1">Follow @pawncredit on X for launch updates</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-[var(--pawn-amber)]/10 text-[var(--pawn-amber)] border-[var(--pawn-amber)]/30">
            <Sparkles className="mr-1 h-3 w-3" />
            Coming Soon
          </Badge>
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold md:text-4xl">
            <Coins className="h-8 w-8 text-primary" />
            $PAWN Token
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            The utility token powering the Pawn.credit ecosystem
          </p>
        </div>

        {/* Coming Soon Banner */}
        <Card className="mb-8 border-[var(--pawn-amber)]/30 bg-gradient-to-r from-[var(--pawn-amber)]/5 to-[var(--pawn-amber)]/10">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center md:flex-row md:text-left">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--pawn-amber)]/10">
                <Bell className="h-8 w-8 text-[var(--pawn-amber)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Token Launch Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to know when $PAWN launches. Follow us on social media for announcements.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://twitter.com/pawncredit" target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://discord.gg/pawncredit" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Discord
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Utility */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Token Utility</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <TrendingDown className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Reduced Fees</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hold $PAWN to reduce platform fees from 0.5% down to 0.1%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Tier Benefits</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Unlock exclusive perks like priority listing and early feature access
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Governance</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vote on protocol decisions and shape the future of Pawn.credit
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tier System */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Tier System</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tierBenefits.map((tier, index) => (
              <Card 
                key={tier.tier} 
                className={cn(
                  "relative overflow-hidden",
                  tier.borderColor,
                  currentTier.name === tier.tier && "ring-2 ring-primary"
                )}
              >
                {currentTier.name === tier.tier && (
                  <Badge className="absolute right-3 top-3 bg-primary">Current</Badge>
                )}
                <div className={cn("h-2 bg-gradient-to-r", tier.color)} />
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2", tier.textColor)}>
                    {tier.tier === "Gold" && <Trophy className="h-5 w-5" />}
                    {tier.tier}
                  </CardTitle>
                  <CardDescription>{tier.threshold}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{tier.fee}</span>
                    <span className="text-muted-foreground"> platform fee</span>
                  </div>
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Fee Calculator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Fee Savings Calculator
            </CardTitle>
            <CardDescription>See how much you could save with $PAWN</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Example Loan Amount</label>
                <p className="text-2xl font-bold">$10,000</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Bronze Tier Fee (0.5%)</label>
                <p className="text-2xl font-bold text-muted-foreground">$50</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Gold Tier Fee (0.1%)</label>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-green-500">$10</p>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    Save $40
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Status (if connected) */}
        {isConnected && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet</p>
                  <p className="font-mono text-sm">{address?.slice(0, 8)}...{address?.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">$PAWN Balance</p>
                  <p className="text-lg font-semibold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Tier</p>
                  <p className={cn("text-lg font-semibold", TIERS.BRONZE.color === currentTier.color && "text-amber-700")}>
                    {currentTier.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Fee Rate</p>
                  <p className="text-lg font-semibold">{(currentTier.feeBps / 100).toFixed(2)}%</p>
                </div>
              </div>
              {nextTier && (
                <div className="mt-4 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Hold </span>
                    <span className="font-semibold">{nextTier.tokensNeeded.toLocaleString()} more $PAWN</span>
                    <span className="text-muted-foreground"> to reach </span>
                    <span className="font-semibold">{nextTier.tier.name}</span>
                    <span className="text-muted-foreground"> tier and get </span>
                    <span className="font-semibold text-green-500">{(nextTier.tier.feeBps / 100).toFixed(2)}% fees</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Roadmap */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Roadmap</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-1/2" />
            
            <div className="space-y-8">
              {roadmapItems.map((item, index) => (
                <div 
                  key={item.phase}
                  className={cn(
                    "relative flex flex-col md:flex-row md:items-center",
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Circle marker */}
                  <div className={cn(
                    "absolute left-4 h-8 w-8 -translate-x-1/2 rounded-full border-4 border-background md:left-1/2",
                    item.status === "complete" && "bg-green-500",
                    item.status === "upcoming" && "bg-[var(--pawn-amber)]",
                    item.status === "planned" && "bg-muted"
                  )}>
                    {item.status === "complete" && (
                      <CheckCircle2 className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                    {item.status === "upcoming" && (
                      <Clock className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={cn(
                    "ml-12 md:ml-0 md:w-1/2",
                    index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  )}>
                    <Card>
                      <CardContent className="p-4">
                        <Badge 
                          variant="outline"
                          className={cn(
                            item.status === "complete" && "border-green-500/50 text-green-500",
                            item.status === "upcoming" && "border-[var(--pawn-amber)]/50 text-[var(--pawn-amber)]",
                            item.status === "planned" && "border-muted-foreground/50 text-muted-foreground"
                          )}
                        >
                          {item.phase}
                        </Badge>
                        <h3 className="mt-2 font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold">Start Using Pawn.credit Today</h3>
            <p className="mt-2 text-muted-foreground">
              You don&apos;t need $PAWN tokens to use the platform. Start borrowing or lending now!
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Button asChild>
                <Link href="/app">
                  Launch App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

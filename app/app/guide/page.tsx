"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  BookOpen, 
  Wallet, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Coins,
  Clock,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  HandCoins,
  TrendingUp,
  CircleDot
} from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import { PAWN_PLATFORM_ADDRESS, TOKENS } from "@/lib/web3-config"

const borrowerSteps = [
  {
    number: 1,
    title: "Connect Your Wallet",
    description: "Connect a Base-compatible wallet like MetaMask or Coinbase Wallet. Make sure you have some ETH for gas fees.",
    icon: Wallet,
    details: [
      "Click the 'Connect Wallet' button in the header",
      "Select your preferred wallet provider",
      "Approve the connection request in your wallet",
      "Ensure you're connected to Base network (Chain ID: 8453)"
    ]
  },
  {
    number: 2,
    title: "Deposit Collateral",
    description: "Choose which tokens to use as collateral. You'll need to approve the contract to access your tokens.",
    icon: Shield,
    details: [
      "Go to the 'Borrow' page",
      "Select your collateral token (e.g., WETH, USDC)",
      "Enter the amount you want to deposit",
      "Approve the contract to spend your tokens (one-time per token)",
      "Your collateral will be locked in the smart contract"
    ]
  },
  {
    number: 3,
    title: "Set Loan Terms",
    description: "Specify what you want to borrow, how much, and your repayment deadline (7-90 days).",
    icon: Clock,
    details: [
      "Choose the token you want to borrow (e.g., USDC)",
      "Enter the loan amount you're requesting",
      "Select a loan duration (7, 14, 30, 60, or 90 days)",
      "Review the platform fee (0.5% or lower with $PAWN tokens)",
      "The longer the duration, the more time you have to repay"
    ]
  },
  {
    number: 4,
    title: "Wait for Funding",
    description: "Your loan offer is now visible in the marketplace. A lender will review and fund it if they find it attractive.",
    icon: HandCoins,
    details: [
      "Your loan appears in the 'Lend' marketplace",
      "Lenders can see your collateral and terms",
      "You can cancel anytime before funding",
      "Once funded, you'll receive the loan tokens minus the fee"
    ]
  },
  {
    number: 5,
    title: "Repay & Reclaim",
    description: "Repay the exact loan amount before your deadline to reclaim your collateral. Miss the deadline and you forfeit it.",
    icon: CheckCircle2,
    details: [
      "Go to 'Portfolio' to see your active loans",
      "Click 'Repay' on the loan you want to close",
      "Approve and confirm the repayment transaction",
      "Your collateral is returned immediately",
      "Warning: Missing the deadline means permanent loss of collateral!"
    ]
  }
]

const lenderSteps = [
  {
    number: 1,
    title: "Connect Your Wallet",
    description: "Connect your wallet and make sure you have the tokens you want to lend (e.g., USDC, DAI).",
    icon: Wallet,
    details: [
      "Click the 'Connect Wallet' button in the header",
      "Ensure you have lending tokens in your wallet",
      "Check you have ETH for gas fees",
      "Make sure you're on Base network"
    ]
  },
  {
    number: 2,
    title: "Browse the Market",
    description: "Explore available loan offers. Review collateral amounts, requested loans, and deadlines.",
    icon: TrendingUp,
    details: [
      "Go to the 'Lend' page to see all open loans",
      "Filter by collateral type, loan token, or duration",
      "Review each loan's collateral-to-loan ratio",
      "Higher collateral ratios mean lower risk for you"
    ]
  },
  {
    number: 3,
    title: "Fund a Loan",
    description: "Found a good opportunity? Approve the contract and fund the loan to become the lender.",
    icon: Coins,
    details: [
      "Click 'Fund' on a loan you want to support",
      "Approve the contract to spend your tokens (one-time)",
      "Confirm the funding transaction",
      "The borrower receives the loan minus the platform fee"
    ]
  },
  {
    number: 4,
    title: "Wait for Repayment",
    description: "Track your funded loans in your portfolio. The borrower has until the deadline to repay.",
    icon: Clock,
    details: [
      "View your lent loans in 'Portfolio'",
      "Monitor time remaining on each loan",
      "If repaid: you get back exactly what you lent",
      "If not repaid: you can claim the collateral"
    ]
  },
  {
    number: 5,
    title: "Collect Payment or Collateral",
    description: "Either receive your repayment, or claim the collateral if the borrower defaults.",
    icon: CheckCircle2,
    details: [
      "If borrower repays: tokens returned automatically",
      "If deadline passes: click 'Claim Collateral'",
      "Collateral is transferred to your wallet",
      "You keep the collateral as full compensation"
    ]
  }
]

const faqs = [
  {
    question: "What happens if I don't repay my loan?",
    answer: "If you miss the repayment deadline, the lender can claim your collateral. This is permanent and irreversible. There's no grace period - make sure to repay before the deadline!"
  },
  {
    question: "What are the fees?",
    answer: "The platform charges a flat 0.5% origination fee on loan amounts. This fee is deducted when you receive the loan. Hold $PAWN tokens to reduce this fee to as low as 0.1%."
  },
  {
    question: "Can I cancel my loan offer?",
    answer: "Yes! You can cancel your loan offer anytime before it's funded by a lender. Once funded, the loan is locked until you repay or the deadline passes."
  },
  {
    question: "What tokens are supported?",
    answer: "We support popular ERC-20 tokens on Base including WETH, USDC, DAI, and more. You can use any supported token as collateral or as the loan currency."
  },
  {
    question: "Is there any interest charged?",
    answer: "No! This is a zero-interest lending protocol. You only pay back exactly what you borrowed. The only fee is the small platform origination fee."
  },
  {
    question: "What if the value of my collateral drops?",
    answer: "Unlike traditional DeFi lending, there are no liquidations based on price. Your collateral is safe until the deadline, regardless of market movements."
  },
  {
    question: "How do I get $PAWN tokens?",
    answer: "The $PAWN token is coming soon! It will be used to reduce platform fees and unlock exclusive benefits. Join our community to be first to know when it launches."
  }
]

export default function GuidePage() {
  const { isTerminalMode } = useAppContext()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("borrower")

  const copyAddress = () => {
    navigator.clipboard.writeText(PAWN_PLATFORM_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isTerminalMode) {
    return (
      <div className="min-h-screen bg-background p-4 font-mono text-xs">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 border-b border-border pb-2">
            <span className="text-primary">PAWN.CREDIT</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span>GETTING_STARTED</span>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-muted-foreground">{">"} PROTOCOL: Zero-interest crypto pawn lending</p>
            <p className="text-muted-foreground">{">"} NETWORK: Base (Chain ID: 8453)</p>
            <p className="text-muted-foreground">{">"} CONTRACT: <span className="text-primary">{PAWN_PLATFORM_ADDRESS}</span></p>
          </div>

          <div className="mb-6">
            <div className="mb-2 text-[var(--pawn-amber)]">FOR_BORROWERS:</div>
            <div className="space-y-1">
              {borrowerSteps.map((step, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-4 py-1 hover:border-primary hover:bg-primary/5">
                  <span className="text-primary">[{step.number}]</span>
                  <span className="ml-2 text-foreground">{step.title.toUpperCase()}</span>
                  <span className="ml-2 text-muted-foreground">- {step.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 text-[var(--pawn-amber)]">FOR_LENDERS:</div>
            <div className="space-y-1">
              {lenderSteps.map((step, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-4 py-1 hover:border-primary hover:bg-primary/5">
                  <span className="text-primary">[{step.number}]</span>
                  <span className="ml-2 text-foreground">{step.title.toUpperCase()}</span>
                  <span className="ml-2 text-muted-foreground">- {step.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/app/borrow" className="border border-primary px-4 py-2 text-primary hover:bg-primary/10">
              [START_BORROWING]
            </Link>
            <Link href="/app/lend" className="border border-border px-4 py-2 hover:bg-muted">
              [START_LENDING]
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const steps = activeTab === "borrower" ? borrowerSteps : lenderSteps

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <BookOpen className="h-7 w-7" />
            Getting Started Guide
          </h1>
          <p className="mt-2 text-muted-foreground">
            Learn how to borrow and lend on Pawn.credit - the zero-interest crypto pawn protocol on Base.
          </p>
        </div>

        {/* Quick Overview */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">What is Pawn.credit?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A decentralized pawn protocol where you can borrow against your crypto with 
                  <span className="font-medium text-foreground"> zero interest</span>, 
                  <span className="font-medium text-foreground"> no liquidations</span>, and 
                  <span className="font-medium text-foreground"> simple deadline-based mechanics</span>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-background px-2 py-1 font-mono text-xs">
                  {PAWN_PLATFORM_ADDRESS.slice(0, 10)}...
                </code>
                <button 
                  onClick={copyAddress}
                  className="rounded p-1.5 hover:bg-background"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <a 
                  href={`https://basescan.org/address/${PAWN_PLATFORM_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1.5 hover:bg-background"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Selector */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="borrower" className="gap-2">
              <HandCoins className="h-4 w-4" />
              I want to Borrow
            </TabsTrigger>
            <TabsTrigger value="lender" className="gap-2">
              <Coins className="h-4 w-4" />
              I want to Lend
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {/* Steps */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-px bg-border md:left-[35px]" />
              
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <Card key={step.number} className="relative">
                    {/* Step number circle */}
                    <div className="absolute -left-3 top-6 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground font-bold md:-left-4 md:h-[72px] md:w-[72px]">
                      {step.number}
                    </div>
                    
                    <CardHeader className="pl-16 md:pl-20">
                      <div className="flex items-center gap-2">
                        <step.icon className="h-5 w-5 text-primary" />
                        <CardTitle>{step.title}</CardTitle>
                      </div>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-16 md:pl-20">
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={activeTab === "borrower" ? "/app/borrow" : "/app/lend"}>
                  {activeTab === "borrower" ? "Start Borrowing" : "Start Lending"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Important Warnings */}
        <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Important Things to Know
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 border-amber-500/50 text-amber-600">Risk</Badge>
              <p>
                <strong>Missing deadlines is permanent.</strong> If you don&apos;t repay your loan before the deadline, 
                the lender can claim your collateral. There are no grace periods or extensions.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 border-amber-500/50 text-amber-600">Fees</Badge>
              <p>
                A <strong>0.5% platform fee</strong> is deducted from the loan amount when you receive it. 
                This fee can be reduced to 0.1% by holding $PAWN tokens.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 border-amber-500/50 text-amber-600">Gas</Badge>
              <p>
                All transactions require ETH for gas on Base network. Make sure you have enough ETH 
                for approvals, loan creation, and repayments.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="mt-8 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 p-6 text-center">
          <h3 className="text-xl font-semibold">Ready to get started?</h3>
          <p className="mt-2 text-muted-foreground">
            Join the zero-interest lending revolution on Base.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Button asChild>
              <Link href="/app">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/help">
                Get Help
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

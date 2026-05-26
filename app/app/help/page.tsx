"use client"

import { useState } from "react"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  HelpCircle, 
  Shield, 
  Clock, 
  Coins, 
  AlertTriangle,
  ExternalLink,
  MessageCircle
} from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/lib/app-context"

const FAQ_CATEGORIES = [
  { id: "general", label: "General", icon: HelpCircle },
  { id: "borrowing", label: "Borrowing", icon: Coins },
  { id: "lending", label: "Lending", icon: Shield },
  { id: "security", label: "Security", icon: AlertTriangle },
]

const FAQS = [
  {
    category: "general",
    question: "What is Pawn.credit?",
    answer: "Pawn.credit is a decentralized, interest-free crypto pawn lending marketplace on Base chain. Users can lock ERC-20 tokens as collateral to borrow other ERC-20 tokens from other users, with no interest charged."
  },
  {
    category: "general",
    question: "How does interest-free lending work?",
    answer: "Unlike traditional DeFi lending, Pawn.credit charges zero interest. The only penalty for not repaying on time is the permanent loss of your collateral to the lender. This creates a simple, transparent system where you know exactly what you risk."
  },
  {
    category: "general",
    question: "What is the $PAWN token?",
    answer: "$PAWN is the platform's utility token. Holding $PAWN unlocks fee discounts across three tiers: Bronze (< 1,000 $PAWN, 0.5% fee), Silver (1,000+ $PAWN, 0.3% fee), and Gold (10,000+ $PAWN, 0.1% fee)."
  },
  {
    category: "borrowing",
    question: "How do I borrow tokens?",
    answer: "To borrow: 1) Connect your wallet, 2) Go to the Borrow page, 3) Select your collateral token and amount, 4) Choose the token you want to borrow and duration, 5) Submit your loan request. A lender will then fund your request."
  },
  {
    category: "borrowing",
    question: "What happens if I don't repay on time?",
    answer: "If you fail to repay by the due date, your collateral is automatically transferred to the lender. There are no partial liquidations or additional penalties - you simply lose your collateral."
  },
  {
    category: "borrowing",
    question: "Can I repay early?",
    answer: "Yes! You can repay your loan at any time before the due date. There are no early repayment penalties. Once repaid, your collateral is immediately returned to your wallet."
  },
  {
    category: "borrowing",
    question: "What is LTV (Loan-to-Value)?",
    answer: "LTV is the ratio of your loan amount to your collateral value. For example, if you deposit $10,000 worth of WETH and borrow $8,000 USDC, your LTV is 80%. Lower LTV means more collateral buffer."
  },
  {
    category: "lending",
    question: "How do I lend tokens?",
    answer: "Browse open loan requests on the Market or Lend page. Review the collateral, loan amount, duration, and LTV. Click 'Fund' to fund a loan you're comfortable with. Your tokens will be sent to the borrower."
  },
  {
    category: "lending",
    question: "What are the risks of lending?",
    answer: "The main risk is if the borrower defaults and the collateral value has dropped significantly. However, since there's no liquidation mechanism, you're guaranteed to receive the collateral if the borrower doesn't repay."
  },
  {
    category: "lending",
    question: "How do I earn returns as a lender?",
    answer: "You earn returns when borrowers default. If a borrower doesn't repay, you receive their collateral, which should be worth more than what you lent (due to the LTV requirement). The difference is your profit."
  },
  {
    category: "security",
    question: "Are the smart contracts audited?",
    answer: "Yes, our smart contracts have been audited by [Audit Firm]. You can view the full audit report on our GitHub. We also have a bug bounty program for responsible disclosure."
  },
  {
    category: "security",
    question: "How is collateral secured?",
    answer: "Collateral is held in our audited smart contracts on Base chain. Only the borrower (upon repayment) or lender (upon default) can withdraw the collateral. The protocol never takes custody of user funds."
  },
  {
    category: "security",
    question: "What happens if the protocol is hacked?",
    answer: "Our contracts are non-upgradeable and audited to minimize this risk. We also maintain an emergency pause function and insurance fund. Users should only deposit what they can afford to lose."
  }
]

export default function HelpPage() {
  const { isTerminalMode } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === null || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  if (isTerminalMode) {
    return (
      <div className="min-h-screen bg-background p-4 font-mono text-xs">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 border-b border-border pb-2">
            <span className="text-primary">PAWN.CREDIT</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span>HELP_CENTER</span>
          </div>

          <div className="mb-4">
            <span className="text-muted-foreground">SEARCH: </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none"
              placeholder="Type to filter..."
            />
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`border px-2 py-1 ${activeCategory === null ? 'border-primary text-primary' : 'border-border'}`}
            >
              [ALL]
            </button>
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`border px-2 py-1 ${activeCategory === cat.id ? 'border-primary text-primary' : 'border-border'}`}
              >
                [{cat.label.toUpperCase()}]
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="border border-border p-3">
                <div className="mb-2 text-primary">Q: {faq.question}</div>
                <div className="text-muted-foreground">A: {faq.answer}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 border border-border p-4">
            <div className="text-primary">NEED_MORE_HELP?</div>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <div>Discord: discord.gg/pawncredit</div>
              <div>Twitter: @pawncredit</div>
              <div>Docs: docs.pawn.credit</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="mr-1 h-3 w-3" />
            Help Center
          </Badge>
          <h1 className="text-3xl font-bold">How can we help?</h1>
          <p className="mt-2 text-muted-foreground">
            Find answers to common questions about Pawn.credit
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10"
          />
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All Topics
          </Button>
          {FAQ_CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon className="mr-1 h-4 w-4" />
                {cat.label}
              </Button>
            )
          })}
        </div>

        {/* FAQs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="hidden text-xs sm:inline-flex">
                        {faq.category}
                      </Badge>
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No results found for &quot;{searchQuery}&quot;
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="transition-colors hover:border-primary">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Shield className="mb-3 h-8 w-8 text-primary" />
              <h3 className="font-semibold">Security</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Learn about our security measures
              </p>
              <Button variant="link" className="mt-2" asChild>
                <Link href="#">View Audit Report</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:border-primary">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <MessageCircle className="mb-3 h-8 w-8 text-primary" />
              <h3 className="font-semibold">Community</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Join our Discord community
              </p>
              <Button variant="link" className="mt-2" asChild>
                <Link href="#">
                  Join Discord
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:border-primary">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Clock className="mb-3 h-8 w-8 text-primary" />
              <h3 className="font-semibold">Documentation</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Read our full documentation
              </p>
              <Button variant="link" className="mt-2" asChild>
                <Link href="#">
                  View Docs
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

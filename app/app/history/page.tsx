"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  History as HistoryIcon, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Wallet
} from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import { useAccount } from "wagmi"
import { 
  useUserBorrowerLoans, 
  useUserLenderLoans, 
  formatTokenAmount,
  getTokenByAddress,
  type ContractLoan
} from "@/lib/contract-hooks"
import { LoanStatus, LOAN_STATUS_LABELS } from "@/lib/web3-config"

type HistoryFilter = "all" | "borrowed" | "lent" | "repaid" | "defaulted"

interface LoanHistoryItem {
  id: bigint
  loan: ContractLoan
  isExpired: boolean
  role: "borrower" | "lender"
}

export default function HistoryPage() {
  const { isTerminalMode } = useAppContext()
  const { address, isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<HistoryFilter>("all")

  const { loans: borrowerLoans, isLoading: loadingBorrower } = useUserBorrowerLoans()
  const { loans: lenderLoans, isLoading: loadingLender } = useUserLenderLoans()

  const isLoading = loadingBorrower || loadingLender

  // Combine and deduplicate loans
  const allLoans = useMemo(() => {
    const loansMap = new Map<string, LoanHistoryItem>()
    
    borrowerLoans.forEach(l => {
      loansMap.set(l.id.toString(), { ...l, role: "borrower" })
    })
    
    lenderLoans.forEach(l => {
      const key = l.id.toString()
      if (!loansMap.has(key)) {
        loansMap.set(key, { ...l, role: "lender" })
      }
    })
    
    return Array.from(loansMap.values()).sort((a, b) => 
      Number(b.id) - Number(a.id)
    )
  }, [borrowerLoans, lenderLoans])

  // Filter loans
  const filteredLoans = useMemo(() => {
    return allLoans.filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const collateralToken = getTokenByAddress(item.loan.collateralToken)
        const loanToken = getTokenByAddress(item.loan.loanToken)
        const matchesSearch = 
          item.id.toString().includes(query) ||
          collateralToken?.symbol.toLowerCase().includes(query) ||
          loanToken?.symbol.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Type filter
      if (filter === "all") return true
      if (filter === "borrowed") return item.role === "borrower"
      if (filter === "lent") return item.role === "lender"
      if (filter === "repaid") return item.loan.status === LoanStatus.REPAID
      if (filter === "defaulted") return item.loan.status === LoanStatus.DEFAULTED
      return true
    })
  }, [allLoans, searchQuery, filter])

  const getRoleIcon = (role: string, status: number) => {
    if (status === LoanStatus.DEFAULTED) return <XCircle className="h-4 w-4" />
    if (status === LoanStatus.REPAID) return <CheckCircle2 className="h-4 w-4" />
    if (role === "borrower") return <ArrowDownLeft className="h-4 w-4" />
    return <ArrowUpRight className="h-4 w-4" />
  }

  const getRoleColor = (role: string, status: number) => {
    if (status === LoanStatus.DEFAULTED) return "text-red-500 bg-red-500/10"
    if (status === LoanStatus.REPAID) return "text-green-500 bg-green-500/10"
    if (role === "borrower") return "text-blue-500 bg-blue-500/10"
    return "text-emerald-500 bg-emerald-500/10"
  }

  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return "Pending"
    const date = new Date(Number(timestamp) * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 1) return "Today"
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <div className="mb-6">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <HistoryIcon className="h-6 w-6" />
              Transaction History
            </h1>
            <p className="text-muted-foreground">
              View all your past transactions on Pawn.credit
            </p>
          </div>
          <Card>
            <CardContent className="py-16 text-center">
              <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
              <p className="mt-2 text-muted-foreground">
                Connect your wallet to view your transaction history
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isTerminalMode) {
    return (
      <div className="min-h-screen bg-background p-4 font-mono text-xs">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 border-b border-border pb-2">
            <span className="text-primary">PAWN.CREDIT</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span>LOAN_HISTORY</span>
            <span className="ml-4 text-muted-foreground">
              TOTAL: {filteredLoans.length}
            </span>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <span className="text-muted-foreground">FILTER:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as HistoryFilter)}
              className="bg-transparent outline-none"
            >
              <option value="all">ALL</option>
              <option value="borrowed">BORROWED</option>
              <option value="lent">LENT</option>
              <option value="repaid">REPAID</option>
              <option value="defaulted">DEFAULTED</option>
            </select>
            <span className="text-muted-foreground">SEARCH:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              placeholder="Loan ID or token..."
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">LOADING...</span>
            </div>
          ) : (
            <div className="rounded border border-border">
              <div className="grid grid-cols-6 gap-2 border-b border-border p-2 text-muted-foreground">
                <span>ID</span>
                <span>ROLE</span>
                <span>COLLATERAL</span>
                <span>LOAN</span>
                <span>STATUS</span>
                <span>DATE</span>
              </div>
              
              {filteredLoans.map(item => {
                const collateralToken = getTokenByAddress(item.loan.collateralToken)
                const loanToken = getTokenByAddress(item.loan.loanToken)
                return (
                  <Link 
                    key={item.id.toString()} 
                    href={`/app/loan/${item.id.toString()}`}
                    className="grid grid-cols-6 gap-2 border-b border-border p-2 last:border-0 hover:bg-primary/5"
                  >
                    <span className="text-primary">#{item.id.toString()}</span>
                    <span className={cn(
                      item.role === "borrower" && "text-blue-500",
                      item.role === "lender" && "text-emerald-500"
                    )}>
                      {item.role.toUpperCase()}
                    </span>
                    <span>
                      {formatTokenAmount(item.loan.collateralAmount, collateralToken?.decimals || 18)} {collateralToken?.symbol || "???"}
                    </span>
                    <span>
                      {formatTokenAmount(item.loan.loanAmount, loanToken?.decimals || 18)} {loanToken?.symbol || "???"}
                    </span>
                    <span className={cn(
                      item.loan.status === LoanStatus.ACTIVE && "text-green-500",
                      item.loan.status === LoanStatus.OPEN && "text-blue-500",
                      item.loan.status === LoanStatus.REPAID && "text-emerald-500",
                      item.loan.status === LoanStatus.DEFAULTED && "text-red-500",
                      item.loan.status === LoanStatus.CANCELLED && "text-muted-foreground"
                    )}>
                      {LOAN_STATUS_LABELS[item.loan.status as LoanStatus]}
                    </span>
                    <span className="text-muted-foreground">
                      {formatTimestamp(item.loan.startTime || BigInt(0))}
                    </span>
                  </Link>
                )
              })}

              {filteredLoans.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  NO_LOANS_FOUND
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <HistoryIcon className="h-6 w-6" />
            Loan History
          </h1>
          <p className="text-muted-foreground">
            View all your loans on Pawn.credit
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by loan ID or token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as HistoryFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Loans</SelectItem>
                <SelectItem value="borrowed">As Borrower</SelectItem>
                <SelectItem value="lent">As Lender</SelectItem>
                <SelectItem value="repaid">Repaid</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Loans List */}
        {!isLoading && (
          <div className="space-y-3">
            {filteredLoans.map(item => {
              const collateralToken = getTokenByAddress(item.loan.collateralToken)
              const loanToken = getTokenByAddress(item.loan.loanToken)
              
              return (
                <Link key={item.id.toString()} href={`/app/loan/${item.id.toString()}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          getRoleColor(item.role, item.loan.status)
                        )}>
                          {getRoleIcon(item.role, item.loan.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              Loan #{item.id.toString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.role === "borrower" ? "Borrower" : "Lender"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTimestamp(item.loan.startTime || BigInt(0))}</span>
                            <span>-</span>
                            <span>
                              {formatTokenAmount(item.loan.collateralAmount, collateralToken?.decimals || 18)} {collateralToken?.symbol || "???"}
                              {" -> "}
                              {formatTokenAmount(item.loan.loanAmount, loanToken?.decimals || 18)} {loanToken?.symbol || "???"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            item.loan.status === LoanStatus.ACTIVE && "border-green-500/50 text-green-500",
                            item.loan.status === LoanStatus.OPEN && "border-blue-500/50 text-blue-500",
                            item.loan.status === LoanStatus.REPAID && "border-emerald-500/50 text-emerald-500",
                            item.loan.status === LoanStatus.DEFAULTED && "border-red-500/50 text-red-500",
                            item.loan.status === LoanStatus.CANCELLED && "border-muted-foreground/50 text-muted-foreground"
                          )}
                        >
                          {item.loan.status === LoanStatus.ACTIVE && <Clock className="mr-1 h-3 w-3" />}
                          {item.loan.status === LoanStatus.REPAID && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {item.loan.status === LoanStatus.DEFAULTED && <XCircle className="mr-1 h-3 w-3" />}
                          {LOAN_STATUS_LABELS[item.loan.status as LoanStatus]}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}

            {filteredLoans.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <HistoryIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-semibold">No loans found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery || filter !== "all" 
                      ? "Try adjusting your filters" 
                      : "Your loan history will appear here once you create or fund a loan"}
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button asChild>
                      <Link href="/app/borrow">Create Loan</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/app/lend">Browse Market</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

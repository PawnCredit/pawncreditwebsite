'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useApp } from '@/lib/app-context'
import { TOKENS, type TokenInfo, LoanStatus, LOAN_STATUS_LABELS, LOAN_STATUS_COLORS } from '@/lib/web3-config'
import { useOpenLoans, useActiveLoans, useFundLoan, getTokenByAddress, formatTokenAmount, type ContractLoan } from '@/lib/contract-hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Search, Filter, ArrowUpDown, Clock, Coins, Shield, ChevronRight, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

type SortField = 'amount' | 'duration' | 'collateral'
type SortDirection = 'asc' | 'desc'

interface LoanMarketProps {
  className?: string
}

export function LoanMarket({ className }: LoanMarketProps) {
  const { viewMode } = useApp()
  const { address } = useAccount()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('amount')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedLoan, setSelectedLoan] = useState<bigint | null>(null)

  // Fetch real loans from contract
  const { loans: openLoans, isLoading: isLoadingOpen } = useOpenLoans()
  const { loans: activeLoans, isLoading: isLoadingActive } = useActiveLoans()

  const isLoading = isLoadingOpen || isLoadingActive

  // Combine loans based on filter
  const allLoans = statusFilter === '0' 
    ? openLoans 
    : statusFilter === '1' 
      ? activeLoans 
      : [...openLoans, ...activeLoans]

  const filteredLoans = allLoans
    .filter(({ loan }) => {
      if (search) {
        const searchLower = search.toLowerCase()
        const collateralToken = getTokenByAddress(loan.collateralToken)
        const loanToken = getTokenByAddress(loan.loanToken)
        return (
          collateralToken?.symbol.toLowerCase().includes(searchLower) ||
          loanToken?.symbol.toLowerCase().includes(searchLower) ||
          loan.borrower.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .sort((a, b) => {
      let aVal: bigint, bVal: bigint
      switch (sortField) {
        case 'amount':
          aVal = a.loan.loanAmount
          bVal = b.loan.loanAmount
          break
        case 'duration':
          aVal = a.loan.duration
          bVal = b.loan.duration
          break
        case 'collateral':
          aVal = a.loan.collateralAmount
          bVal = b.loan.collateralAmount
          break
        default:
          return 0
      }
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  if (viewMode === 'advanced') {
    return <LoanMarketTerminal loans={filteredLoans} isLoading={isLoading} className={className} />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by token or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="0">Open</SelectItem>
              <SelectItem value="1">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort Buttons (Mobile) */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden">
        {(['amount', 'duration', 'collateral'] as SortField[]).map((field) => (
          <Button
            key={field}
            variant={sortField === field ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleSort(field)}
            className="shrink-0 gap-1 text-xs"
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortField === field && (
              <ArrowUpDown className="h-3 w-3" />
            )}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading loans from blockchain...</span>
        </div>
      )}

      {/* Loan Cards */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredLoans.map(({ loan, isExpired }) => (
            <LoanCard
              key={loan.id.toString()}
              loan={loan}
              isExpired={isExpired}
              isSelected={selectedLoan === loan.id}
              onSelect={() => setSelectedLoan(loan.id === selectedLoan ? null : loan.id)}
              userAddress={address}
            />
          ))}
          {filteredLoans.length === 0 && (
            <div className="py-12 text-center">
              <Coins className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No loans found</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Create a new loan offer or check back later
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface LoanCardProps {
  loan: ContractLoan
  isExpired: boolean
  isSelected: boolean
  onSelect: () => void
  userAddress?: `0x${string}`
}

function LoanCard({ loan, isExpired, isSelected, onSelect, userAddress }: LoanCardProps) {
  const collateralToken = getTokenByAddress(loan.collateralToken) || { symbol: '???', decimals: 18 }
  const loanToken = getTokenByAddress(loan.loanToken) || { symbol: '???', decimals: 18 }
  
  const collateralAmount = formatTokenAmount(loan.collateralAmount, collateralToken.decimals)
  const loanAmount = formatTokenAmount(loan.loanAmount, loanToken.decimals)
  const borrowerReceives = formatTokenAmount(loan.borrowerReceives, loanToken.decimals)
  
  const durationDays = Math.floor(Number(loan.duration) / (24 * 60 * 60))
  const isOwner = userAddress?.toLowerCase() === loan.borrower.toLowerCase()
  const canFund = loan.status === LoanStatus.OPEN && !isOwner && !isExpired

  const { fundLoan, isPending: isFunding } = useFundLoan()

  const getTimeRemaining = () => {
    if (loan.status !== LoanStatus.ACTIVE || !loan.startTime) return null
    const endTime = Number(loan.startTime) + Number(loan.duration)
    const now = Date.now() / 1000
    if (now >= endTime) return 'Expired'
    return formatDistanceToNow(new Date(endTime * 1000), { addSuffix: false })
  }

  const handleFund = async () => {
    try {
      await fundLoan(loan.id)
    } catch (error) {
      console.error('Failed to fund loan:', error)
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-all',
        isSelected && 'ring-2 ring-primary',
        'hover:border-primary/50'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold ring-2 ring-card">
              {collateralToken.symbol.slice(0, 2)}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-card">
              {loanToken.symbol.slice(0, 2)}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">
              {parseFloat(collateralAmount).toLocaleString()} {collateralToken.symbol}
              <span className="mx-1.5 text-muted-foreground">→</span>
              {parseFloat(loanAmount).toLocaleString()} {loanToken.symbol}
            </p>
            <p className="text-xs text-muted-foreground">
              Loan #{loan.id.toString()}
            </p>
          </div>
        </div>
        <span className={cn('text-xs font-medium', LOAN_STATUS_COLORS[loan.status as LoanStatus])}>
          {isExpired && loan.status === LoanStatus.OPEN ? 'Expired' : LOAN_STATUS_LABELS[loan.status as LoanStatus]}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="mb-3 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-secondary/50 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Duration
          </div>
          <p className="font-mono text-sm font-medium">{durationDays}d</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            Fee
          </div>
          <p className="font-mono text-sm font-medium">
            {formatTokenAmount(loan.originationFee, loanToken.decimals)} {loanToken.symbol}
          </p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Coins className="h-3 w-3" />
            Receive
          </div>
          <p className="font-mono text-sm font-medium">{parseFloat(borrowerReceives).toLocaleString()}</p>
        </div>
      </div>

      {/* Time Remaining (for active loans) */}
      {loan.status === LoanStatus.ACTIVE && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-[var(--pawn-amber)]/10 px-3 py-2">
          <span className="text-xs text-muted-foreground">Time Remaining</span>
          <span className="font-mono text-sm font-medium text-[var(--pawn-amber)]">
            {getTimeRemaining()}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href={`/app/loan/${loan.id.toString()}`}>
          <Button variant="ghost" size="sm" className="text-xs">
            View Details
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
        {canFund && (
          <Button size="sm" className="text-xs" onClick={handleFund} disabled={isFunding}>
            {isFunding ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Fund Loan
          </Button>
        )}
        {isOwner && loan.status === LoanStatus.OPEN && (
          <Button variant="outline" size="sm" className="text-xs">
            Cancel
          </Button>
        )}
        {isOwner && loan.status === LoanStatus.ACTIVE && (
          <Button size="sm" className="text-xs">
            Repay
          </Button>
        )}
      </div>
    </div>
  )
}

interface TerminalLoanData {
  loan: ContractLoan
  isExpired: boolean
}

function LoanMarketTerminal({ loans, isLoading, className }: { loans: TerminalLoanData[]; isLoading: boolean; className?: string }) {
  return (
    <div className={cn('font-mono text-xs', className)}>
      {/* Header */}
      <div className="mb-2 border-b border-border pb-2">
        <span className="text-[var(--pawn-amber)]">LOAN_MARKET</span>
        <span className="ml-4 text-muted-foreground">
          TOTAL: <span className="text-[var(--pawn-green)]">{loans.length}</span>
        </span>
        {isLoading && <span className="ml-4 animate-pulse text-[var(--pawn-amber)]">LOADING...</span>}
      </div>

      {/* Table Header */}
      <div className="mb-1 grid grid-cols-12 gap-1 text-muted-foreground">
        <span className="col-span-1">ID</span>
        <span className="col-span-2">COLL</span>
        <span className="col-span-2">LOAN</span>
        <span className="col-span-2">AMT</span>
        <span className="col-span-1">DUR</span>
        <span className="col-span-2">FEE</span>
        <span className="col-span-2">ACTION</span>
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {loans.map(({ loan, isExpired }) => {
          const collateralToken = getTokenByAddress(loan.collateralToken) || { symbol: '???', decimals: 18 }
          const loanToken = getTokenByAddress(loan.loanToken) || { symbol: '???', decimals: 18 }
          const durationDays = Math.floor(Number(loan.duration) / (24 * 60 * 60))
          
          return (
            <div key={loan.id.toString()} className="grid grid-cols-12 gap-1 py-0.5 hover:bg-secondary/30">
              <span className="col-span-1 text-[var(--pawn-blue)]">#{loan.id.toString()}</span>
              <span className="col-span-2 text-foreground">
                {parseFloat(formatTokenAmount(loan.collateralAmount, collateralToken.decimals)).toFixed(2)} {collateralToken.symbol}
              </span>
              <span className="col-span-2 text-foreground">
                {loanToken.symbol}
              </span>
              <span className="col-span-2 text-[var(--pawn-green)]">
                {parseFloat(formatTokenAmount(loan.loanAmount, loanToken.decimals)).toLocaleString()}
              </span>
              <span className="col-span-1">{durationDays}d</span>
              <span className="col-span-2 text-muted-foreground">
                {formatTokenAmount(loan.originationFee, loanToken.decimals)}
              </span>
              <span className="col-span-2">
                {loan.status === LoanStatus.OPEN && !isExpired ? (
                  <Link href={`/app/loan/${loan.id.toString()}`} className="text-[var(--pawn-amber)] hover:underline">[FUND]</Link>
                ) : (
                  <span className="text-muted-foreground">---</span>
                )}
              </span>
            </div>
          )
        })}
        {!isLoading && loans.length === 0 && (
          <div className="py-4 text-center text-muted-foreground">
            NO_LOANS_FOUND
          </div>
        )}
      </div>
    </div>
  )
}

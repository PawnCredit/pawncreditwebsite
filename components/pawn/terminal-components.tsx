"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OrderBookEntry {
  price: number
  amount: number
  total: number
  type: "bid" | "ask"
}

interface OrderBookProps {
  collateralToken?: string
  loanToken?: string
  className?: string
}

export function OrderBook({ 
  collateralToken = "WETH", 
  loanToken = "USDC",
  className 
}: OrderBookProps) {
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState(0)

  useEffect(() => {
    // Generate mock order book data
    const generateOrders = () => {
      const basePrice = 2500 // WETH/USDC
      
      const newAsks: OrderBookEntry[] = []
      const newBids: OrderBookEntry[] = []
      
      let askTotal = 0
      let bidTotal = 0
      
      // Generate asks (selling collateral / borrowing)
      for (let i = 0; i < 8; i++) {
        const price = basePrice + (i + 1) * (Math.random() * 5 + 2)
        const amount = Math.random() * 2 + 0.1
        askTotal += amount
        newAsks.push({
          price: parseFloat(price.toFixed(2)),
          amount: parseFloat(amount.toFixed(4)),
          total: parseFloat(askTotal.toFixed(4)),
          type: "ask"
        })
      }
      
      // Generate bids (buying collateral / lending)
      for (let i = 0; i < 8; i++) {
        const price = basePrice - (i + 1) * (Math.random() * 5 + 2)
        const amount = Math.random() * 2 + 0.1
        bidTotal += amount
        newBids.push({
          price: parseFloat(price.toFixed(2)),
          amount: parseFloat(amount.toFixed(4)),
          total: parseFloat(bidTotal.toFixed(4)),
          type: "bid"
        })
      }
      
      setAsks(newAsks.reverse())
      setBids(newBids)
      setSpread(parseFloat((newAsks[newAsks.length - 1]?.price - newBids[0]?.price).toFixed(2)))
    }
    
    generateOrders()
    const interval = setInterval(generateOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const maxTotal = Math.max(
    ...asks.map(a => a.total),
    ...bids.map(b => b.total)
  )

  return (
    <div className={cn("rounded border border-border bg-card font-mono text-xs", className)}>
      <div className="border-b border-border p-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">ORDER_BOOK</span>
          <span>{collateralToken}/{loanToken}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-1 border-b border-border p-2 text-muted-foreground">
        <span>PRICE</span>
        <span className="text-right">AMT</span>
        <span className="text-right">TOTAL</span>
        <span className="text-right">DEPTH</span>
      </div>
      
      {/* Asks */}
      <div className="max-h-[160px] overflow-y-auto">
        {asks.map((ask, i) => (
          <div 
            key={`ask-${i}`} 
            className="relative grid grid-cols-4 gap-1 px-2 py-1"
          >
            <div 
              className="absolute inset-y-0 right-0 bg-red-500/10"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-red-500">{ask.price.toFixed(2)}</span>
            <span className="relative text-right">{ask.amount.toFixed(4)}</span>
            <span className="relative text-right">{ask.total.toFixed(4)}</span>
            <span className="relative text-right text-muted-foreground">
              {((ask.total / maxTotal) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      
      {/* Spread */}
      <div className="border-y border-border bg-muted/50 p-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">SPREAD:</span>
          <span className={spread > 0 ? "text-green-500" : "text-red-500"}>
            ${spread.toFixed(2)} ({((spread / 2500) * 100).toFixed(2)}%)
          </span>
        </div>
      </div>
      
      {/* Bids */}
      <div className="max-h-[160px] overflow-y-auto">
        {bids.map((bid, i) => (
          <div 
            key={`bid-${i}`} 
            className="relative grid grid-cols-4 gap-1 px-2 py-1"
          >
            <div 
              className="absolute inset-y-0 right-0 bg-green-500/10"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-green-500">{bid.price.toFixed(2)}</span>
            <span className="relative text-right">{bid.amount.toFixed(4)}</span>
            <span className="relative text-right">{bid.total.toFixed(4)}</span>
            <span className="relative text-right text-muted-foreground">
              {((bid.total / maxTotal) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface RecentTradesProps {
  className?: string
}

export function RecentTrades({ className }: RecentTradesProps) {
  const [trades, setTrades] = useState<{
    id: number
    type: "borrow" | "repay" | "default"
    amount: number
    token: string
    price: number
    time: Date
  }[]>([])

  useEffect(() => {
    const generateTrades = () => {
      const types: ("borrow" | "repay" | "default")[] = ["borrow", "repay", "default"]
      const tokens = ["WETH", "USDC", "DAI", "WBTC"]
      
      const newTrades = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        type: types[Math.floor(Math.random() * 3)],
        amount: parseFloat((Math.random() * 10000 + 100).toFixed(2)),
        token: tokens[Math.floor(Math.random() * tokens.length)],
        price: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
        time: new Date(Date.now() - Math.random() * 3600000)
      }))
      
      setTrades(newTrades)
    }
    
    generateTrades()
    const interval = setInterval(generateTrades, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("rounded border border-border bg-card font-mono text-xs", className)}>
      <div className="border-b border-border p-2">
        <span className="text-muted-foreground">RECENT_TRADES</span>
      </div>
      
      <div className="grid grid-cols-5 gap-1 border-b border-border p-2 text-muted-foreground">
        <span>TYPE</span>
        <span className="text-right">AMT</span>
        <span>TOKEN</span>
        <span className="text-right">VALUE</span>
        <span className="text-right">TIME</span>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto">
        {trades.map((trade) => (
          <div key={trade.id} className="grid grid-cols-5 gap-1 px-2 py-1">
            <span className={cn(
              trade.type === "borrow" && "text-blue-500",
              trade.type === "repay" && "text-green-500",
              trade.type === "default" && "text-red-500"
            )}>
              {trade.type.toUpperCase()}
            </span>
            <span className="text-right">{trade.amount.toLocaleString()}</span>
            <span>{trade.token}</span>
            <span className="text-right">${trade.price.toLocaleString()}</span>
            <span className="text-right text-muted-foreground">
              {trade.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PriceChartProps {
  className?: string
}

export function TerminalPriceChart({ className }: PriceChartProps) {
  const [prices, setPrices] = useState<number[]>([])
  
  useEffect(() => {
    const generatePrices = () => {
      const newPrices: number[] = []
      let price = 2500
      for (let i = 0; i < 50; i++) {
        price += (Math.random() - 0.5) * 20
        newPrices.push(price)
      }
      setPrices(newPrices)
    }
    
    generatePrices()
    const interval = setInterval(generatePrices, 5000)
    return () => clearInterval(interval)
  }, [])

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min
  
  const getY = (price: number) => {
    return 100 - ((price - min) / range) * 100
  }

  const pathData = prices.length > 0
    ? `M 0 ${getY(prices[0])} ` + prices.slice(1).map((p, i) => 
        `L ${((i + 1) / (prices.length - 1)) * 100} ${getY(p)}`
      ).join(' ')
    : ''

  const lastPrice = prices[prices.length - 1] || 0
  const firstPrice = prices[0] || 0
  const change = lastPrice - firstPrice
  const changePercent = ((change / firstPrice) * 100).toFixed(2)

  return (
    <div className={cn("rounded border border-border bg-card font-mono text-xs", className)}>
      <div className="flex items-center justify-between border-b border-border p-2">
        <span className="text-muted-foreground">WETH/USDC_1H</span>
        <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
          ${lastPrice.toFixed(2)} ({change >= 0 ? "+" : ""}{changePercent}%)
        </span>
      </div>
      
      <div className="relative h-[120px] p-2">
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d={pathData}
            fill="none"
            stroke={change >= 0 ? "#22c55e" : "#ef4444"}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute right-0 top-0 flex h-full flex-col justify-between text-muted-foreground">
          <span>${max.toFixed(0)}</span>
          <span>${min.toFixed(0)}</span>
        </div>
      </div>
    </div>
  )
}

interface PositionSummaryProps {
  className?: string
}

export function PositionSummary({ className }: PositionSummaryProps) {
  return (
    <div className={cn("rounded border border-border bg-card font-mono text-xs", className)}>
      <div className="border-b border-border p-2">
        <span className="text-muted-foreground">POSITION_SUMMARY</span>
      </div>
      
      <div className="space-y-2 p-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">ACTIVE_BORROWS:</span>
          <span>2</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ACTIVE_LOANS:</span>
          <span>1</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">TOTAL_COLLATERAL:</span>
          <span>3.5 WETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">TOTAL_BORROWED:</span>
          <span>7,000 USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">TOTAL_LENT:</span>
          <span>5,000 USDC</span>
        </div>
        <div className="border-t border-border pt-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">NET_EXPOSURE:</span>
            <span className="text-red-500">-2,000 USDC</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CommandLineProps {
  onCommand?: (cmd: string) => void
  className?: string
}

export function CommandLine({ onCommand, className }: CommandLineProps) {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([
    "PAWN.CREDIT TERMINAL v1.0.0",
    "Type 'help' for available commands",
    "",
    "> connect wallet",
    "WALLET_NOT_CONNECTED",
    "",
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const cmd = input.toLowerCase().trim()
    let response = ""
    
    switch (cmd) {
      case "help":
        response = `AVAILABLE_COMMANDS:
  market     - View loan market
  borrow     - Create borrow request
  lend       - Fund a loan
  portfolio  - View positions
  stats      - Platform statistics
  clear      - Clear terminal`
        break
      case "clear":
        setHistory([])
        setInput("")
        return
      case "stats":
        response = `PLATFORM_STATS:
  TVL: $2,400,000
  ACTIVE_LOANS: 847
  DEFAULT_RATE: 2.3%
  AVG_DURATION: 14d`
        break
      case "market":
        response = "Navigating to market..."
        window.location.href = "/app"
        break
      default:
        response = `UNKNOWN_COMMAND: ${cmd}`
    }
    
    setHistory(prev => [...prev, `> ${input}`, response, ""])
    setInput("")
    onCommand?.(cmd)
  }

  return (
    <div className={cn("rounded border border-border bg-card font-mono text-xs", className)}>
      <div className="border-b border-border p-2">
        <span className="text-muted-foreground">TERMINAL</span>
      </div>
      
      <div className="h-[200px] overflow-y-auto p-2">
        {history.map((line, i) => (
          <div key={i} className={cn(
            line.startsWith(">") && "text-primary",
            line.includes("ERROR") && "text-red-500",
            line.includes("SUCCESS") && "text-green-500"
          )}>
            {line || "\u00A0"}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-border p-2">
        <div className="flex items-center gap-2">
          <span className="text-primary">{">"}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  )
}

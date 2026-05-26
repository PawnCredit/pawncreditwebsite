"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Coins, 
  Plus, 
  Search,
  Star,
  StarOff,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import { TOKENS, type TokenInfo } from "@/lib/web3-config"

interface CustomToken extends TokenInfo {
  isCustom: boolean
  isFavorite: boolean
}

// Convert TOKENS object to array
const TOKENS_ARRAY = Object.values(TOKENS) as TokenInfo[]

export default function TokensPage() {
  const { isTerminalMode } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [customAddress, setCustomAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [customTokens, setCustomTokens] = useState<CustomToken[]>([])
  const [favorites, setFavorites] = useState<string[]>(["WETH", "USDC"])

  const allTokens: CustomToken[] = [
    ...TOKENS_ARRAY.map(t => ({ ...t, isCustom: false, isFavorite: favorites.includes(t.symbol) })),
    ...customTokens
  ]

  const filteredTokens = allTokens.filter(token =>
    searchQuery === "" ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return 0
  })

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  const removeCustomToken = (address: string) => {
    setCustomTokens(prev => prev.filter(t => t.address !== address))
  }

  const handleAddToken = async () => {
    if (!customAddress || customAddress.length !== 42) return
    
    setIsLoading(true)
    // Simulate fetching token info
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newToken: CustomToken = {
      symbol: "CUSTOM",
      name: "Custom Token",
      address: customAddress as `0x${string}`,
      decimals: 18,
      isCustom: true,
      isFavorite: false
    }
    
    setCustomTokens(prev => [...prev, newToken])
    setCustomAddress("")
    setIsLoading(false)
    setIsAddDialogOpen(false)
  }

  if (isTerminalMode) {
    return (
      <div className="min-h-screen bg-background p-4 font-mono text-xs">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 border-b border-border pb-2">
            <span className="text-primary">PAWN.CREDIT</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span>TOKEN_MANAGER</span>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <span className="text-muted-foreground">SEARCH:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              placeholder="Symbol, name, or address..."
            />
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="border border-primary px-2 py-1 text-primary"
            >
              [ADD_TOKEN]
            </button>
          </div>

          <div className="rounded border border-border">
            <div className="grid grid-cols-6 gap-2 border-b border-border p-2 text-muted-foreground">
              <span>FAV</span>
              <span>SYMBOL</span>
              <span>NAME</span>
              <span className="col-span-2">ADDRESS</span>
              <span>ACTION</span>
            </div>
            
            {sortedTokens.map(token => (
              <div 
                key={token.address} 
                className="grid grid-cols-6 gap-2 border-b border-border p-2 last:border-0"
              >
                <button
                  onClick={() => toggleFavorite(token.symbol)}
                  className={token.isFavorite ? "text-amber-500" : "text-muted-foreground"}
                >
                  {token.isFavorite ? "[*]" : "[ ]"}
                </button>
                <span className="text-primary">{token.symbol}</span>
                <span>{token.name}</span>
                <span className="col-span-2 text-muted-foreground">{token.address}</span>
                <div>
                  {token.isCustom && (
                    <button
                      onClick={() => removeCustomToken(token.address)}
                      className="text-red-500"
                    >
                      [DEL]
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isAddDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded border border-border bg-background p-4">
                <div className="mb-4 text-primary">ADD_CUSTOM_TOKEN</div>
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground">CONTRACT_ADDRESS:</span>
                    <input
                      type="text"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="mt-1 w-full bg-transparent outline-none"
                      placeholder="0x..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToken}
                      disabled={isLoading || customAddress.length !== 42}
                      className="border border-primary px-4 py-1 text-primary disabled:opacity-50"
                    >
                      {isLoading ? "[LOADING...]" : "[ADD]"}
                    </button>
                    <button
                      onClick={() => setIsAddDialogOpen(false)}
                      className="border border-border px-4 py-1"
                    >
                      [CANCEL]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Coins className="h-6 w-6" />
              Token Manager
            </h1>
            <p className="text-muted-foreground">
              Manage supported tokens and add custom ERC-20 contracts
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Token
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Token</DialogTitle>
                <DialogDescription>
                  Enter the contract address of the ERC-20 token you want to add.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Contract Address</Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                  />
                </div>
                {customAddress && customAddress.length !== 42 && (
                  <div className="flex items-center gap-2 text-sm text-amber-500">
                    <AlertCircle className="h-4 w-4" />
                    Address must be 42 characters (including 0x)
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddToken}
                  disabled={isLoading || customAddress.length !== 42}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Add Token
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by symbol, name, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-amber-500" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sortedTokens
                  .filter(t => t.isFavorite)
                  .map(token => (
                    <Badge 
                      key={token.address} 
                      variant="secondary"
                      className="gap-1 py-1.5 pl-3 pr-1"
                    >
                      {token.symbol}
                      <button
                        onClick={() => toggleFavorite(token.symbol)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <StarOff className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Token List */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Tokens</CardTitle>
            <CardDescription>
              {sortedTokens.length} tokens available for collateral and loans
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {sortedTokens.map(token => (
                <div 
                  key={token.address}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{token.symbol}</span>
                        {token.isCustom && (
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://basescan.org/token/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full p-2 hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                    <button
                      onClick={() => toggleFavorite(token.symbol)}
                      className={cn(
                        "rounded-full p-2 hover:bg-muted",
                        token.isFavorite && "text-amber-500"
                      )}
                    >
                      {token.isFavorite ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </button>
                    {token.isCustom && (
                      <button
                        onClick={() => removeCustomToken(token.address)}
                        className="rounded-full p-2 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="flex items-start gap-4 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
            <div>
              <h4 className="font-semibold">Adding Custom Tokens</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Make sure to verify the contract address on BaseScan before adding custom tokens.
                Only add tokens from trusted sources to avoid scams.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

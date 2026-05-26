'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Wallet, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Terminal,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  LayoutGrid,
  Settings,
  MoreHorizontal,
  BookOpen,
  BarChart3,
  Coins,
  HelpCircle,
  History
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

const navLinks = [
  { href: '/app', label: 'Market' },
  { href: '/app/borrow', label: 'Borrow' },
  { href: '/app/lend', label: 'Lend' },
  { href: '/app/portfolio', label: 'Portfolio' },
]

const moreLinks = [
  { href: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/app/history', label: 'History', icon: History },
  { href: '/app/guide', label: 'Guide', icon: BookOpen },
  { href: '/app/token', label: '$PAWN Token', icon: Coins },
  { href: '/app/help', label: 'Help', icon: HelpCircle },
]

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme, viewMode, toggleViewMode } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-theme">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                pathname === link.href
                  ? 'text-foreground bg-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {link.label}
            </Link>
          ))}
          
          {/* More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1',
                  moreLinks.some(l => pathname === l.href)
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                More
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {moreLinks.map((link) => {
                const Icon = link.icon
                return (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleViewMode}
            className="hidden gap-2 text-xs sm:flex"
          >
            {viewMode === 'simple' ? (
              <>
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden lg:inline">Simple</span>
              </>
            ) : (
              <>
                <Terminal className="h-4 w-4" />
                <span className="hidden lg:inline">Terminal</span>
              </>
            )}
          </Button>

          {/* Theme Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {theme === 'light' && <Sun className="h-4 w-4" />}
                {theme === 'dark' && <Moon className="h-4 w-4" />}
                {theme === 'terminal' && <Terminal className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('terminal')}>
                <Terminal className="mr-2 h-4 w-4" />
                Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Connect Wallet */}
          {isConnected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--pawn-green)]" />
                  <span className="font-mono text-xs">{formatAddress(address)}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={copyAddress}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/app/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => disconnect()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2" disabled={isPending}>
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Connect</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {connectors.map((connector) => (
                  <DropdownMenuItem
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                  >
                    {connector.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition-colors rounded-lg',
                  pathname === link.href
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between px-4 py-2">
              <span className="text-sm text-muted-foreground">View Mode</span>
              <Button variant="outline" size="sm" onClick={toggleViewMode}>
                {viewMode === 'simple' ? 'Simple' : 'Terminal'}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

'use client'

import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Sun, Moon, Terminal, Check, Copy, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme, viewMode, setViewMode } = useApp()
  const [slippage, setSlippage] = useState('0.5')
  const [notifications, setNotifications] = useState(true)
  const [copied, setCopied] = useState(false)

  const copyReferralLink = () => {
    navigator.clipboard.writeText('https://pawn.credit?ref=YOUR_ADDRESS')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your Pawn.credit experience.
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          {/* Theme */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 font-medium">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                  theme === 'light' ? 'border-primary' : 'border-border hover:border-primary/50'
                )}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                  theme === 'dark' ? 'border-primary' : 'border-border hover:border-primary/50'
                )}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm">Dark</span>
              </button>
              <button
                onClick={() => setTheme('terminal')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                  theme === 'terminal' ? 'border-primary' : 'border-border hover:border-primary/50'
                )}
              >
                <Terminal className="h-6 w-6" />
                <span className="text-sm">Terminal</span>
              </button>
            </div>
          </div>

          {/* View Mode */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Advanced Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Bloomberg Terminal-style interface for power users
                </p>
              </div>
              <Switch
                checked={viewMode === 'advanced'}
                onCheckedChange={(checked) => setViewMode(checked ? 'advanced' : 'simple')}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="mt-6 space-y-6">
          {/* Slippage */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 font-medium">Slippage Tolerance</h3>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((val) => (
                <Button
                  key={val}
                  variant={slippage === val ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSlippage(val)}
                >
                  {val}%
                </Button>
              ))}
              <Input
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-20 font-mono"
                placeholder="Custom"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your transaction will revert if the price changes more than this percentage.
            </p>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Loan Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified when your loans are about to expire
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="mt-6 space-y-6">
          {/* Referral */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 font-medium">Referral Link</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Share your referral link and earn 10% of your referrals&apos; platform fees.
            </p>
            <div className="flex gap-2">
              <Input
                value="https://pawn.credit?ref=YOUR_ADDRESS"
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyReferralLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 font-medium">Resources</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-secondary"
              >
                Documentation
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-secondary"
              >
                Smart Contract (BaseScan)
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-secondary"
              >
                Audit Report
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

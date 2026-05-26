"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart3, 
  TrendingUp, 
  Coins, 
  Clock, 
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  CircleDot
} from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import { 
  useAllLoans, 
  usePlatformStats,
  formatTokenAmount,
  getTokenByAddress
} from "@/lib/contract-hooks"
import { LoanStatus, LOAN_STATUS_LABELS, PAWN_PLATFORM_ADDRESS } from "@/lib/web3-config"

export default function AnalyticsPage() {
  const { isTerminalMode } = useAppContext()
  const { loans, isLoading, totalLoans } = useAllLoans()
  const { stats, isLoading: statsLoading } = usePlatformStats()

  // Calculate detailed analytics
  const analytics = useMemo(() => {
    if (!loans.length) return null

    // Status breakdown
    const statusCounts = {
      open: 0,
      active: 0,
      repaid: 0,
      defaulted: 0,
      cancelled: 0
    }

    // Token popularity
    const collateralTokens: Record<string, number> = {}
    const loanTokens: Record<string, number> = {}

    // Duration stats
    const durations: number[] = []

    loans.forEach(({ loan }) => {
      // Count statuses
      switch (loan.status) {
        case LoanStatus.OPEN: statusCounts.open++; break
        case LoanStatus.ACTIVE: statusCounts.active++; break
        case LoanStatus.REPAID: statusCounts.repaid++; break
        case LoanStatus.DEFAULTED: statusCounts.defaulted++; break
        case LoanStatus.CANCELLED: statusCounts.cancelled++; break
      }

      // Track tokens
      const collateralToken = getTokenByAddress(loan.collateralToken)
      const loanToken = getTokenByAddress(loan.loanToken)
      if (collateralToken) {
        collateralTokens[collateralToken.symbol] = (collateralTokens[collateralToken.symbol] || 0) + 1
      }
      if (loanToken) {
        loanTokens[loanToken.symbol] = (loanTokens[loanToken.symbol] || 0) + 1
      }

      // Track durations (in days)
      const durationDays = Number(loan.duration) / 86400
      if (durationDays > 0) {
        durations.push(durationDays)
      }
    })

    // Calculate averages
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0

    // Sort tokens by usage
    const topCollateralTokens = Object.entries(collateralTokens)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    
    const topLoanTokens = Object.entries(loanTokens)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Calculate success rate
    const completedLoans = statusCounts.repaid + statusCounts.defaulted
    const successRate = completedLoans > 0 
      ? ((statusCounts.repaid / completedLoans) * 100).toFixed(1)
      : "N/A"

    return {
      statusCounts,
      topCollateralTokens,
      topLoanTokens,
      avgDuration,
      successRate,
      totalCompleted: completedLoans
    }
  }, [loans])

  if (isTerminalMode) {
    return (
      <div className="min-h-screen bg-background p-4 font-mono text-xs">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 border-b border-border pb-2">
            <span className="text-primary">PAWN.CREDIT</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span>PROTOCOL_ANALYTICS</span>
            <span className="ml-4 text-muted-foreground">
              {isLoading ? "LOADING..." : `TOTAL_LOANS: ${totalLoans}`}
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <span className="animate-pulse text-primary">FETCHING_DATA...</span>
            </div>
          ) : !analytics ? (
            <div className="py-12 text-center text-muted-foreground">
              NO_DATA_AVAILABLE - Platform is newly launched
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Breakdown */}
              <div>
                <div className="mb-2 text-[var(--pawn-amber)]">STATUS_BREAKDOWN:</div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="border border-border p-3">
                    <div className="text-muted-foreground">OPEN</div>
                    <div className="text-blue-500 text-lg">{analytics.statusCounts.open}</div>
                  </div>
                  <div className="border border-border p-3">
                    <div className="text-muted-foreground">ACTIVE</div>
                    <div className="text-green-500 text-lg">{analytics.statusCounts.active}</div>
                  </div>
                  <div className="border border-border p-3">
                    <div className="text-muted-foreground">REPAID</div>
                    <div className="text-emerald-500 text-lg">{analytics.statusCounts.repaid}</div>
                  </div>
                  <div className="border border-border p-3">
                    <div className="text-muted-foreground">DEFAULTED</div>
                    <div className="text-red-500 text-lg">{analytics.statusCounts.defaulted}</div>
                  </div>
                  <div className="border border-border p-3">
                    <div className="text-muted-foreground">CANCELLED</div>
                    <div className="text-muted-foreground text-lg">{analytics.statusCounts.cancelled}</div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <div className="mb-2 text-[var(--pawn-amber)]">KEY_METRICS:</div>
                <div className="space-y-1">
                  <div className="flex justify-between border-l-2 border-primary/30 pl-4">
                    <span className="text-muted-foreground">SUCCESS_RATE:</span>
                    <span className={analytics.successRate === "N/A" ? "" : "text-green-500"}>
                      {analytics.successRate}{analytics.successRate !== "N/A" && "%"}
                    </span>
                  </div>
                  <div className="flex justify-between border-l-2 border-primary/30 pl-4">
                    <span className="text-muted-foreground">AVG_DURATION:</span>
                    <span>{analytics.avgDuration} days</span>
                  </div>
                  <div className="flex justify-between border-l-2 border-primary/30 pl-4">
                    <span className="text-muted-foreground">PLATFORM_FEE:</span>
                    <span>0.5%</span>
                  </div>
                </div>
              </div>

              {/* Token Usage */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-[var(--pawn-amber)]">TOP_COLLATERAL:</div>
                  <div className="space-y-1">
                    {analytics.topCollateralTokens.map(([symbol, count]) => (
                      <div key={symbol} className="flex justify-between">
                        <span className="text-primary">{symbol}</span>
                        <span className="text-muted-foreground">{count} loans</span>
                      </div>
                    ))}
                    {analytics.topCollateralTokens.length === 0 && (
                      <span className="text-muted-foreground">NO_DATA</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-[var(--pawn-amber)]">TOP_LOAN_TOKENS:</div>
                  <div className="space-y-1">
                    {analytics.topLoanTokens.map(([symbol, count]) => (
                      <div key={symbol} className="flex justify-between">
                        <span className="text-primary">{symbol}</span>
                        <span className="text-muted-foreground">{count} loans</span>
                      </div>
                    ))}
                    {analytics.topLoanTokens.length === 0 && (
                      <span className="text-muted-foreground">NO_DATA</span>
                    )}
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
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <BarChart3 className="h-7 w-7" />
            Protocol Analytics
          </h1>
          <p className="mt-2 text-muted-foreground">
            Real-time metrics and statistics from the Pawn.credit protocol on Base.
          </p>
        </div>

        {isLoading || statsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !analytics ? (
          // Empty state - no loans yet
          <Card>
            <CardContent className="py-16 text-center">
              <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Activity Yet</h3>
              <p className="mt-2 text-muted-foreground">
                Protocol analytics will appear here once loans are created.
                <br />
                Be the first to create or fund a loan!
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/app/borrow" className="text-primary hover:underline">
                  Create a loan
                </Link>
                <span className="text-muted-foreground">or</span>
                <Link href="/app/lend" className="text-primary hover:underline">
                  Fund a loan
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Coins className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="secondary">Total</Badge>
                  </div>
                  <p className="mt-4 text-3xl font-bold">{totalLoans}</p>
                  <p className="text-sm text-muted-foreground">Loans Created</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Activity className="h-5 w-5 text-green-500" />
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                  </div>
                  <p className="mt-4 text-3xl font-bold">{analytics.statusCounts.active}</p>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Success</Badge>
                  </div>
                  <p className="mt-4 text-3xl font-bold">
                    {analytics.successRate}{analytics.successRate !== "N/A" && "%"}
                  </p>
                  <p className="text-sm text-muted-foreground">Repayment Rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-3xl font-bold">{analytics.avgDuration}</p>
                  <p className="text-sm text-muted-foreground">Avg Duration (days)</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Status Breakdown</CardTitle>
                  <CardDescription>Distribution of loans by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <StatusBar 
                      label="Open" 
                      count={analytics.statusCounts.open} 
                      total={totalLoans}
                      color="bg-blue-500"
                      icon={<Clock className="h-4 w-4" />}
                    />
                    <StatusBar 
                      label="Active" 
                      count={analytics.statusCounts.active} 
                      total={totalLoans}
                      color="bg-green-500"
                      icon={<Activity className="h-4 w-4" />}
                    />
                    <StatusBar 
                      label="Repaid" 
                      count={analytics.statusCounts.repaid} 
                      total={totalLoans}
                      color="bg-emerald-500"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                    />
                    <StatusBar 
                      label="Defaulted" 
                      count={analytics.statusCounts.defaulted} 
                      total={totalLoans}
                      color="bg-red-500"
                      icon={<XCircle className="h-4 w-4" />}
                    />
                    <StatusBar 
                      label="Cancelled" 
                      count={analytics.statusCounts.cancelled} 
                      total={totalLoans}
                      color="bg-muted-foreground"
                      icon={<AlertCircle className="h-4 w-4" />}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Repayment Performance</CardTitle>
                  <CardDescription>Success rate of completed loans</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.totalCompleted > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center">
                        <div className="relative h-40 w-40">
                          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-muted"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${parseFloat(analytics.successRate) || 0} 100`}
                              className="text-emerald-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">
                              {analytics.successRate}
                              {analytics.successRate !== "N/A" && "%"}
                            </span>
                            <span className="text-xs text-muted-foreground">Success Rate</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-8">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-500">{analytics.statusCounts.repaid}</p>
                          <p className="text-xs text-muted-foreground">Repaid</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-500">{analytics.statusCounts.defaulted}</p>
                          <p className="text-xs text-muted-foreground">Defaulted</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      No completed loans yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Token Usage */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Collateral Tokens</CardTitle>
                  <CardDescription>Most used tokens as collateral</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.topCollateralTokens.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topCollateralTokens.map(([symbol, count], index) => (
                        <div key={symbol} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                              {index + 1}
                            </span>
                            <span className="font-medium">{symbol}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{count} loans</span>
                            <Badge variant="secondary">
                              {((count / totalLoans) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Loan Tokens</CardTitle>
                  <CardDescription>Most requested tokens for loans</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.topLoanTokens.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topLoanTokens.map(([symbol, count], index) => (
                        <div key={symbol} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                              {index + 1}
                            </span>
                            <span className="font-medium">{symbol}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{count} loans</span>
                            <Badge variant="secondary">
                              {((count / totalLoans) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Protocol Info */}
            <Card>
              <CardHeader>
                <CardTitle>Protocol Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Network</p>
                    <p className="text-lg font-semibold">Base</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                    <p className="text-lg font-semibold">0.5%</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="text-lg font-semibold text-green-500">0%</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Contract</p>
                    <a 
                      href={`https://basescan.org/address/${PAWN_PLATFORM_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {PAWN_PLATFORM_ADDRESS.slice(0, 8)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function StatusBar({ 
  label, 
  count, 
  total, 
  color, 
  icon 
}: { 
  label: string
  count: number
  total: number
  color: string
  icon: React.ReactNode
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={cn("text-muted-foreground", color.replace("bg-", "text-"))}>{icon}</span>
          <span>{label}</span>
        </div>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

'use client'

import { TerminalDashboard } from '@/components/pawn/terminal-dashboard'
import { useApp } from '@/lib/app-context'
import { useEffect } from 'react'

export default function TerminalPage() {
  const { setViewMode } = useApp()

  // Force terminal mode on this page
  useEffect(() => {
    setViewMode('advanced')
  }, [setViewMode])

  return <TerminalDashboard />
}

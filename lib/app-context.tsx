'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'terminal'
type ViewMode = 'simple' | 'advanced'

interface AppContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [viewMode, setViewModeState] = useState<ViewMode>('simple')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('pawn-theme') as Theme | null
    const savedViewMode = localStorage.getItem('pawn-view-mode') as ViewMode | null
    
    if (savedTheme) setThemeState(savedTheme)
    if (savedViewMode) setViewModeState(savedViewMode)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'terminal')
    root.classList.add(theme)
    localStorage.setItem('pawn-theme', theme)
  }, [theme, mounted])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('pawn-view-mode', viewMode)
  }, [viewMode, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
  }

  const toggleViewMode = () => {
    setViewModeState(prev => prev === 'simple' ? 'advanced' : 'simple')
  }

  if (!mounted) {
    return null
  }

  return (
    <AppContext.Provider value={{ theme, setTheme, viewMode, setViewMode, toggleViewMode }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  // Add computed property for terminal mode detection
  const isTerminalMode = context.viewMode === 'advanced'
  return { ...context, isTerminalMode }
}

// Backwards compatibility alias
export const useAppContext = useApp

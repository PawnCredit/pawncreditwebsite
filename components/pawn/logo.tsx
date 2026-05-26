'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-sm', arrow: 'w-2.5 h-2.5' },
    md: { icon: 'h-8 w-8', text: 'text-lg', arrow: 'w-3 h-3' },
    lg: { icon: 'h-12 w-12', text: 'text-2xl', arrow: 'w-4 h-4' },
  }

  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo Icon - Horizontal Arrows <> */}
      <div className={cn(
        'relative flex flex-row items-center justify-center rounded-lg bg-foreground gap-0.5',
        s.icon
      )}>
        {/* Left Arrow < */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className={cn(s.arrow)}
        >
          <path 
            d="M15 5L8 12L15 19" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-background"
          />
        </svg>
        {/* Right Arrow > */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className={cn(s.arrow)}
        >
          <path 
            d="M9 5L16 12L9 19" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Text Logo */}
      {showText && (
        <span className={cn('font-semibold tracking-tight', s.text)}>
          <span className="text-foreground">pawn</span>
          <span className="text-primary">.credit</span>
        </span>
      )}
    </div>
  )
}

// Simplified icon-only version for tight spaces
export function LogoIcon({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizes = {
    sm: { icon: 'h-6 w-6', arrow: 'w-2.5 h-2.5' },
    md: { icon: 'h-8 w-8', arrow: 'w-3 h-3' },
    lg: { icon: 'h-12 w-12', arrow: 'w-4 h-4' },
  }

  const s = sizes[size]

  return (
    <div className={cn(
      'relative flex flex-col items-center justify-center rounded-lg bg-foreground',
      s.icon,
      className
    )}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className={cn(s.arrow, '-mb-0.5')}
      >
        <path 
          d="M5 12L12 5L19 12" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-background"
        />
      </svg>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className={cn(s.arrow, '-mt-0.5')}
      >
        <path 
          d="M5 12L12 19L19 12" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-primary"
        />
      </svg>
    </div>
  )
}

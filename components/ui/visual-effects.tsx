'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ParticleFieldProps {
  className?: string
  particleCount?: number
  color?: string
}

export function ParticleField({ 
  className, 
  particleCount = 50,
  color = 'var(--pawn-blue)'
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        })
      }
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < 0) p.x = canvas.offsetWidth
        if (p.x > canvas.offsetWidth) p.x = 0
        if (p.y < 0) p.y = canvas.offsetHeight
        if (p.y > canvas.offsetHeight) p.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `oklch(0.65 0.18 250 / ${p.opacity})`
        ctx.fill()

        // Draw connections
        particles.forEach((p2, j) => {
          if (i === j) return
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `oklch(0.65 0.18 250 / ${0.1 * (1 - dist / 100)})`
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(drawParticles)
    }

    resize()
    initParticles()
    drawParticles()

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [particleCount, color])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 h-full w-full', className)}
    />
  )
}

// Floating grid lines
export function GridLines({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Horizontal lines */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-pulse"
          style={{
            top: `${(i + 1) * 8}%`,
            left: 0,
            right: 0,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      {/* Vertical lines */}
      {[...Array(16)].map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute w-px bg-gradient-to-b from-transparent via-foreground/5 to-transparent animate-pulse"
          style={{
            left: `${(i + 1) * 6}%`,
            top: 0,
            bottom: 0,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}

// Floating orbs / glows
export function FloatingOrbs({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Primary orb */}
      <div 
        className="absolute rounded-full blur-[100px] animate-float"
        style={{
          width: '400px',
          height: '400px',
          background: 'oklch(0.55 0.18 250 / 0.15)',
          top: '10%',
          right: '-5%',
        }}
      />
      {/* Secondary orb */}
      <div 
        className="absolute rounded-full blur-[80px] animate-float-delayed"
        style={{
          width: '300px',
          height: '300px',
          background: 'oklch(0.65 0.18 145 / 0.1)',
          bottom: '20%',
          left: '-5%',
        }}
      />
      {/* Accent orb */}
      <div 
        className="absolute rounded-full blur-[60px] animate-float-slow"
        style={{
          width: '200px',
          height: '200px',
          background: 'oklch(0.75 0.16 75 / 0.1)',
          top: '50%',
          left: '30%',
        }}
      />
    </div>
  )
}

// Noise texture overlay
export function NoiseOverlay({ className }: { className?: string }) {
  return (
    <div 
      className={cn('absolute inset-0 pointer-events-none opacity-[0.02]', className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

// Animated lines/rays
export function AnimatedRays({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <svg className="absolute w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ray-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.18 250 / 0)" />
            <stop offset="50%" stopColor="oklch(0.65 0.18 250 / 0.1)" />
            <stop offset="100%" stopColor="oklch(0.65 0.18 250 / 0)" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1={200 + i * 150}
            y1="0"
            x2={400 + i * 150}
            y2="1000"
            stroke="url(#ray-gradient)"
            strokeWidth="1"
            className="animate-ray"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </svg>
    </div>
  )
}

// Pixel grid dots
export function PixelDots({ className }: { className?: string }) {
  return (
    <div 
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.65 0.18 250 / 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }}
    />
  )
}

// Cyberpunk corner accents
export function CornerAccents({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Top left */}
      <svg className="absolute top-4 left-4 w-16 h-16 text-primary/30" viewBox="0 0 64 64">
        <path d="M0 32 L0 0 L32 0" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="0" cy="0" r="3" fill="currentColor" />
      </svg>
      {/* Top right */}
      <svg className="absolute top-4 right-4 w-16 h-16 text-primary/30" viewBox="0 0 64 64">
        <path d="M32 0 L64 0 L64 32" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="64" cy="0" r="3" fill="currentColor" />
      </svg>
      {/* Bottom left */}
      <svg className="absolute bottom-4 left-4 w-16 h-16 text-primary/30" viewBox="0 0 64 64">
        <path d="M0 32 L0 64 L32 64" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="0" cy="64" r="3" fill="currentColor" />
      </svg>
      {/* Bottom right */}
      <svg className="absolute bottom-4 right-4 w-16 h-16 text-primary/30" viewBox="0 0 64 64">
        <path d="M32 64 L64 64 L64 32" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="64" cy="64" r="3" fill="currentColor" />
      </svg>
    </div>
  )
}

// Hexagon pattern
export function HexagonPattern({ className }: { className?: string }) {
  return (
    <div 
      className={cn('absolute inset-0 pointer-events-none opacity-30', className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.08'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  )
}

// Glitch effect lines
export function GlitchLines({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-px bg-primary/20 animate-glitch"
          style={{
            top: `${30 + i * 20}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: '8s',
          }}
        />
      ))}
    </div>
  )
}

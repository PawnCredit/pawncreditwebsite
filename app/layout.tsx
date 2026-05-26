import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: 'Pawn.credit - Interest-Free Crypto Pawn Lending',
  description: 'Lock your tokens as collateral, borrow what you need. No interest. No liquidations. Just a simple deadline. Built on Base Chain.',
  keywords: ['DeFi', 'crypto', 'lending', 'pawn', 'Base', 'blockchain', 'interest-free'],
  openGraph: {
    title: 'Pawn.credit - Interest-Free Crypto Pawn Lending',
    description: 'Lock your tokens as collateral, borrow what you need. No interest. No liquidations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pawn.credit',
    description: 'Interest-free crypto pawn lending on Base',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased transition-theme`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

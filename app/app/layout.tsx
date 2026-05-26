import { Header } from '@/components/pawn/header'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {children}
      </main>
    </div>
  )
}

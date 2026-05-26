import { Header } from '@/components/pawn/header'
import { 
  LandingHero, 
  HowItWorks, 
  Features,
  TokenSection,
  LandingCTA, 
  LandingFooter 
} from '@/components/pawn/landing-sections'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <LandingHero />
        <HowItWorks />
        <Features />
        <TokenSection />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}

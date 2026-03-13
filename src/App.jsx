import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Reveal from './components/Reveal'
import WhyNow from './components/WhyNow'
import HowItWorks from './components/HowItWorks'
import Benefits from './components/Benefits'
import SocialProof from './components/SocialProof'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import Onboarding from './components/onboarding/Onboarding'

export default function App() {
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  const openOnboarding = (e) => {
    e?.preventDefault()
    setOnboardingOpen(true)
  }

  return (
    <div className="bg-[#090909] text-white min-h-screen overflow-x-hidden">
      <Navbar onCta={openOnboarding} />
      <main>
        <Hero onCta={openOnboarding} />
        <Reveal />
        <WhyNow />
        <HowItWorks />
        <Benefits />
        <SocialProof />
        <FinalCTA onCta={openOnboarding} />
      </main>
      <Footer />

      <AnimatePresence>
        {onboardingOpen && (
          <Onboarding onClose={() => setOnboardingOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

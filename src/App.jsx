import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhyNow from './components/WhyNow'
import HowItWorks from './components/HowItWorks'
import Benefits from './components/Benefits'
import SocialProof from './components/SocialProof'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="bg-[#090909] text-white min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <WhyNow />
        <HowItWorks />
        <Benefits />
        <SocialProof />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

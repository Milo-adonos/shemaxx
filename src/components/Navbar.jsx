import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#090909]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight">
            <span style={{ color: '#cc3c69' }}>She</span><span style={{ color: '#ffffff' }}>maxx</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] animate-pulse" />
        </a>

        <button
          onClick={onCta}
          className="px-5 py-2 rounded-full text-sm font-semibold bg-[#cc3c69] text-white active:scale-95 transition-transform duration-150"
        >
          Analyser mon visage
        </button>
      </div>
    </motion.header>
  )
}

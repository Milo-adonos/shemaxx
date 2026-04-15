import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useT } from '../contexts/LangContext'

export default function Navbar({ onCta, onSignOut, user }) {
  const [scrolled, setScrolled] = useState(false)
  const t = useT()

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

        <div className="flex items-center gap-2">
          <button
            onClick={onCta}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-[#cc3c69] text-white active:scale-95 transition-transform duration-150 flex items-center gap-1.5"
          >
            {user ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white/80" />
                {t.navbar.account}
              </>
            ) : (
              t.navbar.login
            )}
          </button>

          {user && (
            <button
              onClick={onSignOut}
              title="Sign out"
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  )
}

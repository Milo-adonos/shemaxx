import { useRef, useEffect, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Drop-in replacement for useInView that:
 * - On mobile (< 768px) or prefers-reduced-motion: returns inView=true immediately
 *   → no animation delay, content instantly visible
 * - On desktop: triggers 200px BEFORE the element enters the viewport
 *   → no black void, content animates in smoothly
 */
export function useScrollReveal() {
  const ref = useRef(null)

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.innerWidth < 768 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  })

  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.innerWidth < 768 ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      )
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 150px before entering viewport → animation already in progress when user sees it
  const inViewDesktop = useInView(ref, {
    once: true,
    margin: '0px 0px 150px 0px',
  })

  return { ref, inView: isMobile ? true : inViewDesktop }
}

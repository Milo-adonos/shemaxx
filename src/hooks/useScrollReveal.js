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

  // Positive bottom margin = detect element 50px before it enters viewport
  // → animation starts just as element scrolls into view, feels perfectly timed
  const inViewDesktop = useInView(ref, {
    once: true,
    margin: '0px 0px 50px 0px',
  })

  return { ref, inView: isMobile ? true : inViewDesktop }
}

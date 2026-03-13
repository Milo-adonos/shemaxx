import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

const MIN = 13
const MAX = 45
const ITEM_W = 52

export default function Step2Age({ value, onNext }) {
  const [age, setAge] = useState(value || 22)
  const scrollRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startScroll = useRef(0)

  const ages = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i)

  const scrollToAge = (a, smooth = true) => {
    if (!scrollRef.current) return
    const idx = a - MIN
    const containerW = scrollRef.current.clientWidth
    const offset = idx * ITEM_W - containerW / 2 + ITEM_W / 2
    scrollRef.current.scrollTo({ left: offset, behavior: smooth ? 'smooth' : 'instant' })
  }

  useEffect(() => {
    scrollToAge(age, false)
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const containerW = scrollRef.current.clientWidth
    const scrollLeft = scrollRef.current.scrollLeft
    const idx = Math.round((scrollLeft + containerW / 2 - ITEM_W / 2) / ITEM_W)
    const newAge = Math.min(MAX, Math.max(MIN, MIN + idx))
    if (newAge !== age) setAge(newAge)
  }

  const onMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX
    startScroll.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = 'grabbing'
  }

  const onMouseMove = (e) => {
    if (!isDragging.current) return
    const dx = e.pageX - startX.current
    scrollRef.current.scrollLeft = startScroll.current - dx
  }

  const onMouseUp = () => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
    scrollToAge(age)
  }

  return (
    <StepLayout
      title="Quel âge as-tu ?"
      cta="Continuer"
      onCta={() => onNext(age)}
    >
      {/* Big age display */}
      <div className="text-center mb-8">
        <motion.div
          key={age}
          initial={{ scale: 0.85, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-8xl font-black tabular-nums"
          style={{
            color: '#cc3c69',
            textShadow: '0 0 30px rgba(204,60,105,0.5), 0 0 60px rgba(204,60,105,0.2)',
          }}
        >
          {age}
        </motion.div>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>ans</p>
      </div>

      {/* Horizontal scroll picker */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #090909, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, #090909, transparent)' }} />

        {/* Center indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-12 z-10 pointer-events-none flex flex-col justify-center">
          <div className="w-full h-12 rounded-xl" style={{ background: 'rgba(204,60,105,0.1)', border: '1px solid rgba(204,60,105,0.3)' }} />
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="flex overflow-x-auto select-none py-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: 'grab',
            scrollSnapType: 'x mandatory',
          }}
        >
          <div style={{ width: '50%', flexShrink: 0 }} />
          {ages.map((a) => (
            <div
              key={a}
              onClick={() => { setAge(a); setTimeout(() => scrollToAge(a), 0) }}
              className="flex items-center justify-center shrink-0 transition-all duration-150"
              style={{
                width: ITEM_W,
                height: 48,
                scrollSnapAlign: 'center',
                color: a === age ? '#cc3c69' : 'rgba(255,255,255,0.2)',
                fontSize: a === age ? 22 : 16,
                fontWeight: a === age ? 900 : 400,
                cursor: 'pointer',
              }}
            >
              {a}
            </div>
          ))}
          <div style={{ width: '50%', flexShrink: 0 }} />
        </div>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Fais glisser pour sélectionner
      </p>
    </StepLayout>
  )
}

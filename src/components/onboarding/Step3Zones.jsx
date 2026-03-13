import { useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

const zones = [
  { id: 'jaw',      label: 'Ligne de mâchoire', emoji: '💎' },
  { id: 'cheeks',   label: 'Pommettes',          emoji: '✨' },
  { id: 'eyes',     label: 'Yeux',               emoji: '👁️' },
  { id: 'hair',     label: 'Cheveux',             emoji: '💇‍♀️' },
  { id: 'all',      label: 'Tout améliorer',      emoji: '👑' },
]

export default function Step3Zones({ value, onNext }) {
  const [selected, setSelected] = useState(value || [])

  const toggle = (id) => {
    if (id === 'all') {
      setSelected(['all'])
      return
    }
    setSelected(prev => {
      const without = prev.filter(x => x !== 'all')
      return without.includes(id) ? without.filter(x => x !== id) : [...without, id]
    })
  }

  const isSelected = (id) => selected.includes(id)

  return (
    <StepLayout
      title="Quelles zones veux-tu améliorer ?"
      subtitle="Tu peux sélectionner plusieurs options"
      cta="Continuer"
      ctaDisabled={selected.length === 0}
      onCta={() => onNext(selected)}
    >
      <div className="space-y-3">
        {zones.map((z, i) => (
          <motion.button
            key={z.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.07 }}
            onClick={() => toggle(z.id)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all duration-200"
            style={{
              background: isSelected(z.id) ? 'rgba(204,60,105,0.08)' : '#141414',
              borderColor: isSelected(z.id) ? '#cc3c69' : 'rgba(255,255,255,0.08)',
              boxShadow: isSelected(z.id) ? '0 0 18px rgba(204,60,105,0.12)' : 'none',
            }}
          >
            <span className="text-2xl">{z.emoji}</span>
            <span className="flex-1 text-left font-medium text-sm text-white">{z.label}</span>

            {/* Custom checkbox */}
            <div
              className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0"
              style={{
                borderColor: isSelected(z.id) ? '#cc3c69' : 'rgba(255,255,255,0.2)',
                background: isSelected(z.id) ? '#cc3c69' : 'transparent',
                boxShadow: isSelected(z.id) ? '0 0 8px rgba(204,60,105,0.5)' : 'none',
              }}
            >
              {isSelected(z.id) && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  width="10" height="8" viewBox="0 0 10 8" fill="none"
                >
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </StepLayout>
  )
}

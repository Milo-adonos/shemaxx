import { useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

const options = [
  { id: 'natural',        label: 'Naturel',         desc: 'Améliorer légèrement ton apparence.',                   emoji: '🌿' },
  { id: 'glowup',         label: 'Glow up',          desc: 'Optimiser tes traits et ton style.',                    emoji: '✨' },
  { id: 'transformation', label: 'Transformation',   desc: 'Révéler ton plein potentiel esthétique.',               emoji: '🦋' },
  { id: 'elite',          label: 'Elite',             desc: 'Atteindre un niveau d\'attractivité exceptionnel.',    emoji: '👑' },
]

export default function Step4Result({ onNext }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (id) => {
    setSelected(id)
  }

  return (
    <StepLayout
      title="Quel type de résultat aimerais-tu atteindre ?"
      cta="Continuer"
      ctaDisabled={!selected}
      onCta={() => onNext(selected)}
    >
      <div className="space-y-3">
        {options.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.08 }}
            onClick={() => handleSelect(o.id)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all duration-200"
            style={{
              background: selected === o.id ? 'rgba(204,60,105,0.08)' : '#141414',
              borderColor: selected === o.id ? '#cc3c69' : 'rgba(255,255,255,0.08)',
              boxShadow: selected === o.id ? '0 0 20px rgba(204,60,105,0.15)' : 'none',
            }}
          >
            <span className="text-2xl shrink-0">{o.emoji}</span>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm text-white">{o.label}</p>
              <p className="text-xs italic mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{o.desc}</p>
            </div>
            {/* Radio dot */}
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
              style={{
                borderColor: selected === o.id ? '#cc3c69' : 'rgba(255,255,255,0.2)',
              }}
            >
              {selected === o.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#cc3c69', boxShadow: '0 0 6px rgba(204,60,105,0.8)' }}
                />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </StepLayout>
  )
}

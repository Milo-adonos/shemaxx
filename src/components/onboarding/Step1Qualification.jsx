import { useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

const options = [
  {
    id: 'curious',
    emoji: '💡',
    label: 'Curieuse',
    desc: 'Je commence à m\'intéresser à mon potentiel et à mon apparence.',
  },
  {
    id: 'progressing',
    emoji: '💪',
    label: 'En progression',
    desc: 'Je connais déjà quelques techniques et je veux aller plus loin.',
  },
  {
    id: 'determined',
    emoji: '👑',
    label: 'Déterminée',
    desc: 'Je veux atteindre mon plein potentiel et optimiser chaque détail.',
  },
]

export default function Step1Qualification({ onNext }) {
  const [selected, setSelected] = useState(null)

  return (
    <StepLayout
      title="Où en es-tu dans le looksmaxxing ?"
      cta="Continuer"
      ctaDisabled={!selected}
      onCta={() => onNext(selected)}
    >
      <div className="space-y-3">
        {options.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            onClick={() => setSelected(o.id)}
            className="w-full text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden"
            style={{
              background: selected === o.id ? 'rgba(204,60,105,0.08)' : '#141414',
              borderColor: selected === o.id ? '#cc3c69' : 'rgba(255,255,255,0.08)',
              boxShadow: selected === o.id ? '0 0 20px rgba(204,60,105,0.15)' : 'none',
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl shrink-0">{o.emoji}</span>
              <div>
                <p className="font-bold text-white text-sm mb-0.5">{o.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{o.desc}</p>
              </div>
              {selected === o.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#cc3c69' }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </StepLayout>
  )
}

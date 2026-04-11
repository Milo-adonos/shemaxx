import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StepLayout from './StepLayout'
import { useT } from '../../contexts/LangContext'

const ZONE_IDS    = ['jaw', 'cheeks', 'eyes', 'nose', 'all', 'other']
const ZONE_EMOJIS = ['💎', '✨', '👁️', '👃', '👑', '✍️']

export default function Step3Zones({ value, onNext }) {
  const [selected, setSelected] = useState(value?.selected || [])
  const [otherText, setOtherText] = useState(value?.otherText || '')
  const t = useT()
  const zones = t.step3.zones.map((z, i) => ({ id: ZONE_IDS[i], emoji: ZONE_EMOJIS[i], label: z.label }))

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

  const canContinue = selected.length > 0 && (
    !isSelected('other') || otherText.trim().length > 0
  )

  return (
    <StepLayout
      title={t.step3.title}
      subtitle={t.step3.subtitle}
      cta={t.step3.cta}
      ctaDisabled={!canContinue}
      onCta={() => onNext({ selected, otherText: isSelected('other') ? otherText : '' })}
    >
      <div className="space-y-3">
        {zones.map((z, i) => (
          <motion.div key={z.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.07 }}>
            <button
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
            </button>

            <AnimatePresence>
              {z.id === 'other' && isSelected('other') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <textarea
                    autoFocus
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder={t.step3.otherPlaceholder}
                    rows={3}
                    className="w-full mt-2 px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 resize-none outline-none transition-all duration-200"
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(204,60,105,0.4)',
                      boxShadow: '0 0 12px rgba(204,60,105,0.08)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </StepLayout>
  )
}

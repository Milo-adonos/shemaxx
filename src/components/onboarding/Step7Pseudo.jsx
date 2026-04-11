import { useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'
import { useT } from '../../contexts/LangContext'

export default function Step7Pseudo({ onNext }) {
  const [pseudo, setPseudo] = useState('')
  const t = useT()

  const handleKey = (e) => {
    if (e.key === 'Enter' && pseudo.trim().length >= 2) {
      onNext(pseudo.trim())
    }
  }

  return (
    <StepLayout
      title={t.step7.title}
      cta={t.step7.cta}
      ctaDisabled={pseudo.trim().length < 2}
      onCta={() => onNext(pseudo.trim())}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4"
      >
        <label className="block text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t.step7.label}
        </label>
        <input
          type="text"
          value={pseudo}
          onChange={e => setPseudo(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t.step7.placeholder}
          autoFocus
          maxLength={30}
          className="w-full bg-transparent text-white text-xl font-semibold outline-none border-b-2 pb-3 transition-all duration-200 placeholder:font-normal"
          style={{
            borderColor: pseudo.length > 0 ? '#cc3c69' : 'rgba(255,255,255,0.12)',
            caretColor: '#cc3c69',
          }}
        />
        {pseudo.trim().length >= 2 && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs mt-4"
            style={{ color: 'rgba(204,60,105,0.7)' }}
          >
            {t.step7.confirm(pseudo)}
          </motion.p>
        )}
      </motion.div>
    </StepLayout>
  )
}

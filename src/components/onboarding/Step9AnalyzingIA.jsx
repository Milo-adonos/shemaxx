import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const PINK = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

const STEPS = [
  'Symétrie faciale',
  'Proportions dorées',
  'Structure osseuse',
  'Qualité de peau',
]

/** Durée sur cet écran avant « Traitement de ton visage » (ms) */
const DURATION_MS = 4000

/**
 * Écran « Analyse IA » entre le scan facial et « Traitement de ton visage ».
 */
export default function Step9AnalyzingIA({ onNext }) {
  const onNextRef = useRef(onNext)
  onNextRef.current = onNext

  useEffect(() => {
    const t = setTimeout(() => onNextRef.current(), DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="flex flex-col min-h-full items-center justify-center gap-8 px-8 text-center"
      style={{ background: '#000' }}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: PINK }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: PINK_A(0.75) }}
        >
          Shemaxx
        </span>
      </div>

      {/* Anneaux */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            border: '2.5px solid transparent',
            borderTopColor: PINK,
            borderRightColor: PINK_A(0.4),
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full"
          style={{
            inset: 8,
            border: '1.5px solid transparent',
            borderTopColor: PINK_A(0.4),
            borderLeftColor: PINK_A(0.2),
          }}
        />
        <span className="text-3xl">✦</span>
      </div>

      <div>
        <motion.h1
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-2xl font-black text-white mb-2"
        >
          Analyse IA
        </motion.h1>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Notre intelligence artificielle interprète ton scan facial
          <br />
          pour préparer ton rapport personnalisé.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2.5">
        {STEPS.map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.28 }}
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: PINK }}
            />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.52)' }}>
              {label}
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.35 + 0.55 }}
              className="ml-auto text-xs font-bold"
              style={{ color: PINK }}
            >
              ✓
            </motion.span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-[11px]"
        style={{ color: 'rgba(255,255,255,0.22)' }}
      >
        Étape suivante : traitement détaillé de ton visage
      </motion.p>
    </div>
  )
}

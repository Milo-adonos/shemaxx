import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'
import { useT } from '../../contexts/LangContext'

const PINK   = '#cc3e6a'
const PINK_A = (a) => `rgba(204,62,106,${a})`

export default function Step5Potential({ onNext, faceScores = null }) {
  const t = useT()
  const [ready, setReady] = useState(false)
  const [animate, setAnimate] = useState(false)

  // Score actuel depuis l'IA (ou valeur par défaut)
  const currentScore  = faceScores?.total ?? 68
  // Potentiel = +20 à +25 points, plafonné à 95
  const gain          = Math.min(22, 95 - currentScore)
  const potentialScore = Math.min(95, currentScore + gain)

  // Hauteur de la jauge totale en px
  const GAUGE_H = 260
  const currentFrac  = currentScore  / 100
  const potentialFrac = potentialScore / 100

  useEffect(() => {
    const t1 = setTimeout(() => setAnimate(true), 400)
    const t2 = setTimeout(() => setReady(true), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <StepLayout
      title="We see your potential"
      subtitle="With the right guidance, you can reveal what's already within you."
      cta={ready ? (t.step5?.cta ?? 'See my full analysis →') : null}
      onCta={onNext}
    >
      {/* ── Jauge verticale ── */}
      <div className="mt-6 flex flex-col items-center gap-6">
        <div className="flex items-end gap-8 justify-center">

          {/* Labels + jauge */}
          <div className="flex flex-col items-center gap-2">

            {/* Label potentiel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={animate ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: PINK }}>Your potential score</span>
              <span className="text-3xl font-black" style={{ color: PINK, textShadow: `0 0 20px ${PINK_A(0.5)}` }}>
                {potentialScore}
              </span>
            </motion.div>

            {/* La jauge */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ width: 80, height: GAUGE_H, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Partie actuelle (grise, du bas) */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
                initial={{ height: 0 }}
                animate={animate ? { height: `${currentFrac * 100}%` } : { height: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: 'rgba(255,255,255,0.13)', borderTop: '1px solid rgba(255,255,255,0.12)' }}
              >
                <motion.span
                  initial={{ opacity: 0 }} animate={animate ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                  className="text-sm font-black tabular-nums"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {currentScore}
                </motion.span>
              </motion.div>

              {/* Partie potentiel (rose, du haut) */}
              <motion.div
                className="absolute top-0 left-0 right-0 flex items-center justify-center"
                initial={{ height: 0 }}
                animate={animate ? { height: `${(1 - currentFrac) * 100}%` } : { height: 0 }}
                transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: `linear-gradient(180deg, ${PINK}, rgba(204,62,106,0.6))`, boxShadow: `0 0 24px ${PINK_A(0.4)}` }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }} animate={animate ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1.3, type: 'spring' }}
                  className="text-2xl font-black text-white tabular-nums">
                  {potentialScore}
                </motion.span>
              </motion.div>

              {/* Flèche animée montante */}
              <motion.div
                className="absolute left-0 right-0 flex justify-center pointer-events-none"
                initial={{ bottom: `${currentFrac * 100}%`, opacity: 0 }}
                animate={animate ? { bottom: `${(1 - currentFrac) * 100 - 2}%`, opacity: [0, 1, 1, 0] } : {}}
                transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </div>

            {/* Label score actuel */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={animate ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-2xl font-black tabular-nums" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {currentScore}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.35)' }}>Your current score</span>
            </motion.div>
          </div>

          {/* Texte à droite */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={animate ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col gap-3 max-w-[160px]"
          >
            <div className="rounded-2xl px-3 py-3"
              style={{ background: PINK_A(0.08), border: `1px solid ${PINK_A(0.2)}` }}>
              <p className="text-[11px] font-black uppercase tracking-wider mb-1" style={{ color: PINK }}>
                +{gain} points
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                potential progression points identified
              </p>
            </div>

            <div className="rounded-2xl px-3 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Based on your facial analysis, you have strong improvement potential.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Texte sous la jauge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="text-xs text-center leading-relaxed px-4"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Your personalized plan will show you exactly how to get there.
        </motion.p>
      </div>

      {!ready && (
        <motion.p
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-xs text-center mt-6"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Calculating your potential...
        </motion.p>
      )}
    </StepLayout>
  )
}

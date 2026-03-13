import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

const BAR_H = 220

export default function Step5Potential({ onNext }) {
  const [ready, setReady] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setAnimate(true), 300)
    const t2 = setTimeout(() => setReady(true), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const yLabels = ['100%', '50%', '0%']

  return (
    <StepLayout
      title="Nous voyons ton potentiel"
      subtitle="Avec les bons conseils, tu peux atteindre ton plein potentiel."
      cta={ready ? 'Continuer' : null}
      onCta={onNext}
    >
      <div className="flex flex-col items-center mt-2">
        {/* Graph card */}
        <div className="w-full rounded-2xl border border-white/8 px-5 pt-5 pb-5" style={{ background: '#111' }}>

          {/* Title */}
          <p className="text-sm font-semibold text-center mb-5" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Tu peux atteindre{' '}
            <span style={{ color: '#cc3c69', fontWeight: 900 }}>100%</span>
            {' '}avec un entraînement adapté
          </p>

          {/* Chart area */}
          <div className="flex items-stretch gap-3">

            {/* Y-axis labels */}
            <div className="flex flex-col justify-between" style={{ height: BAR_H }}>
              {yLabels.map(l => (
                <span key={l} className="text-[10px] text-right leading-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {l}
                </span>
              ))}
            </div>

            {/* Grid + bars */}
            <div className="flex-1 relative" style={{ height: BAR_H }}>
              {/* Horizontal grid lines */}
              {[0, 0.5, 1].map((pos) => (
                <div
                  key={pos}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${pos * 100}%`,
                    height: 1,
                    background: 'rgba(255,255,255,0.07)',
                  }}
                />
              ))}

              {/* Two bars side by side */}
              <div className="absolute inset-0 flex items-end justify-center gap-5">

                {/* Barre bleue — Sans Shemaxx */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative rounded-xl overflow-hidden" style={{ width: 80, height: BAR_H, background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: animate ? '22%' : 0 }}
                      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
                      style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #3a9eff 100%)' }}
                    >
                      {animate && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="text-base font-black text-white"
                        >
                          22%
                        </motion.span>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Barre rose — Avec Shemaxx */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative rounded-xl overflow-hidden" style={{ width: 80, height: BAR_H, background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: animate ? '78%' : 0 }}
                      transition={{ duration: 1.1, delay: 0.5, ease: 'easeOut' }}
                      className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(180deg, #e0557f 0%, #cc3c69 100%)',
                        boxShadow: '0 0 20px rgba(204,60,105,0.3)',
                      }}
                    >
                      {animate && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.4 }}
                          className="text-xl font-black text-white"
                        >
                          78%
                        </motion.span>
                      )}
                    </motion.div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#3a9eff' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Sans Shemaxx</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#cc3c69' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Avec Shemaxx</span>
            </div>
          </div>
        </div>

        {!ready && (
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs mt-5"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Analyse en cours...
          </motion.p>
        )}
      </div>
    </StepLayout>
  )
}

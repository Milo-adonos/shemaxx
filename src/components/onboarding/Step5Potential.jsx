import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'
import { useT } from '../../contexts/LangContext'

const GRID_LINES = [100, 75, 50, 25, 0]

export default function Step5Potential({ onNext, faceScores = null }) {
  const [ready, setReady] = useState(false)
  const [animate, setAnimate] = useState(false)
  const t = useT()

  const currentPct = 24
  const gainPct    = 76

  useEffect(() => {
    const t1 = setTimeout(() => setAnimate(true), 300)
    const t2 = setTimeout(() => setReady(true), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <StepLayout
      title="Nous voyons ton potentiel"
      subtitle="Avec les bons conseils, tu peux atteindre ton plein potentiel."
      cta={ready ? t.step5.cta : null}
      onCta={onNext}
    >
      <div className="mt-4 rounded-2xl overflow-hidden border border-white/8" style={{ background: '#0d0d0d' }}>

        <div className="px-5 pt-5 pb-4 border-b border-white/6">
          <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Analyse de potentiel
          </p>
          <p className="text-base font-black text-white">
            Tu peux atteindre{' '}
            <span style={{ color: '#cc3c69' }}>100%</span>
            {' '}avec Shemaxx
          </p>
        </div>

        <div className="px-5 pt-5 pb-6">
          <div className="flex gap-4">
            <div className="flex flex-col justify-between pb-1 shrink-0" style={{ height: 220 }}>
              {GRID_LINES.map(v => (
                <span
                  key={v}
                  className="tabular-nums text-right leading-none font-black"
                  style={{
                    fontSize: v === 100 ? 13 : 10,
                    color: v === 100 ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    textShadow: v === 100 ? '0 0 10px rgba(255,255,255,0.6)' : 'none',
                  }}
                >
                  {v}%
                </span>
              ))}
            </div>

            <div className="flex-1 relative" style={{ height: 220 }}>
              {GRID_LINES.map((v, i) => (
                <div
                  key={v}
                  className="absolute left-0 right-0"
                  style={{ top: `${i * 25}%`, height: 1, background: 'rgba(255,255,255,0.06)' }}
                />
              ))}

              <div className="absolute inset-0 flex items-end justify-center gap-6 pb-0.5">
                <div className="flex flex-col items-center gap-2 flex-1 max-w-[100px] h-full justify-end">
                  <div className="w-full relative flex flex-col justify-end rounded-xl overflow-hidden"
                    style={{ height: '100%', background: 'rgba(255,255,255,0.04)' }}>
                    <div className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(204,60,105,0.2), transparent 70%)' }} />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={animate ? { height: `${currentPct}%` } : { height: 0 }}
                      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full absolute bottom-0 flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.15)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={animate ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-base font-black"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        {currentPct}%
                      </motion.span>
                    </motion.div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={animate ? { height: `${gainPct}%` } : { height: 0 }}
                      transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full absolute top-0 flex items-center justify-center"
                      style={{ background: 'linear-gradient(180deg, #e0557f, #cc3c69)', boxShadow: '0 0 20px rgba(204,60,105,0.4)' }}
                    >
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={animate ? { opacity: 1, scale: 1 } : { opacity: 0 }}
                        transition={{ delay: 1.2, type: 'spring' }}
                        className="text-2xl font-black text-white"
                      >
                        {gainPct}%
                      </motion.span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-white/6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Sans accompagnement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#cc3c69', boxShadow: '0 0 6px rgba(204,60,105,0.7)' }} />
              <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{t.step6.withShemaxx}</span>
            </div>
          </div>
        </div>
      </div>

      {!ready && (
        <motion.p
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-xs text-center mt-5"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {t.step9Loading.analyzing}...
        </motion.p>
      )}
    </StepLayout>
  )
}

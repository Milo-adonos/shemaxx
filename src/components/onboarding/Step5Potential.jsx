import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

export default function Step5Potential({ onNext }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <StepLayout
      title="Nous voyons ton potentiel"
      subtitle="Avec les bons conseils, tu peux atteindre ton plein potentiel."
      cta={ready ? 'Continuer' : null}
      onCta={onNext}
    >
      <div className="flex flex-col items-center mt-4">
        {/* Graph card */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/8" style={{ background: '#111' }}>
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Analyse de potentiel
            </p>
            <p className="text-base font-black text-white">We see your potential</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              You can reach 100% with training
            </p>
          </div>

          <div className="px-5 py-6 flex items-end gap-8 justify-center">
            {/* Bar WITHOUT Shemaxx */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col justify-end" style={{ height: 180, width: 64 }}>
                <div className="w-full rounded-xl overflow-hidden flex flex-col justify-end" style={{ height: '100%', background: 'rgba(255,255,255,0.04)' }}>
                  {/* Unlocked potential (gray top) */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '24%' }}
                    transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                    className="w-full"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  />
                  {/* Current (blue bottom) */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '76%' }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    className="w-full"
                    style={{ background: 'linear-gradient(0deg, #4a9eff, #6bb5ff)' }}
                  />
                </div>
              </div>

              {/* Labels beside bar */}
              <div className="text-center">
                <p className="text-[10px] font-bold text-white/50">Sans Shemaxx</p>
                <div className="flex gap-1 justify-center mt-1.5 flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: '#4a9eff' }} />
                    <span className="text-[9px] text-white/40">76% actuel</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.2)' }} />
                    <span className="text-[9px] text-white/40">24% bloqué</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VS separator */}
            <div className="flex flex-col items-center gap-1 pb-12">
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>VS</span>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Bar WITH Shemaxx */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex flex-col justify-end" style={{ height: 180, width: 64 }}>
                {/* Glow */}
                <div className="absolute inset-0 rounded-xl" style={{ background: 'rgba(204,60,105,0.15)', filter: 'blur(12px)' }} />
                <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '100%', background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                    className="w-full absolute bottom-0"
                    style={{ background: 'linear-gradient(0deg, #cc3c69, #e0557f, rgba(255,255,255,0.6))' }}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-bold" style={{ color: '#cc3c69' }}>Avec Shemaxx</p>
                <div className="flex items-center gap-1.5 mt-1.5 justify-center">
                  <div className="w-2 h-2 rounded-sm" style={{ background: '#cc3c69' }} />
                  <span className="text-[9px]" style={{ color: 'rgba(204,60,105,0.7)' }}>100% débloqué</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!ready && (
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs mt-6"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Analyse en cours...
          </motion.p>
        )}
      </div>
    </StepLayout>
  )
}

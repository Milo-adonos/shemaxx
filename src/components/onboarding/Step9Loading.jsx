import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const tasks = [
  { label: 'Analyse de la symétrie...',           duration: 1400 },
  { label: 'Détection des proportions...',         duration: 1200 },
  { label: 'Calcul du potentiel...',               duration: 1600 },
  { label: 'Génération des recommandations...',    duration: 1000 },
]

export default function Step9Loading({ onNext }) {
  const [progress, setProgress] = useState([0, 0, 0, 0])
  const [done, setDone] = useState(false)
  const [showDone, setShowDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    let delay = 300

    tasks.forEach((task, idx) => {
      setTimeout(() => {
        if (cancelled) return
        const steps = 40
        const interval = task.duration / steps
        let step = 0
        const id = setInterval(() => {
          if (cancelled) { clearInterval(id); return }
          step++
          const eased = Math.min(100, Math.round((step / steps) * 100 * (0.7 + Math.random() * 0.6)))
          setProgress(prev => {
            const next = [...prev]
            next[idx] = Math.min(100, eased)
            return next
          })
          if (step >= steps) {
            clearInterval(id)
            setProgress(prev => { const n = [...prev]; n[idx] = 100; return n })
          }
        }, interval)
      }, delay)
      delay += task.duration + 200
    })

    const total = tasks.reduce((s, t) => s + t.duration + 200, 300)
    setTimeout(() => {
      if (cancelled) return
      setDone(true)
      setTimeout(() => { setShowDone(true) }, 400)
      setTimeout(() => { if (!cancelled) onNext() }, 2000)
    }, total)

    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex flex-col min-h-full px-5 pt-6 pb-8 items-center justify-center">
      <AnimatePresence mode="wait">
        {!showDone ? (
          <motion.div key="loading" className="w-full" exit={{ opacity: 0, scale: 0.95 }}>
            {/* Blurred card */}
            <div className="relative mb-8 mx-auto w-48 h-48 rounded-3xl overflow-hidden flex items-center justify-center"
              style={{ background: 'rgba(204,60,105,0.06)', border: '1px solid rgba(204,60,105,0.15)' }}>
              <div className="absolute inset-0" style={{ backdropFilter: 'blur(2px)' }} />
              {/* Animated face outline */}
              <svg viewBox="0 0 120 140" className="w-28 h-28 relative z-10" fill="none">
                <motion.ellipse cx="60" cy="65" rx="44" ry="55"
                  stroke="#cc3c69" strokeWidth="1.5" strokeDasharray="6 3" fill="rgba(204,60,105,0.04)"
                  animate={{ strokeDashoffset: [0, -100] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <motion.line x1="16" y1="65" x2="104" y2="65"
                  stroke="rgba(204,60,105,0.2)" strokeWidth="0.5"
                  animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.line x1="60" y1="10" x2="60" y2="120"
                  stroke="rgba(204,60,105,0.2)" strokeWidth="0.5"
                  animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
              </svg>
              {/* Scan line */}
              <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', repeatDelay: 0.3 }}
                className="absolute inset-x-0 h-0.5 z-20"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(204,60,105,0.8), transparent)' }}
              />
            </div>

            <h2 className="text-xl font-black text-white text-center mb-2">Analyse rapide</h2>
            <p className="text-xs text-center mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Ton profil est en cours de traitement...
            </p>

            <div className="space-y-4">
              {tasks.map((task, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs" style={{ color: progress[i] === 100 ? '#cc3c69' : 'rgba(255,255,255,0.5)' }}>
                      {task.label}
                    </span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: progress[i] === 100 ? '#cc3c69' : 'rgba(255,255,255,0.3)' }}>
                      {progress[i]}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress[i]}%`,
                        background: progress[i] === 100
                          ? 'linear-gradient(90deg, #cc3c69, #e0557f)'
                          : 'linear-gradient(90deg, rgba(204,60,105,0.5), #cc3c69)',
                        transition: 'width 0.1s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5 }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <h2 className="text-2xl font-black text-white mb-2">Analyse terminée !</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Tes résultats sont prêts</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

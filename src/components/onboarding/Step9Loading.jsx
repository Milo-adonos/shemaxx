import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useT } from '../../contexts/LangContext'

// ── Couleurs ─────────────────────────────────────────────────────────────────
const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`
const GREEN  = '#34d399'

// ── Métriques avec keyframes réalistes ───────────────────────────────────────
// Chaque keyframe : [ms depuis le début de cette métrique, valeur 0-100]
// Durée totale ~45 secondes (entre 30s et 1 minute)
const METRICS_BASE = [
  { icon: '◈', result: 94, startAt: 1500,  kf: [[0,0],[1600,24],[3400,41],[5200,44],[8000,45],[10200,68],[12200,82],[14200,91],[15700,94],[17000,100]] },
  { icon: '⬡', result: 87, startAt: 8000,  kf: [[0,0],[1400,17],[3000,32],[4700,35],[7200,36],[9000,59],[10900,75],[12800,84],[14400,100]] },
  { icon: '◎', result: 91, startAt: 15000, kf: [[0,0],[1750,22],[3550,43],[5000,46],[7500,47],[9500,70],[11500,84],[13400,90],[15000,100]] },
  { icon: '⬟', result: 88, startAt: 22000, kf: [[0,0],[1500,19],[3200,36],[5000,38],[7200,39],[9000,62],[11000,78],[13000,86],[14500,100]] },
  { icon: '✦', result: 96, startAt: 29500, kf: [[0,0],[1900,26],[3700,48],[5500,51],[8000,52],[10000,74],[12000,88],[14000,94],[15500,100]] },
]

// ── Interpolation keyframes ───────────────────────────────────────────────────
function interpolate(kf, t) {
  if (t <= 0) return 0
  if (t >= kf[kf.length - 1][0]) return 100
  for (let i = 0; i < kf.length - 1; i++) {
    if (t >= kf[i][0] && t <= kf[i + 1][0]) {
      const ratio = (t - kf[i][0]) / (kf[i + 1][0] - kf[i][0])
      return Math.round(kf[i][1] + ratio * (kf[i + 1][1] - kf[i][1]))
    }
  }
  return 100
}

export default function Step9Loading({ onNext }) {
  const t = useT()
  const METRICS = METRICS_BASE.map((m, i) => ({ ...m, label: t.step9Loading.metrics[i] ?? m.label }))
  const [progress,    setProgress]   = useState(METRICS_BASE.map(() => 0))
  const [avgScore,    setAvgScore]   = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    startRef.current = Date.now()

    const tick = () => {
      if (cancelled) return
      const elapsed = Date.now() - startRef.current

      const next = METRICS.map(m => interpolate(m.kf, elapsed - m.startAt))
      setProgress(next)

      // Score moyen des métriques actives
      const active = next.filter((_, i) => elapsed >= METRICS[i].startAt)
      if (active.length > 0) {
        const avg = Math.round(active.reduce((s, v) => s + v, 0) / active.length)
        setAvgScore(avg)
      }

      if (next.every(v => v >= 100)) {
        setTimeout(() => { if (!cancelled) onNext() }, 600)
        return
      }

      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex flex-col px-5 pt-6 pb-6 items-center"
      style={{ background: '#000', position: 'relative', minHeight: '100%' }}>

      {/* Ambient glow */}
      <div className="absolute pointer-events-none"
        style={{
          top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 320, height: 320,
          background: `radial-gradient(circle, ${PINK_A(0.12)}, transparent 70%)`,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
        <motion.div className="w-full flex flex-col items-center"
          exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>

            {/* Titre */}
            <motion.div className="text-center mb-6"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: PINK }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity }} />
                <span className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: PINK_A(0.7) }}>IA en cours d'analyse</span>
              </div>
              <h2 className="text-2xl font-black text-white">Traitement de ton visage</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Analyse par intelligence artificielle
              </p>
            </motion.div>

            {/* Central scanning element */}
            <motion.div className="relative mb-8 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}>
              <div style={{ width: 160, height: 160, position: 'relative' }}>

                {/* Outer glow ring */}
                <motion.div className="absolute inset-0 rounded-full"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ boxShadow: `0 0 40px ${PINK_A(0.35)}`, borderRadius: '50%' }}
                />

                {/* SVG rings + face */}
                <svg width="160" height="160" viewBox="0 0 160 160"
                  style={{ position: 'absolute', inset: 0 }}>

                  {/* Outer dashed ring */}
                  <motion.circle cx="80" cy="80" r="72"
                    fill="none" stroke={PINK_A(0.2)} strokeWidth="1"
                    strokeDasharray="4 5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '80px 80px' }}
                  />

                  {/* Progress arc */}
                  <motion.circle cx="80" cy="80" r="64"
                    fill="none" stroke={PINK} strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 64}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 64 * (1 - avgScore / 100) }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px',
                      filter: `drop-shadow(0 0 6px ${PINK})` }}
                  />

                  {/* Inner ring */}
                  <circle cx="80" cy="80" r="54"
                    fill="none" stroke={PINK_A(0.08)} strokeWidth="1" />

                  {/* Face outline */}
                  <motion.ellipse cx="80" cy="78" rx="28" ry="34"
                    fill="none" stroke={PINK_A(0.5)} strokeWidth="1.2"
                    strokeDasharray="5 3"
                    animate={{ strokeDashoffset: [0, -40] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* Cross lines */}
                  <line x1="52" y1="78" x2="108" y2="78" stroke={PINK_A(0.2)} strokeWidth="0.6" />
                  <line x1="80" y1="44" x2="80" y2="112" stroke={PINK_A(0.2)} strokeWidth="0.6" />
                </svg>

                {/* Scan line */}
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                  top: '50%', width: 56, height: 68, marginTop: -34, overflow: 'hidden', borderRadius: 40 }}>
                  <motion.div
                    animate={{ y: ['-110%', '110%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.2 }}
                    style={{
                      height: 2, width: '100%',
                      background: `linear-gradient(90deg, transparent, ${PINK}, transparent)`,
                      boxShadow: `0 0 8px ${PINK}`,
                    }}
                  />
                </div>

                {/* Progression centrale */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.span className="text-2xl font-black tabular-nums"
                    style={{ color: '#fff', lineHeight: 1 }}>
                    {avgScore}%
                  </motion.span>
                  <span className="text-[10px] mt-0.5 uppercase tracking-widest" style={{ color: PINK_A(0.6) }}>analyse</span>
                </div>
              </div>
            </motion.div>

            {/* Metrics */}
            <div className="w-full space-y-3">
              {METRICS.map((m, i) => {
                const pct     = progress[i]
                const started = pct > 0
                const done    = pct >= 100

                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: started ? 1 : 0.25, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: done ? PINK_A(0.07) : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${done ? PINK_A(0.25) : 'rgba(255,255,255,0.06)'}`,
                      transition: 'background 0.4s, border 0.4s',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span style={{ color: done ? PINK : 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                          {m.icon}
                        </span>
                        <span className="text-xs font-semibold"
                          style={{ color: done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)' }}>
                          {m.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {done ? (
                          <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 250 }}
                            className="text-xs font-black" style={{ color: PINK }}>
                            100 %
                          </motion.span>
                        ) : (
                          <span className="text-xs font-bold tabular-nums"
                            style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {pct} %
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="h-1 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.08, ease: 'linear' }}
                        style={{
                          background: done
                            ? `linear-gradient(90deg, ${PINK}, #e8608a)`
                            : `linear-gradient(90deg, ${PINK_A(0.4)}, ${PINK})`,
                          boxShadow: done ? `0 0 8px ${PINK_A(0.6)}` : 'none',
                          transition: 'box-shadow 0.4s',
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
      </div>
    </div>
  )
}

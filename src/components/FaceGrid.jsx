import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

const SCORE       = 98
const POTENTIEL   = 99
const CIRCUMFERENCE = 2 * Math.PI * 54 // radius 54

const details = [
  { label: 'Symétrie',    value: 94 },
  { label: 'Mâchoire',   value: 89 },
  { label: 'Pommettes',  value: 92 },
  { label: 'Joues',      value: 85 },
  { label: 'Proportions',value: 91 },
  { label: 'Lèvres',     value: 83 },
]

function scoreColor(v) {
  if (v >= 90) return '#cc3c69'
  if (v >= 80) return '#e0557f'
  return 'rgba(255,255,255,0.55)'
}

function CountUp({ target }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))
  const ref = useRef(null)

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.5, delay: 0.6, ease: 'easeOut' })
    return controls.stop
  }, [target, count])

  return <motion.span ref={ref}>{rounded}</motion.span>
}

export default function FaceGrid() {
  const dashOffset = CIRCUMFERENCE * (1 - SCORE / 100)

  return (
    <div
      className="w-full max-w-xs mx-auto relative"
      style={{ background: '#0a0a0a', borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Top gradient accent */}
      <div
        className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(204,60,105,0.18) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 px-5 pt-6 pb-5">

        {/* ── Profile + Rank ── */}
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar with pulsing halo */}
          <div className="relative shrink-0">
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(204,60,105,0.35)', filter: 'blur(8px)', borderRadius: '50%' }}
            />
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2"
              style={{ background: '#1a1a1a', borderColor: '#cc3c69' }}
            >
              👤
            </div>
          </div>

          {/* Name + date */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white leading-tight">Sofia D.</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>12 mars 2026</p>
          </div>

          {/* Rank badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
            className="shrink-0 flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border"
            style={{ background: 'rgba(204,60,105,0.12)', borderColor: 'rgba(204,60,105,0.5)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(204,60,105,0.8)' }}>Rang</span>
            <span className="text-2xl font-black leading-none" style={{ color: '#cc3c69' }}>S</span>
          </motion.div>
        </div>

        {/* ── Circular gauge ── */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              {/* Background track */}
              <circle
                cx="70" cy="70" r="54"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
              />
              {/* Glow layer */}
              <circle
                cx="70" cy="70" r="54"
                fill="none"
                stroke="#cc3c69"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 70 70)"
                style={{ filter: 'blur(6px)', opacity: 0.4 }}
              />
              {/* Progress arc */}
              <motion.circle
                cx="70" cy="70" r="54"
                fill="none"
                stroke="url(#arcGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 70 70)"
              />
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a02f54" />
                  <stop offset="100%" stopColor="#e0557f" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white leading-none tabular-nums">
                <CountUp target={SCORE} />
              </span>
              <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Score global
              </span>
            </div>
          </div>
        </div>

        {/* ── Potentiel bar ── */}
        <div
          className="rounded-2xl px-4 py-3 mb-4"
          style={{ background: '#141414' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Potentiel max</span>
            <span className="text-base font-black" style={{ color: '#cc3c69' }}>{POTENTIEL}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${POTENTIEL}%` }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #cc3c69, #e0557f, rgba(255,255,255,0.8))' }}
            />
          </div>
        </div>

        {/* ── Metrics grid ── */}
        <div className="grid grid-cols-2 gap-2.5">
          {details.map((d, i) => {
            const col = scoreColor(d.value)
            return (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.07 }}
                className="rounded-xl px-3 py-3"
                style={{ background: '#141414' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{d.label}</span>
                  <span className="text-sm font-black" style={{ color: col }}>{d.value}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ duration: 0.8, delay: 1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${col}66, ${col})` }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Footer watermark ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-5 flex items-center justify-center gap-1.5"
        >
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-[10px] font-black tracking-wider" style={{ color: 'rgba(204,60,105,0.5)' }}>
            She<span style={{ color: 'rgba(255,255,255,0.25)' }}>maxx</span>
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </motion.div>
      </div>
    </div>
  )
}

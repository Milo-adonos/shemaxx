import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

const SCORE = 98
const RANKING = 'Top 1 %'

const details = [
  { label: 'Symétrie',           icon: '◈', value: 97 },
  { label: 'Proportions',        icon: '◈', value: 96 },
  { label: 'Impact du regard',   icon: '◈', value: 98 },
  { label: 'Structure du visage',icon: '◈', value: 97 },
  { label: 'Qualité de peau',    icon: '◈', value: 96 },
  { label: 'Photogénie',         icon: '◈', value: 98 },
]

function FillBar({ value, delayMs = 0 }) {
  return (
    <motion.div
      className="h-full rounded-full"
      style={{ background: '#ff4d88' }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.9, delay: delayMs / 1000, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}

function CountUp({ target }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))
  const ref = useRef(null)
  useEffect(() => {
    const controls = animate(count, target, { duration: 1.3, delay: 0.3, ease: 'easeOut' })
    return controls.stop
  }, [target, count])
  return <motion.span ref={ref}>{rounded}</motion.span>
}

export default function FaceGrid() {
  return (
    <div className="w-full max-w-xs mx-auto relative overflow-hidden rounded-[28px]"
      style={{
        background: 'linear-gradient(160deg, #16121a 0%, #110e16 100%)',
        border: '1px solid rgba(205,55,103,0.22)',
        boxShadow: '0 0 48px rgba(205,55,103,0.12), 0 20px 48px rgba(0,0,0,0.65)',
      }}>

      {/* Glow haut */}
      <div className="absolute top-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(205,55,103,0.2) 0%, transparent 65%)' }} />

      <div className="relative z-10 px-5 pt-5 pb-5">

        {/* Shemaxx centré + TOTAL */}
        <div className="flex flex-col items-center mb-4 gap-1">
          <span className="text-base font-black tracking-tight">
            <span style={{ color: '#cc3c69' }}>She</span><span className="text-white">maxx</span>
          </span>
          <div className="rounded-2xl px-5 py-1.5 text-center relative overflow-hidden"
            style={{ background: 'rgba(205,55,103,0.12)', border: '1px solid rgba(205,55,103,0.35)', backdropFilter: 'blur(8px)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 110%, rgba(205,55,103,0.25), transparent 65%)' }} />
            <p className="text-[8px] uppercase tracking-widest font-bold relative z-10"
              style={{ color: 'rgba(205,55,103,0.8)' }}>Total</p>
            <p className="text-[32px] font-black leading-none relative z-10"
              style={{ color: '#ff4d88', textShadow: '0 0 20px rgba(255,77,136,0.55)' }}>
              <CountUp target={SCORE} />
            </p>
          </div>
        </div>

        {/* Photo centrée */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            <motion.div className="absolute rounded-full pointer-events-none"
              animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.2, repeat: Infinity }}
              style={{ inset: -5, border: '2px solid rgba(205,55,103,0.75)', borderRadius: '50%',
                boxShadow: '0 0 22px rgba(205,55,103,0.55)' }} />
            <div className="w-[110px] h-[110px] rounded-full overflow-hidden"
              style={{
                border: '2px solid #cc3c69',
                backgroundImage: 'url(/woman-card-demo.png)',
                backgroundSize: '220%',
                backgroundPosition: '48% 22%',
                backgroundRepeat: 'no-repeat',
              }} />
          </div>
        </div>

        {/* Classement global — compact */}
        <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3"
          style={{ background: 'rgba(205,55,103,0.08)', border: '1px solid rgba(205,55,103,0.2)' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13 }}>🏆</span>
            <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Classement global</span>
          </div>
          <span className="text-[14px] font-black" style={{ color: '#ff4d88' }}>{RANKING}</span>
        </div>

        {/* Grille métriques */}
        <div className="grid grid-cols-2 gap-2">
          {details.map((d, i) => (
            <motion.div key={d.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className="rounded-xl px-3 py-2 flex flex-col gap-1"
              style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-1 min-w-0">
                <span style={{ color: 'rgba(205,55,103,0.65)', fontSize: 11, flexShrink: 0 }}>{d.icon}</span>
                <span className="text-[11px] font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>{d.label}</span>
              </div>
              <span className="text-[22px] font-black tabular-nums leading-none"
                style={{ color: '#ff4d88', textShadow: '0 0 14px rgba(255,77,136,0.4)' }}>{d.value}</span>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <FillBar value={d.value} delayMs={500 + i * 80} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

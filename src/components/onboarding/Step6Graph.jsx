import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

const weeks = ['Sem. 1', 'Sem. 2', 'Sem. 3']

// Points AI line (progressive improvement)
const aiPoints  = [{ x: 0, y: 70 }, { x: 1, y: 45 }, { x: 2, y: 15 }]
// Points generic line (stagnation / slight decline)
const genPoints = [{ x: 0, y: 62 }, { x: 1, y: 65 }, { x: 2, y: 68 }]

const W = 280
const H = 120
const PAD = { left: 10, right: 10, top: 10, bottom: 10 }

function toSVG(pts) {
  return pts.map(p => {
    const x = PAD.left + (p.x / 2) * (W - PAD.left - PAD.right)
    const y = PAD.top + (p.y / 100) * (H - PAD.top - PAD.bottom)
    return [x, y]
  })
}

function pathD(pts) {
  const coords = toSVG(pts)
  return coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0]},${c[1]}`).join(' ')
}

export default function Step6Graph({ onNext }) {
  const aiCoords  = toSVG(aiPoints)
  const genCoords = toSVG(genPoints)

  return (
    <StepLayout
      title="Révèle ton potentiel avec l'IA"
      subtitle="Glow up avec l'IA"
      cta="Continuer"
      onCta={onNext}
    >
      <div className="mt-2">
        {/* Graph card */}
        <div className="w-full rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#111' }}>
          <div className="px-5 pt-5 pb-1">
            <p className="text-base font-black text-white">Improve with Shemaxx</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Looksmaxxing with AI</p>
          </div>

          <div className="px-4 py-4">
            {/* Week labels */}
            <div className="flex justify-between px-2 mb-2">
              {weeks.map(w => (
                <span key={w} className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{w}</span>
              ))}
            </div>

            {/* SVG chart */}
            <div className="relative">
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                {/* Subtle grid */}
                {[25, 50, 75].map(y => {
                  const sy = PAD.top + (y / 100) * (H - PAD.top - PAD.bottom)
                  return (
                    <line key={y} x1={PAD.left} x2={W - PAD.right} y1={sy} y2={sy}
                      stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  )
                })}

                {/* Generic line (red) */}
                <motion.path
                  d={pathD(genPoints)}
                  fill="none" stroke="#ff4d4d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
                />
                {genCoords.map(([x, y], i) => (
                  <motion.circle key={i} cx={x} cy={y} r="4" fill="#ff4d4d"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.3 }} />
                ))}

                {/* AI line (pink) */}
                <motion.path
                  d={pathD(aiPoints)}
                  fill="none" stroke="#cc3c69" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(204,60,105,0.6))' }}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
                />
                {/* AI area fill */}
                <motion.path
                  d={`${pathD(aiPoints)} L${W - PAD.right},${H - PAD.bottom} L${PAD.left},${H - PAD.bottom} Z`}
                  fill="url(#aiArea)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                />
                <defs>
                  <linearGradient id="aiArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cc3c69" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#cc3c69" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {aiCoords.map(([x, y], i) => (
                  <motion.circle key={i} cx={x} cy={y} r="4" fill="#cc3c69"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(204,60,105,0.8))' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.3, type: 'spring' }} />
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#cc3c69', boxShadow: '0 0 6px rgba(204,60,105,0.7)' }} />
                <span className="text-[10px] text-white/50">Analyse IA Shemaxx</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-[10px] text-white/50">Conseils internet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key stat */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-4 p-4 rounded-2xl text-center border border-white/6"
          style={{ background: 'rgba(204,60,105,0.06)' }}
        >
          <p className="text-2xl font-black" style={{ color: '#cc3c69' }}>3x</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            plus de résultats visibles en 3 semaines avec l'analyse IA
          </p>
        </motion.div>
      </div>
    </StepLayout>
  )
}

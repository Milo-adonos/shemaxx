import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

// SVG paths
const SHEMAXX_PATH = "M 28,148 C 60,148 80,130 110,108 S 160,72 195,50 S 240,28 272,18"
const INTERNET_PATH = "M 28,148 C 48,130 58,112 75,120 S 100,138 118,122 S 142,100 162,118 S 188,138 208,124 S 238,130 272,136"

// Longueur approximative des paths pour l'animation stroke-dashoffset
const SHEMAXX_LEN  = 340
const INTERNET_LEN = 310

export default function Step6Graph({ onNext }) {
  return (
    <StepLayout
      title="Révèle ton potentiel avec l'IA"
      cta="Continuer"
      onCta={onNext}
    >
      <div className="mt-3">
        {/* Graph card */}
        <div
          className="w-full rounded-2xl overflow-hidden border border-white/8 relative"
          style={{ background: '#0d0d0d' }}
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(204,60,105,0.12), transparent 70%)' }} />

          <div className="px-5 pt-5 pb-1">
            <p className="text-lg font-black text-white leading-snug">
              Looksmaxxing<br />avec Shemaxx
            </p>
          </div>

          {/* SVG Chart */}
          <div className="px-3 pt-2 pb-0">
            <svg
              viewBox="0 0 300 175"
              className="w-full"
              style={{ overflow: 'visible' }}
            >
              {/* ── Shemaxx line (pink, going up) ── */}
              {/* Glow layer */}
              <motion.path
                d={SHEMAXX_PATH}
                fill="none"
                stroke="#cc3c69"
                strokeWidth="6"
                strokeLinecap="round"
                style={{ filter: 'blur(8px)', opacity: 0.35 }}
                strokeDasharray={SHEMAXX_LEN}
                initial={{ strokeDashoffset: SHEMAXX_LEN }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Main line */}
              <motion.path
                d={SHEMAXX_PATH}
                fill="none"
                stroke="#cc3c69"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={SHEMAXX_LEN}
                initial={{ strokeDashoffset: SHEMAXX_LEN }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Start dot */}
              <motion.circle cx="28" cy="148" r="6" fill="white"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }} />
              {/* End dot */}
              <motion.circle cx="272" cy="18" r="6" fill="#cc3c69"
                style={{ filter: 'drop-shadow(0 0 6px rgba(204,60,105,0.9))' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 1.6, type: 'spring', stiffness: 200 }} />
              {/* Label "Shemaxx" */}
              <motion.text
                x="248" y="10"
                fill="#cc3c69" fontSize="11" fontWeight="900" textAnchor="middle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
              >
                Shemaxx
              </motion.text>

              {/* ── Internet line (red, wavy going down) ── */}
              <motion.path
                d={INTERNET_PATH}
                fill="none"
                stroke="#ff5252"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={INTERNET_LEN}
                initial={{ strokeDashoffset: INTERNET_LEN }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.6, delay: 0.6, ease: 'easeInOut' }}
              />
              {/* End dot */}
              <motion.circle cx="272" cy="136" r="5" fill="none" stroke="#ff5252" strokeWidth="2.5"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 1.9, type: 'spring' }} />
              {/* Label "Tutos en ligne" */}
              <motion.text
                x="248" y="112"
                fill="#ff5252" fontSize="10" fontWeight="700" textAnchor="middle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                Tutos en ligne
              </motion.text>

              {/* ── X Axis ── */}
              <line x1="20" y1="160" x2="280" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Ticks */}
              {[75, 150, 225].map((x, i) => (
                <g key={i}>
                  <line x1={x} y1="158" x2={x} y2="164" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                </g>
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-around px-4 pb-4 -mt-1">
              {['Semaine 1', 'Semaine 2', 'Semaine 3'].map(w => (
                <span key={w} className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{w}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Key stat */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-4 p-4 rounded-2xl flex items-center gap-4 border border-white/6"
          style={{ background: 'rgba(204,60,105,0.06)' }}
        >
          <span className="text-3xl font-black shrink-0" style={{ color: '#cc3c69' }}>3x</span>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            plus de résultats visibles en 3 semaines avec l'analyse IA Shemaxx
          </p>
        </motion.div>
      </div>
    </StepLayout>
  )
}

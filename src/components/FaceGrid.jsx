import { motion } from 'framer-motion'

const metrics = [
  { label: 'Symétrie faciale', value: 94, color: '#cc3c69' },
  { label: 'Harmonie des traits', value: 88, color: '#e0557f' },
  { label: 'Proportions dorées', value: 91, color: '#cc3c69' },
  { label: 'Structure osseuse', value: 86, color: '#e0557f' },
]

const overlayPoints = [
  { x: 50, y: 22, label: 'Front' },
  { x: 30, y: 40, label: 'Pommette G' },
  { x: 70, y: 40, label: 'Pommette D' },
  { x: 50, y: 58, label: 'Nez' },
  { x: 32, y: 72, label: 'Mâchoire G' },
  { x: 68, y: 72, label: 'Mâchoire D' },
  { x: 50, y: 82, label: 'Menton' },
]

export default function FaceGrid() {
  return (
    <div className="relative w-full max-w-sm">
      {/* Main card */}
      <div className="relative rounded-3xl border border-white/10 bg-[#222]/80 backdrop-blur overflow-hidden shadow-2xl">
        {/* Face silhouette zone */}
        <div className="relative h-72 bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] flex items-center justify-center overflow-hidden">
          {/* Scanning line animation */}
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#cc3c69]/80 to-transparent z-20"
          />

          {/* Face outline SVG */}
          <svg viewBox="0 0 200 240" className="w-36 h-auto relative z-10" fill="none">
            {/* Face shape */}
            <motion.ellipse
              cx="100" cy="110" rx="72" ry="90"
              stroke="#cc3c69"
              strokeWidth="1.5"
              strokeDasharray="8 4"
              fill="rgba(204,60,105,0.04)"
              initial={{ strokeDashoffset: 400 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
            {/* Horizontal symmetry line */}
            <motion.line
              x1="28" y1="110" x2="172" y2="110"
              stroke="rgba(204,60,105,0.3)" strokeWidth="0.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            {/* Vertical symmetry line */}
            <motion.line
              x1="100" y1="20" x2="100" y2="200"
              stroke="rgba(204,60,105,0.3)" strokeWidth="0.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            {/* Golden ratio guide */}
            <motion.rect
              x="64" y="70" width="72" height="90" rx="4"
              stroke="rgba(204,60,105,0.2)" strokeWidth="0.5" fill="none"
              strokeDasharray="3 3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            />
            {/* Eye areas */}
            <motion.ellipse cx="72" cy="95" rx="16" ry="8" stroke="rgba(204,60,105,0.5)" strokeWidth="1" fill="none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
            <motion.ellipse cx="128" cy="95" rx="16" ry="8" stroke="rgba(204,60,105,0.5)" strokeWidth="1" fill="none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
            {/* Nose */}
            <motion.path d="M92 120 L100 138 L108 120" stroke="rgba(204,60,105,0.4)" strokeWidth="1" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1 }} />
            {/* Lips */}
            <motion.path d="M82 152 Q100 162 118 152 Q100 170 82 152Z" stroke="rgba(204,60,105,0.5)" strokeWidth="1" fill="rgba(204,60,105,0.08)"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} />
            {/* Jaw angles */}
            <motion.line x1="28" y1="140" x2="60" y2="185" stroke="rgba(204,60,105,0.25)" strokeWidth="0.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2 }} />
            <motion.line x1="172" y1="140" x2="140" y2="185" stroke="rgba(204,60,105,0.25)" strokeWidth="0.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2 }} />
            {/* Overlay dots */}
            {overlayPoints.map((p, i) => (
              <motion.circle
                key={p.label}
                cx={p.x * 2} cy={p.y * 2.4}
                r="3"
                fill="#cc3c69"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
              />
            ))}
          </svg>

          {/* Corner brackets */}
          {[
            'top-3 left-3 border-t-2 border-l-2 rounded-tl-md',
            'top-3 right-3 border-t-2 border-r-2 rounded-tr-md',
            'bottom-3 left-3 border-b-2 border-l-2 rounded-bl-md',
            'bottom-3 right-3 border-b-2 border-r-2 rounded-br-md',
          ].map((cls, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`absolute w-6 h-6 border-[#cc3c69]/60 ${cls}`}
            />
          ))}

          {/* Score badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: 'spring' }}
            className="absolute top-4 right-4 bg-[#cc3c69] rounded-xl px-3 py-1.5 text-center shadow-lg"
          >
            <div className="text-2xl font-black leading-none">9.4</div>
            <div className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">Score</div>
          </motion.div>
        </div>

        {/* Metrics */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/40 uppercase tracking-widest">Analyse en cours</span>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-xs text-[#cc3c69] font-semibold"
            >
              ● Live
            </motion.span>
          </div>
          {metrics.map((m, i) => (
            <div key={m.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/60">{m.label}</span>
                <span className="text-xs font-bold" style={{ color: m.color }}>{m.value}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 1, delay: 0.8 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${m.color}99, ${m.color})` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 1.8, type: 'spring' }}
        className="absolute -bottom-4 -left-4 bg-[#2a2a2a] border border-white/10 rounded-2xl px-4 py-3 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <div>
            <p className="text-xs font-bold text-white">Résultat instantané</p>
            <p className="text-[10px] text-white/40">Analyse en 30 secondes</p>
          </div>
        </div>
      </motion.div>

      {/* Privacy badge */}
      <motion.div
        initial={{ opacity: 0, y: -20, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 2, type: 'spring' }}
        className="absolute -top-4 -right-4 bg-[#2a2a2a] border border-white/10 rounded-2xl px-4 py-3 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-xs font-bold text-white">100% Privé</p>
            <p className="text-[10px] text-white/40">Photo non conservée</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

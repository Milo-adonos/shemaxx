import { motion } from 'framer-motion'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

// Mini animation de tête qui tourne en cercle
const CIRCLE_STEPS = [
  { label: 'Face',   icon: '⬆', angle: 0,    desc: 'Regarde droit devant' },
  { label: 'Droite', icon: '➡', angle: 90,   desc: 'Tourne vers la droite' },
  { label: 'Bas',    icon: '⬇', angle: 180,  desc: 'Penche le menton' },
  { label: 'Gauche', icon: '⬅', angle: 270,  desc: 'Tourne vers la gauche' },
]

export default function Step8Photos({ onNext }) {
  return (
    <div className="flex flex-col min-h-full px-6 pt-8 pb-8">

      {/* ── Titre ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
          Analysons<br />ton visage
        </h1>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Notre IA va scanner ton visage en temps réel.<br />
          Il te suffira de faire un simple cercle avec la tête.
        </p>
      </motion.div>

      {/* ── Illustration cercle ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-center mb-8"
      >
        <div style={{ position: 'relative', width: 180, height: 180 }}>

          {/* Cercle guide */}
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
            {/* Piste */}
            <circle cx="90" cy="90" r="70"
              fill="none"
              stroke={PINK_A(0.12)}
              strokeWidth="2"
              strokeDasharray="8 5"
            />
            {/* Arc coloré */}
            <motion.circle cx="90" cy="90" r="70"
              fill="none"
              stroke={PINK}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="440"
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 0.4, duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
            />
            {/* Flèche de direction */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ delay: 0.4, duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
              style={{ transformOrigin: '90px 90px' }}
            >
              <circle cx="90" cy="20" r="7" fill={PINK} />
              <polygon points="90,12 94,22 86,22" fill="white" />
            </motion.g>
          </svg>

          {/* Tête centrale */}
          <div
            className="absolute flex flex-col items-center justify-center rounded-full"
            style={{
              inset: '35px',
              background: PINK_A(0.1),
              border: `1.5px solid ${PINK_A(0.3)}`,
            }}
          >
            <span style={{ fontSize: 28 }}>👤</span>
          </div>
        </div>
      </motion.div>

      {/* ── Instructions ── */}
      <div className="flex flex-col gap-3 mb-8">
        {[
          { step: '1', title: 'Positionne ton visage', desc: 'Centre ton visage dans le cadre de la caméra' },
          { step: '2', title: 'Fais un cercle', desc: 'Tourne lentement ta tête en cercle — haut, droite, bas, gauche' },
          { step: '3', title: 'Reste dans le cadre', desc: 'Si ton visage sort du cadre, l\'analyse se met en pause' },
        ].map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
            className="flex items-start gap-4 px-4 py-3.5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
              style={{
                background: PINK_A(0.15),
                border: `1.5px solid ${PINK_A(0.4)}`,
                color: PINK,
              }}
            >
              {item.step}
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{item.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Note ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="text-xs text-center leading-relaxed mb-6 px-2"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        🔒 Tes données ne sont jamais stockées ni partagées
      </motion.p>

      {/* ── CTA ── */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full py-5 rounded-full font-black text-base"
        style={{
          background: PINK,
          color: '#fff',
          fontSize: 17,
          boxShadow: `0 0 30px ${PINK_A(0.4)}`,
        }}
      >
        Commencer l'analyse
      </motion.button>
    </div>
  )
}

import { motion } from 'framer-motion'

const shots = [
  { n: 1, label: 'Vue de face',     desc: 'Regarde droit dans l\'objectif' },
  { n: 2, label: 'Profil droit',    desc: 'Tourne la tête à 90° vers la droite' },
  { n: 3, label: 'Profil gauche',   desc: 'Tourne la tête à 90° vers la gauche' },
]

export default function Step8Photos({ onNext }) {
  return (
    <div className="flex flex-col min-h-full px-6 pt-10 pb-8">

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h1 className="text-4xl font-black text-white leading-tight tracking-tight text-center">
          Analysons<br />ton visage
        </h1>
        <p className="text-sm text-center mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Nous allons prendre 3 photos pour analyser ton visage avec précision.
        </p>
      </motion.div>

      {/* Steps list */}
      <div className="flex-1 flex flex-col justify-center gap-4 my-8 items-center">
        {shots.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.45 }}
            className="flex items-center gap-5 w-56"
          >
            {/* Number badge */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-base font-black"
              style={{
                background: 'rgba(204,60,105,0.15)',
                border: '1.5px solid rgba(204,60,105,0.4)',
                color: '#cc3c69',
                boxShadow: '0 0 12px rgba(204,60,105,0.15)',
              }}
            >
              {s.n}
            </div>

            {/* Text */}
            <div>
              <p className="font-bold text-white text-base leading-tight">{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-center leading-relaxed mb-6 px-4"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        Assure-toi que ton visage est bien éclairé et clairement visible sur chaque photo.
      </motion.p>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full py-5 rounded-full font-black text-base transition-all"
        style={{
          background: '#cc3c69',
          color: '#fff',
          fontSize: 17,
          boxShadow: '0 0 28px rgba(204,60,105,0.4)',
        }}
      >
        Commencer l'analyse
      </motion.button>
    </div>
  )
}

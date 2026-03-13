import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

const shots = [
  { label: 'De face',       icon: '📸', desc: 'Regarde droit dans l\'objectif' },
  { label: 'Côté gauche',   icon: '📸', desc: 'Tourne la tête à 90°' },
  { label: 'Côté droit',    icon: '📸', desc: 'Tourne la tête à 90°' },
]

export default function Step8Photos({ onNext }) {
  return (
    <StepLayout
      title="Préparation de l'analyse"
      subtitle="Prends 3 photos claires dans un endroit bien éclairé pour une analyse optimale."
      cta="Commencer l'upload"
      onCta={onNext}
    >
      <div className="mt-4 space-y-3">
        {shots.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-white/8"
            style={{ background: '#141414' }}
          >
            {/* Photo placeholder */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border-2 border-dashed"
              style={{ borderColor: 'rgba(204,60,105,0.35)', background: 'rgba(204,60,105,0.05)' }}
            >
              <span className="text-2xl">{s.icon}</span>
            </div>
            <div>
              <p className="font-bold text-sm text-white">{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.desc}</p>
            </div>
            <div className="ml-auto shrink-0 w-6 h-6 rounded-full border border-dashed flex items-center justify-center"
              style={{ borderColor: 'rgba(204,60,105,0.3)' }}>
              <span className="text-[10px]" style={{ color: 'rgba(204,60,105,0.5)' }}>+</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 p-4 rounded-2xl border border-white/5 flex items-start gap-3"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <span className="text-lg shrink-0">💡</span>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Bonne lumière naturelle, pas de lunettes, cheveux en arrière pour un meilleur résultat.
          Tes photos ne sont jamais stockées.
        </p>
      </motion.div>
    </StepLayout>
  )
}

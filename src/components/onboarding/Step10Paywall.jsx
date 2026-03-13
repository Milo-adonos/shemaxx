import { motion } from 'framer-motion'
import { Check, ShieldCheck } from 'lucide-react'

const mainFeatures = [
  'Analyse IA complète illimitée',
  'Suivi de progression personnalisé',
  'Conseils actualisés chaque semaine',
  'Support prioritaire',
]

const plans = [
  { id: 'annual',  label: 'Annuel',   price: '119€',   period: '/an',     badge: 'Économise 40%' },
]

export default function Step10Paywall({ pseudo, onClose }) {
  return (
    <div className="flex flex-col min-h-full px-5 pt-4 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center">
        <h1 className="text-2xl font-black text-white leading-tight">
          {pseudo ? `${pseudo}, découvre` : 'Découvre'} tes<br />
          <span style={{ color: '#cc3c69' }}>résultats complets</span>
        </h1>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Ton analyse est prête. Choisis ton accès pour débloquer tous tes insights.
        </p>
      </motion.div>

      {/* Main offer — RECOMMENDED */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 120 }}
        className="relative rounded-2xl p-5 mb-3 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(204,60,105,0.12), rgba(204,60,105,0.06))',
          border: '1.5px solid #cc3c69',
          boxShadow: '0 0 30px rgba(204,60,105,0.2)',
        }}
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(204,60,105,0.3), transparent)', filter: 'blur(16px)' }} />

        {/* Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
          style={{ background: '#cc3c69' }}>
          RECOMMANDÉ
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💎</span>
          <span className="font-black text-white text-base">Accès Hebdomadaire</span>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-black" style={{ color: '#cc3c69' }}>3,99€</span>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>/ semaine</span>
        </div>

        <div className="space-y-2 mb-5">
          {mainFeatures.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Check size={13} style={{ color: '#cc3c69' }} className="shrink-0" />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
            </div>
          ))}
        </div>

        <button
          className="w-full py-4 rounded-full font-black text-base text-white transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #cc3c69, #e0557f)',
            boxShadow: '0 0 24px rgba(204,60,105,0.5)',
          }}
        >
          Commencer mon glow up ✨
        </button>
      </motion.div>

      {/* Secondary plans */}
      <div className="grid grid-cols-1 gap-3 mb-5">
        {plans.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            className="relative p-4 rounded-2xl border text-left transition-all active:scale-95"
            style={{ background: '#141414', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {p.badge && (
              <span className="absolute -top-2 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(204,60,105,0.15)', color: '#cc3c69', border: '1px solid rgba(204,60,105,0.3)' }}>
                {p.badge}
              </span>
            )}
            <p className="text-xs text-white/50 mb-1">{p.label}</p>
            <p className="text-lg font-black text-white">{p.price}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.period}</p>
          </motion.button>
        ))}
      </div>

      {/* Reassurance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-1.5 flex-wrap"
      >
        <ShieldCheck size={11} style={{ color: 'rgba(204,60,105,0.6)' }} />
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Annule à tout moment · Paiement sécurisé · Données privées
        </span>
      </motion.div>

      {/* Skip */}
      <button
        onClick={onClose}
        className="mt-4 w-full text-center text-xs py-2 transition-opacity hover:opacity-60"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        Peut-être plus tard
      </button>
    </div>
  )
}

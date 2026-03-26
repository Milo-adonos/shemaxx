import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeWithAI } from '../../utils/analyzeWithAI'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

const STEPS = [
  'Symétrie faciale',
  'Proportions dorées',
  'Structure osseuse',
  'Qualité de peau',
]

const MIN_DISPLAY_MS = 30000  // 30 secondes minimum

export default function Step9AnalyzingIA({ onNext, onRescan, analysisData = null, age = null }) {
  const onNextRef     = useRef(onNext)
  onNextRef.current   = onNext
  const [error, setError]       = useState(null)
  const [retryKey, setRetryKey] = useState(0)
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    let cancelled = false
    const startTime = Date.now()

    const run = async () => {
      setError(null)
      try {
        const imageDataUrl       = analysisData?.imageDataUrl       ?? null
        const landmarksSnapshot  = analysisData?.landmarksSnapshot  ?? null

        const scores = await analyzeWithAI(imageDataUrl, landmarksSnapshot, age)

        if (cancelled) return

        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
        setTimeout(() => {
          if (!cancelled) onNextRef.current(scores)
        }, remaining)
      } catch (err) {
        if (cancelled) return
        console.error('Analyse IA échouée :', err)

        if (err.isConfig) {
          setError({ title: 'Configuration manquante', detail: 'La clé API n\'est pas configurée. Contacte le support Shemaxx.', emoji: '⚙️', isImageQuality: false })
        } else if (err.isImageQuality) {
          // Erreur de qualité image — typée avec titre + emoji
          setError({
            title: err.qualityTitle,
            detail: err.message,
            emoji: err.qualityEmoji,
            isImageQuality: true,
          })
        } else {
          // Erreur réseau / API
          const detail = err.message?.includes('401')
            ? 'Problème de connexion au serveur. Vérifie ta connexion internet.'
            : err.message?.includes('abort') || err.message?.includes('timeout')
            ? "L'analyse a pris trop de temps. Assure-toi d'avoir une bonne connexion Wi-Fi."
            : 'Erreur inattendue. Réessaie en gardant le visage bien centré dans le cercle.'
          setError({ title: 'Analyse échouée', detail, emoji: '⚠️', isImageQuality: false })
        }
      }
    }

    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey])

  if (error) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center gap-6 px-8 text-center"
        style={{ background: '#000' }}>

        {/* Icône */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.3)' }}>
          {error.emoji}
        </motion.div>

        {/* Titre + explication */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}>
          <p className="text-xl font-black text-white mb-3">{error.title}</p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
            {error.detail}
          </p>
        </motion.div>

        {/* Conseil visuel si qualité image */}
        {error.isImageQuality && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="w-full max-w-xs rounded-2xl px-4 py-3 text-left"
            style={{ background: 'rgba(204,60,105,0.07)', border: '1px solid rgba(204,60,105,0.2)' }}>
            <p className="text-[11px] font-black uppercase tracking-widest mb-2"
              style={{ color: 'rgba(204,60,105,0.8)' }}>Comment corriger</p>
            {error.emoji === '💡' && (
              <ul className="space-y-1">
                {['Mets-toi face à une fenêtre ou une lampe', 'Évite la lumière dans le dos', 'Préfère la lumière naturelle du jour'].map(t => (
                  <li key={t} className="text-xs flex gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: '#cc3c69' }}>›</span>{t}
                  </li>
                ))}
              </ul>
            )}
            {error.emoji === '📷' && (
              <ul className="space-y-1">
                {['Nettoie l\'objectif de ta caméra', 'Reste immobile pendant le scan', 'Rapproche-toi un peu de l\'écran'].map(t => (
                  <li key={t} className="text-xs flex gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: '#cc3c69' }}>›</span>{t}
                  </li>
                ))}
              </ul>
            )}
            {(error.emoji === '↔️' || error.emoji === '👤') && (
              <ul className="space-y-1">
                {['Regarde droit dans la caméra', 'Tête bien droite, pas inclinée', 'Visage centré dans le cercle'].map(t => (
                  <li key={t} className="text-xs flex gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: '#cc3c69' }}>›</span>{t}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Boutons */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="w-full max-w-xs flex flex-col gap-3">
          {error.isImageQuality && onRescan && (
            <button
              onClick={onRescan}
              className="w-full py-4 rounded-2xl font-black text-base text-white"
              style={{ background: 'linear-gradient(135deg, #cc3c69, #e8608a)',
                boxShadow: '0 0 28px rgba(204,60,105,0.4)' }}>
              📸 Refaire le scan
            </button>
          )}
          <button
            onClick={() => setRetryKey(k => k + 1)}
            className="w-full py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)' }}>
            Réessayer quand même
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full items-center justify-center gap-8 px-8 text-center"
      style={{ background: '#000', position: 'relative' }}>

      {/* ── Popup info durée ── */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 px-6"
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}>
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-xs rounded-3xl px-6 py-7 flex flex-col items-center gap-5"
              style={{ background: 'linear-gradient(160deg, #16121a, #110e16)', border: '1px solid rgba(205,55,103,0.3)', boxShadow: '0 0 40px rgba(205,55,103,0.15)' }}>
              {/* Icône */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(205,55,103,0.12)', border: '1px solid rgba(205,55,103,0.25)' }}>
                ⏳
              </div>
              {/* Texte */}
              <div className="text-center">
                <p className="text-white font-black text-lg mb-2">Analyse en cours</p>
                <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  L'analyse dure entre <span className="font-bold" style={{ color: '#ff4d88' }}>1 à 2 minutes</span>.<br />Veuillez patienter.
                </p>
              </div>
              {/* Bouton OK */}
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3.5 rounded-2xl font-black text-base text-white"
                style={{ background: 'linear-gradient(135deg, #cc3c69, #e8608a)', boxShadow: '0 0 24px rgba(204,60,105,0.4)' }}>
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 mb-1">
        <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: PINK }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: PINK_A(0.75) }}>Shemaxx</span>
      </div>

      {/* Anneaux */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{ border: '2.5px solid transparent', borderTopColor: PINK, borderRightColor: PINK_A(0.4) }} />
        <motion.div animate={{ rotate: -360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full"
          style={{ inset: 8, border: '1.5px solid transparent',
            borderTopColor: PINK_A(0.4), borderLeftColor: PINK_A(0.2) }} />
        <span className="text-3xl">✦</span>
      </div>

      <div>
        <motion.h1 animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-2xl font-black text-white mb-2">
          Analyse IA
        </motion.h1>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Notre intelligence artificielle interprète ton scan facial
          <br />pour préparer ton rapport personnalisé.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2.5">
        {STEPS.map((label, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.28 }}
              className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PINK }} />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.52)' }}>{label}</span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.35 + 0.55 }}
              className="ml-auto text-xs font-bold" style={{ color: PINK }}>✓</motion.span>
          </motion.div>
        ))}
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
        Étape suivante : traitement détaillé de ton visage
      </motion.p>
    </div>
  )
}

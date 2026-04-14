import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { analyzeWithAI } from '../../utils/analyzeWithAI'
import { track } from '../../lib/posthog.js'
import { useT } from '../../contexts/LangContext'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`



const MIN_DISPLAY_MS = 5000  // afficher l'écran au moins 5s

export default function Step9AnalyzingIA({ onNext, onRescan, analysisData = null, age = null }) {
  const t    = useT()
  const STEPS = t.step9Analyzing.steps
  const onNextRef     = useRef(onNext)
  onNextRef.current   = onNext
  const [error, setError]       = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const startTime = Date.now()

    const run = async () => {
      setError(null)
      track('ai_analysis_started', { age })
      try {
        const imageDataUrl       = analysisData?.imageDataUrl       ?? null
        const landmarksSnapshot  = analysisData?.landmarksSnapshot  ?? null

        const scores = await analyzeWithAI(imageDataUrl, landmarksSnapshot, age)

        if (cancelled) return

        track('ai_analysis_completed', {
          total:       scores.total,
          ranking:     scores.ranking,
          beauty_score: scores.beautyScore,
          rank:        scores.rank,
          image_quality: 'ok',
        })

        const elapsed   = Date.now() - startTime
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
        setTimeout(() => { if (!cancelled) onNextRef.current(scores) }, remaining)
      } catch (err) {
        if (cancelled) return
        console.error('Analyse IA échouée :', err)

        let errorType = 'unknown'
        if (err.isConfig)        errorType = 'config_missing'
        else if (err.isImageQuality) errorType = `image_quality_${err.qualityEmoji === '💡' ? 'bad_lighting' : err.qualityEmoji === '📷' ? 'blurry' : err.qualityEmoji === '↔️' ? 'bad_angle' : 'no_face'}`
        else if (err.message?.includes('abort') || err.message?.includes('timeout')) errorType = 'timeout'
        else if (err.message?.includes('401')) errorType = 'auth_error'

        track('ai_analysis_failed', { error_type: errorType, error_message: err.message?.slice(0, 200) })

        if (err.isConfig) {
          setError({ title: t.step9Analyzing.errors.configTitle, detail: t.step9Analyzing.errors.configDetail, emoji: '⚙️', isImageQuality: false })
        } else if (err.isImageQuality) {
          setError({
            title: err.qualityTitle,
            detail: err.message,
            emoji: err.qualityEmoji,
            isImageQuality: true,
          })
        } else {
          const detail = err.message?.includes('401')
            ? t.step9Analyzing.errors.authDetail
            : err.message?.includes('abort') || err.message?.includes('timeout')
            ? t.step9Analyzing.errors.timeoutDetail
            : t.step9Analyzing.errors.networkDetail
          setError({ title: t.step9Analyzing.errors.analysisTitle, detail, emoji: '⚠️', isImageQuality: false })
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
              style={{ color: 'rgba(204,60,105,0.8)' }}>{t.step9Analyzing.errors.howToFix}</p>
            {error.emoji === '💡' && (
              <ul className="space-y-1">
                {t.step9Analyzing.errors.badLighting.tips.map(tip => (
                  <li key={tip} className="text-xs flex gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: '#cc3c69' }}>›</span>{tip}
                  </li>
                ))}
              </ul>
            )}
            {error.emoji === '📷' && (
              <ul className="space-y-1">
                {t.step9Analyzing.errors.blurry.tips.map(tip => (
                  <li key={tip} className="text-xs flex gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: '#cc3c69' }}>›</span>{tip}
                  </li>
                ))}
              </ul>
            )}
            {(error.emoji === '↔️' || error.emoji === '👤') && (
              <ul className="space-y-1">
                {t.step9Analyzing.errors.badAngle.tips.map(tip => (
                  <li key={tip} className="text-xs flex gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: '#cc3c69' }}>›</span>{tip}
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
              {t.step9Analyzing.errors.rescanBtn}
            </button>
          )}
          <button
            onClick={() => setRetryKey(k => k + 1)}
            className="w-full py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)' }}>
            {t.step9Analyzing.errors.retryBtn}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full items-center justify-center gap-8 px-8 text-center"
      style={{ background: '#000', position: 'relative' }}>

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
          {t.step9Analyzing.title}
        </motion.h1>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {t.step9Analyzing.subtitle.split('\n')[0]}
          <br />{t.step9Analyzing.subtitle.split('\n')[1]}
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
        {t.step9Analyzing.nextStep}
      </motion.p>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { track } from '../../lib/posthog.js'
import { useT } from '../../contexts/LangContext'
import Step2 from './Step2Age'
import Step5 from './Step5Potential'
import Step7 from './Step7Pseudo'
import Step8 from './Step8Photos'
import Step8FaceID from './Step8FaceID'
import Step9AnalyzingIA from './Step9AnalyzingIA'
import Step9 from './Step9Loading'
import Step9Reveal, { DEFAULT_DEFAUTS } from './Step9Reveal'
import Step10 from './Step10Paywall'
import Step11 from './Step11Results'

// New flow: Age → Pseudo → Photos → Capture → AnalyzingIA → Loading → Potential → Reveal → Paywall → Results
const TOTAL = 10

// Steps shown without header (full-screen immersive)
const IMMERSIVE_STEPS = [4, 5, 6, 8, 9, 10]

// Number of non-immersive questionnaire steps shown in the progress bar
const PROGRESS_STEPS = 3

export default function Onboarding({ onClose, initialUser, initialSubscribed, initialScans, initialProfile, pendingScores, pendingPayment = 'none' }) {
  const t = useT()
  useEffect(() => {
    document.body.classList.add('app-open')
    return () => document.body.classList.remove('app-open')
  }, [])

  const justPaid  = pendingPayment === 'subscription'
  const canAccess = (initialUser && initialSubscribed) || justPaid
  const startStep = canAccess ? TOTAL : 1

  const [step, setStep] = useState(startStep)
  const [direction, setDirection] = useState(1)
  const [faceidKey, setFaceidKey] = useState(0)
  const [rescanMode, setRescanMode] = useState(false)

  const STEP_NAMES = {
    1:  '01_saisie_age',
    2:  '02_saisie_pseudo',
    3:  '03_instructions_photo',
    4:  '04_capture_photo',
    5:  '05_analyse_ia_en_cours',
    6:  '06_chargement_scores',
    7:  '07_score_potentiel',
    8:  '08_teaser_resultats_floutes',
    9:  '09_paywall',
    10: '10_resultats_debloques',
  }

  const STEP_PATHS = {
    1:  '/scan/age',
    2:  '/scan/pseudo',
    3:  '/scan/instructions',
    4:  '/scan/capture',
    5:  '/scan/analyse',
    6:  '/scan/chargement',
    7:  '/scan/potentiel',
    8:  '/scan/apercu',
    9:  '/scan/offre',
    10: '/scan/resultats',
  }

  useEffect(() => {
    const path = STEP_PATHS[step] ?? `/scan/step-${step}`
    window.history.pushState({ step }, '', path)
    track('funnel_step_viewed', {
      step_number: step,
      step_name:   STEP_NAMES[step] ?? `step_${step}`,
      rescan_mode: rescanMode,
      url:         path,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const restoredScores = pendingScores
    ?? (initialUser && initialScans?.length > 0 ? initialScans[0] : null)

  const [data, setData] = useState({
    age:          initialProfile?.age ?? 22,
    pseudo:       initialProfile?.pseudo ?? (initialUser?.email?.split('@')[0] ?? ''),
    faceScores:   restoredScores,
    analysisData: null,
  })

  const next = (patch = {}) => {
    setData(d => ({ ...d, ...patch }))
    setDirection(1)
    setStep(s => Math.min(s + 1, TOTAL))
  }

  // From Step11Results: jump directly to capture, then teaser only
  const handleRescan = () => {
    setRescanMode(true)
    setFaceidKey(k => k + 1)
    setDirection(1)
    setStep(4)
  }

  const variants = {
    enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
  }

  const steps = [
    // 1 — Age
    <Step2      key={1}  value={data.age} onNext={(v) => next({ age: v })} />,
    // 2 — First name
    <Step7      key={2}  onNext={(v) => next({ pseudo: v })} />,
    // 3 — Photo instructions
    <Step8      key={3}  onNext={() => next()}
      onNextUpload={(raw) => {
        setData(d => ({ ...d, photoUrl: raw.photoUrl, photoLandmarks: raw.photoLandmarks, analysisData: raw.analysisData }))
        setDirection(1)
        setStep(5)
      }}
    />,
    // 4 — Live capture (immersive)
    <Step8FaceID key={`faceid-${faceidKey}`} age={data.age} onNext={(raw) => next({ photoUrl: raw.photoUrl, photoLandmarks: raw.photoLandmarks, analysisData: raw.analysisData })} onRetry={() => setFaceidKey(k => k + 1)} />,
    // 5 — AI analysis (immersive)
    <Step9AnalyzingIA key={5} age={data.age} analysisData={data.analysisData}
      onNext={(scores) => {
        const defauts = (scores.defauts && scores.defauts.length > 0)
          ? scores.defauts
          : DEFAULT_DEFAUTS
        next({ faceScores: { ...scores, defauts, photoUrl: data.photoUrl, photoLandmarks: data.photoLandmarks, scanId: Date.now() } })
      }}
      onRescan={() => { setDirection(-1); setStep(3); setFaceidKey(k => k + 1) }}
    />,
    // 6 — Score loading (immersive)
    <Step9      key={6}  onNext={() => {
      if (rescanMode) { setDirection(1); setStep(9) }
      else next()
    }} />,
    // 7 — Potential score (non-immersive)
    <Step5      key={7}  faceScores={data.faceScores} onNext={() => next()} />,
    // 8 — Teaser / blurred reveal (immersive)
    <Step9Reveal key={8} pseudo={data.pseudo} faceScores={data.faceScores} zones={[]} onNext={() => next()} />,
    // 9 — Paywall (immersive)
    <Step10     key={9}  pseudo={data.pseudo} faceScores={data.faceScores} onNext={() => { setRescanMode(false); next() }} onClose={onClose} />,
    // 10 — Unlocked results (immersive)
    <Step11     key={10} pseudo={data.pseudo} faceScores={data.faceScores} age={data.age} onClose={onClose} onRescan={handleRescan} pendingPayment={pendingPayment} />,
  ]

  const immersive = IMMERSIVE_STEPS.includes(step)
  const progressPct = Math.min((step / PROGRESS_STEPS) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: '#090909' }}
    >
      {/* Header */}
      {!immersive && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <span className="text-base font-black">
            <span style={{ color: '#cc3c69' }}>She</span>
            <span className="text-white">maxx</span>
          </span>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">{Math.min(step, PROGRESS_STEPS)}/{PROGRESS_STEPS}</span>
            <div className="w-24 h-1 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#cc3c69' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/30 hover:text-white/70 transition-colors"
            aria-label={t.onboarding.close}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Close button for immersive steps */}
      {immersive && step !== TOTAL && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-1.5 rounded-full text-white/20 hover:text-white/50 transition-colors"
        >
          <X size={18} />
        </button>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-y-auto"
          >
            {steps[step - 1]}
          </motion.div>
        </AnimatePresence>
      </div>

    </motion.div>
  )
}

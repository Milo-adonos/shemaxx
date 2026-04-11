import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { track } from '../../lib/posthog.js'
import { useT } from '../../contexts/LangContext'
import Step1 from './Step1Qualification'
import Step2 from './Step2Age'
import Step3 from './Step3Zones'
import Step4 from './Step4Result'
import Step5 from './Step5Potential'
import Step6 from './Step6Graph'
import Step7 from './Step7Pseudo'
import Step8 from './Step8Photos'
import Step8FaceID from './Step8FaceID'
import Step9AnalyzingIA from './Step9AnalyzingIA'
import Step9 from './Step9Loading'
import Step9Reveal, { DEFAULT_DEFAUTS } from './Step9Reveal'
import Step10 from './Step10Paywall'
import Step11 from './Step11Results'

const TOTAL = 14

// Étapes sans header (plein écran immersif)
const IMMERSIVE_STEPS = [8, 9, 10, 12, 13, 14]

export default function Onboarding({ onClose, initialUser, initialSubscribed, initialScans, initialProfile, pendingScores, pendingPayment = 'none' }) {
  const t = useT()
  // Bloque le scroll du body pendant que l'app est ouverte
  useEffect(() => {
    document.body.classList.add('app-open')
    return () => document.body.classList.remove('app-open')
  }, [])

  // Accès à l'app (Step11) uniquement si connecté ET abonné,
  // ou si on revient juste de Stripe avec un paiement validé
  const justPaid  = pendingPayment === 'subscription'
  const canAccess = (initialUser && initialSubscribed) || justPaid
  const startStep = canAccess ? TOTAL : 1

  const [step, setStep] = useState(startStep)
  const [direction, setDirection] = useState(1)
  const [faceidKey, setFaceidKey] = useState(0)
  const [rescanMode, setRescanMode] = useState(false)

  // Noms des étapes pour PostHog
  const STEP_NAMES = {
    1:  '01_qualification_objectif',
    2:  '02_saisie_age',
    3:  '03_zones_concernees',
    4:  '04_type_de_resultats',
    5:  '05_graphique_progression',
    6:  '06_saisie_pseudo',
    7:  '07_instructions_photo',
    8:  '08_capture_photo',
    9:  '09_analyse_ia_en_cours',
    10: '10_chargement_scores',
    11: '11_score_potentiel',
    12: '12_teaser_resultats_floutes',
    13: '13_paywall',
    14: '14_resultats_debloques',
  }

  // URLs dédiées pour chaque étape (tracking taap.it + PostHog)
  const STEP_PATHS = {
    1:  '/scan/qualification',
    2:  '/scan/age',
    3:  '/scan/zones',
    4:  '/scan/objectif',
    5:  '/scan/progression',
    6:  '/scan/pseudo',
    7:  '/scan/instructions',
    8:  '/scan/capture',
    9:  '/scan/analyse',
    10: '/scan/chargement',
    11: '/scan/potentiel',
    12: '/scan/apercu',
    13: '/scan/offre',
    14: '/scan/resultats',
  }

  // Tracker chaque changement d'étape + mettre à jour l'URL
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
  // Priorité : scores en attente (retour Stripe) → scans Supabase → null
  const restoredScores = pendingScores
    ?? (initialUser && initialScans?.length > 0 ? initialScans[0] : null)

  const [data, setData] = useState({
    level: null,
    age:   initialProfile?.age ?? 22,
    zones: [],
    result: null,
    pseudo: initialProfile?.pseudo ?? (initialUser?.email?.split('@')[0] ?? ''),
    faceScores: restoredScores,
    analysisData: null,
  })

  const next = (patch = {}) => {
    setData(d => ({ ...d, ...patch }))
    setDirection(1)
    setStep(s => Math.min(s + 1, TOTAL))
  }

  // Depuis Step11Results : saute directement au scan, puis teaser seulement
  const handleRescan = () => {
    setRescanMode(true)
    setFaceidKey(k => k + 1)
    setDirection(1)
    setStep(8)
  }

  const variants = {
    enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
  }

  const steps = [
    <Step1      key={1}  onNext={(v) => next({ level: v })} />,
    <Step2      key={2}  value={data.age} onNext={(v) => next({ age: v })} />,
    <Step3      key={3}  value={data.zones} onNext={(v) => next({ zones: v })} />,
    <Step4      key={4}  onNext={(v) => next({ result: v })} />,
    <Step6      key={5}  onNext={() => next()} />,
    <Step7      key={6}  onNext={(v) => next({ pseudo: v })} />,
    <Step8      key={7}  onNext={() => next()} />,
    <Step8FaceID key={`faceid-${faceidKey}`} age={data.age} onNext={(raw) => next({ photoUrl: raw.photoUrl, photoLandmarks: raw.photoLandmarks, analysisData: raw.analysisData })} onRetry={() => setFaceidKey(k => k + 1)} />,
    <Step9AnalyzingIA key={9} age={data.age} analysisData={data.analysisData}
      onNext={(scores) => {
        const defauts = (scores.defauts && scores.defauts.length > 0)
          ? scores.defauts
          : DEFAULT_DEFAUTS
        next({ faceScores: { ...scores, defauts, photoUrl: data.photoUrl, photoLandmarks: data.photoLandmarks, scanId: Date.now() } })
      }}
      onRescan={() => { setDirection(-1); setStep(8); setFaceidKey(k => k + 1) }}
    />,
    <Step9      key={10}  onNext={() => {
      if (rescanMode) { setDirection(1); setStep(13) }
      else next()
    }} />,
    <Step5      key={11} faceScores={data.faceScores} onNext={() => next()} />,
    <Step9Reveal key={12} pseudo={data.pseudo} faceScores={data.faceScores} zones={data.zones} onNext={() => next()} />,
    <Step10     key={13} pseudo={data.pseudo} faceScores={data.faceScores} onNext={() => { setRescanMode(false); next() }} onClose={onClose} />,
    <Step11     key={14} pseudo={data.pseudo} faceScores={data.faceScores} age={data.age} onClose={onClose} onRescan={handleRescan} pendingPayment={pendingPayment} />,
  ]

  const immersive = IMMERSIVE_STEPS.includes(step)

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
            <span className="text-xs text-white/30">{step}/{TOTAL - 2}</span>
            <div className="w-24 h-1 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#cc3c69' }}
                animate={{ width: `${(step / (TOTAL - 2)) * 100}%` }}
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

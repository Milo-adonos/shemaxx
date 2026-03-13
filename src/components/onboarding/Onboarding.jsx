import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Step1 from './Step1Qualification'
import Step2 from './Step2Age'
import Step3 from './Step3Zones'
import Step4 from './Step4Result'
import Step5 from './Step5Potential'
import Step6 from './Step6Graph'
import Step7 from './Step7Pseudo'
import Step8 from './Step8Photos'
import Step9 from './Step9Loading'
import Step10 from './Step10Paywall'

const TOTAL = 10

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState({
    level: null,
    age: 22,
    zones: [],
    result: null,
    pseudo: '',
  })

  const next = (patch = {}) => {
    setData(d => ({ ...d, ...patch }))
    setDirection(1)
    setStep(s => Math.min(s + 1, TOTAL))
  }

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
  }

  const steps = [
    <Step1  key={1}  onNext={(v) => next({ level: v })} />,
    <Step2  key={2}  value={data.age} onNext={(v) => next({ age: v })} />,
    <Step3  key={3}  value={data.zones} onNext={(v) => next({ zones: v })} />,
    <Step4  key={4}  onNext={(v) => next({ result: v })} />,
    <Step5  key={5}  onNext={() => next()} />,
    <Step6  key={6}  onNext={() => next()} />,
    <Step7  key={7}  onNext={(v) => next({ pseudo: v })} />,
    <Step8  key={8}  onNext={() => next()} />,
    <Step9  key={9}  onNext={() => next()} />,
    <Step10 key={10} pseudo={data.pseudo} onClose={onClose} />,
  ]

  const showProgress = step < 10

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: '#090909' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <span className="text-base font-black">
          <span style={{ color: '#cc3c69' }}>She</span>
          <span className="text-white">maxx</span>
        </span>

        {showProgress && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">{step}/{TOTAL - 1}</span>
            <div className="w-24 h-1 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#cc3c69' }}
                animate={{ width: `${((step) / (TOTAL - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-white/30 hover:text-white/70 transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>

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

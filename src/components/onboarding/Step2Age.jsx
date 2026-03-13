import { useState } from 'react'
import { motion } from 'framer-motion'
import StepLayout from './StepLayout'

const MIN = 13
const MAX = 45

export default function Step2Age({ value, onNext }) {
  const [age, setAge] = useState(value || 22)

  const pct = ((age - MIN) / (MAX - MIN)) * 100

  return (
    <StepLayout
      title="Quel âge as-tu ?"
      cta="Continuer"
      onCta={() => onNext(age)}
    >
      <style>{`
        .age-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
          background: linear-gradient(
            to right,
            #cc3c69 0%,
            #cc3c69 ${pct}%,
            rgba(255,255,255,0.1) ${pct}%,
            rgba(255,255,255,0.1) 100%
          );
        }
        .age-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #cc3c69;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(204,60,105,0.2), 0 0 16px rgba(204,60,105,0.5);
          transition: box-shadow 0.15s;
        }
        .age-slider::-webkit-slider-thumb:active {
          box-shadow: 0 0 0 8px rgba(204,60,105,0.25), 0 0 24px rgba(204,60,105,0.6);
        }
        .age-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #cc3c69;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px rgba(204,60,105,0.2), 0 0 16px rgba(204,60,105,0.5);
        }
      `}</style>

      {/* Big age display */}
      <div className="text-center mb-12">
        <motion.div
          key={age}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="text-8xl font-black tabular-nums leading-none"
          style={{
            color: '#cc3c69',
            textShadow: '0 0 30px rgba(204,60,105,0.5), 0 0 60px rgba(204,60,105,0.2)',
          }}
        >
          {age}
        </motion.div>
        <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>ans</p>
      </div>

      {/* Slider */}
      <div className="px-2">
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="age-slider"
        />
        <div className="flex justify-between mt-3">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{MIN} ans</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{MAX} ans</span>
        </div>
      </div>
    </StepLayout>
  )
}

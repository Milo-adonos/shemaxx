import { motion } from 'framer-motion'

export default function StepLayout({ title, subtitle, children, cta, ctaDisabled, onCta }) {
  return (
    <div className="flex flex-col min-h-full px-5 pt-6 pb-8">
      {/* Title block */}
      <div className="mb-7">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-2xl font-black leading-tight tracking-tight text-white"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm mt-2"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* CTA */}
      {cta && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <button
            onClick={onCta}
            disabled={ctaDisabled}
            className="w-full py-4 rounded-full font-bold text-base transition-all duration-200"
            style={{
              background: ctaDisabled ? 'rgba(204,60,105,0.25)' : '#cc3c69',
              color: ctaDisabled ? 'rgba(255,255,255,0.4)' : '#fff',
              boxShadow: ctaDisabled ? 'none' : '0 0 24px rgba(204,60,105,0.35)',
              cursor: ctaDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {cta}
          </button>
        </motion.div>
      )}
    </div>
  )
}

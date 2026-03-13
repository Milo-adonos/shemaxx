import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import FaceGrid from './FaceGrid'

const points = [
  { label: 'Symétrie faciale', desc: 'Mesure l\'équilibre entre les deux côtés de ton visage.' },
  { label: 'Proportions dorées', desc: 'Analyse tes traits selon les ratios de la divine proportion.' },
  { label: 'Structure osseuse', desc: 'Évalue la définition de ta mâchoire et de tes pommettes.' },
  { label: 'Harmonie des traits', desc: 'Comprend comment tes traits interagissent ensemble.' },
]

export default function Reveal() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#cc3c69]/6 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-5">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

          {/* Left / Top : title */}
          <div className="text-center lg:text-left mb-10 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-5"
            >
              Analyse IA
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-5"
            >
              Découvre ce que ton visage
              <br /><span className="text-[#cc3c69]">révèle vraiment.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-white/50 leading-relaxed mb-8 max-w-sm mx-auto lg:mx-0"
            >
              Notre IA analyse +68 points de référence pour te donner une lecture précise et personnalisée de ton visage.
            </motion.p>

            {/* Points — desktop only */}
            <div className="hidden lg:flex flex-col gap-3">
              {points.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] mt-1.5 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="text-xs text-white/40 ml-2">{p.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right / Bottom : FaceGrid card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <FaceGrid />
          </motion.div>

        </div>
      </div>
    </section>
  )
}

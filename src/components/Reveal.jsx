import { motion } from 'framer-motion'
import FaceGrid from './FaceGrid'
import { useT } from '../contexts/LangContext'

// Variants réutilisables
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] } },
})

const fadeLeft = (delay = 0) => ({
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
})

const fadeScale = (delay = 0) => ({
  hidden:  { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] } },
})

// Déclenche quand 25% de la section est visible — garanti visible au bon moment
const VIEWPORT = { once: true, amount: 0.25 }

export default function Reveal() {
  const t = useT()

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#cc3c69]/6 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-5">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

          {/* Left / Top : title */}
          <div className="text-center lg:text-left mb-10 lg:mb-0">

            {/* Badge */}
            <motion.div
              variants={fadeUp(0)}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] animate-pulse shrink-0" />
              {t.reveal.badge}
            </motion.div>

            {/* Title line 1 */}
            <motion.h2
              variants={fadeUp(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-5"
            >
              {t.reveal.title1}
              <br />
              <motion.span
                variants={fadeUp(0.18)}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                className="inline-block text-[#cc3c69]"
              >
                {t.reveal.title2}
              </motion.span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp(0.26)}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="text-sm text-white/50 leading-relaxed mb-8 max-w-sm mx-auto lg:mx-0"
            >
              {t.reveal.subtitle}
            </motion.p>

            {/* Points — desktop only */}
            <div className="hidden lg:flex flex-col gap-3">
              {t.reveal.points.map((p, i) => (
                <motion.div
                  key={i}
                  variants={fadeLeft(0.32 + i * 0.09)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT}
                  className="flex items-start gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.3, delay: 0.34 + i * 0.09, type: 'spring', stiffness: 400 }}
                    className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] mt-1.5 shrink-0"
                  />
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
            variants={fadeScale(0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex justify-center lg:justify-end"
          >
            <FaceGrid />
          </motion.div>

        </div>
      </div>
    </section>
  )
}

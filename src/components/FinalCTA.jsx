import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Clock, Sparkles } from 'lucide-react'


const reassurances = [
  { icon: ShieldCheck, text: '100% confidentiel' },
  { icon: Clock, text: 'Résultats en 30 sec' },
]

export default function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="cta" ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[700px] h-[300px] md:h-[400px] rounded-full bg-[#cc3c69]/12 blur-[80px] md:blur-[100px]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] animate-pulse" />
            Rejoins les 12 000+ femmes
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-5">
            Prête à mog
            <br />
            <span className="bg-gradient-to-r from-[#cc3c69] to-[#e0557f] bg-clip-text text-transparent">
              toutes tes copines ?
            </span>
          </h2>

          <p className="text-base text-white/50 leading-relaxed mb-8 max-w-sm mx-auto">
            Lance ta première analyse et découvre ton potentiel beauté.
          </p>

          <motion.a
            href="#"
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base bg-[#cc3c69] text-white shadow-[0_0_30px_rgba(204,60,105,0.35)] mb-8 active:scale-95 transition-transform duration-150"
          >
            <Sparkles size={18} />
            Analyser mon visage gratuitement
          </motion.a>

          {/* Reassurances */}
          <div className="flex items-center justify-center gap-5 flex-wrap">
            {reassurances.map((r, i) => {
              const Icon = r.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-1.5 text-xs text-white/40"
                >
                  <Icon size={13} className="text-[#cc3c69] shrink-0" />
                  {r.text}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

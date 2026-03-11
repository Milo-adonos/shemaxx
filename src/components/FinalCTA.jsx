import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Clock, Sparkles } from 'lucide-react'

const reassurances = [
  { icon: ShieldCheck, text: '100% confidentiel — photo jamais stockée' },
  { icon: Clock, text: 'Résultats en moins de 30 secondes' },
  { icon: Sparkles, text: 'Gratuit pour commencer, sans carte bancaire' },
]

export default function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="cta" ref={ref} className="relative py-32 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#090909] via-[#090909] to-[#090909]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#cc3c69]/12 blur-[100px]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Pill label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] animate-pulse" />
            Rejoins les 12 000+ femmes
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Prête à te voir
            <br />
            <span className="bg-gradient-to-r from-[#cc3c69] to-[#e0557f] bg-clip-text text-transparent">
              sous ton meilleur jour ?
            </span>
          </h2>

          <p className="text-lg text-white/55 leading-relaxed mb-12 max-w-xl mx-auto">
            Une analyse. Des insights qui changent tout. Et la certitude de savoir exactement ce qui te rend irrésistible.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.a
              href="#"
              whileHover={{ scale: 1.03, boxShadow: '0 0 60px rgba(204,60,105,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="relative group px-10 py-5 rounded-full font-bold text-lg bg-[#cc3c69] text-white overflow-hidden shadow-[0_0_30px_rgba(204,60,105,0.3)] transition-shadow duration-300"
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                <Sparkles size={20} />
                Analyser mon visage gratuitement
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#cc3c69] via-[#e0557f] to-[#cc3c69] bg-[length:200%] group-hover:bg-right transition-all duration-500" />
            </motion.a>
          </div>

          {/* Reassurances */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            {reassurances.map((r, i) => {
              const Icon = r.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-white/40"
                >
                  <Icon size={15} className="text-[#cc3c69] shrink-0" />
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

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const stats = [
  { value: '94%', label: 'des femmes se sentent mal représentées par les apps d\'attractivité existantes' },
  { value: '3x', label: 'plus de précision grâce à des algorithmes entraînés sur des visages féminins' },
  { value: '0', label: 'jugement. Seulement des insights basés sur les standards de la beauté dorée' },
]

export default function WhyNow() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/10 to-transparent" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#cc3c69]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-6"
            >
              Pourquoi maintenant
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6"
            >
              Enfin une IA qui<br />
              <span className="text-[#cc3c69]">te comprend, toi.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-5 text-white/60 leading-relaxed"
            >
              <p>
                Pendant des années, les rares outils d'analyse faciale disponibles ont été conçus par et pour les hommes. Résultat ? Des algorithmes biaisés, des conseils inadaptés, et une expérience qui laisse les femmes de côté.
              </p>
              <p>
                <span className="text-white font-medium">Shemaxx change ça.</span> Notre IA a été entraînée spécifiquement sur des visages féminins, avec une compréhension fine de la beauté féminine dans toute sa diversité — pas une pâle copie d'un outil masculin.
              </p>
              <p>
                Tu mérites des insights pensés pour toi, qui célèbrent tes forces et t'offrent une nouvelle perspective sur ce qui te rend unique.
              </p>
            </motion.div>
          </div>

          {/* Right: stats */}
          <div className="space-y-5">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
                className="group relative p-6 rounded-2xl border border-white/8 bg-[#222]/60 hover:border-[#cc3c69]/30 hover:bg-[#cc3c69]/5 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <span className="text-4xl font-black text-[#cc3c69] leading-none shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {s.value}
                  </span>
                  <p className="text-sm text-white/55 leading-relaxed pt-1">{s.label}</p>
                </div>
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-[#cc3c69]/0 via-[#cc3c69]/30 to-[#cc3c69]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

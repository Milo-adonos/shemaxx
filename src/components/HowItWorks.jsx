import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Camera, Cpu, Sparkles, Download } from 'lucide-react'

const steps = [
  {
    icon: Camera,
    number: '01',
    title: 'Prends ou télécharge ta photo',
    desc: 'Un selfie en bonne lumière suffit. Pas besoin de mise en scène, ton visage naturel est parfait.',
    detail: '30 sec',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'L\'IA analyse ton visage',
    desc: 'Notre algorithme propriétaire examine plus de 68 points de référence faciaux en temps réel.',
    detail: '< 30 sec',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Découvre ton rapport personnalisé',
    desc: 'Un rapport détaillé : symétrie, proportions, structure — avec des insights actionnables et bienveillants.',
    detail: 'Instantané',
  },
  {
    icon: Download,
    number: '04',
    title: 'Accède à tes recommandations',
    desc: 'Coiffures, maquillage, skincare — des conseils ciblés pour sublimer tes points forts.',
    detail: 'Sur-mesure',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how" ref={ref} className="relative py-28 bg-[#1e1e1e]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-6"
          >
            Comment ça marche
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
          >
            Simple comme un selfie,
            <br /><span className="text-[#cc3c69]">puissant comme jamais.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/50 leading-relaxed"
          >
            En moins de deux minutes, obtiens une analyse que même les meilleurs experts en esthétique ne t'offriraient pas.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px">
            <div className="w-full h-full bg-gradient-to-r from-[#cc3c69]/0 via-[#cc3c69]/30 to-[#cc3c69]/0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#2a2a2a] border border-white/10 flex items-center justify-center group-hover:border-[#cc3c69]/40 group-hover:bg-[#cc3c69]/10 transition-all duration-300 shadow-lg">
                      <Icon size={26} className="text-[#cc3c69] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-[10px] font-black text-[#cc3c69] bg-[#1e1e1e] border border-[#cc3c69]/30 rounded-md px-1.5 py-0.5">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-bold text-base mb-2 leading-snug">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">{step.desc}</p>

                  <div className="mt-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cc3c69]/10 border border-[#cc3c69]/20">
                    <span className="w-1 h-1 rounded-full bg-[#cc3c69]" />
                    <span className="text-xs text-[#cc3c69] font-semibold">{step.detail}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

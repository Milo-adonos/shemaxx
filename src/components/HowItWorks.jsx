import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Camera, Cpu, Sparkles, Download } from 'lucide-react'

const steps = [
  {
    icon: Camera,
    number: '01',
    title: 'Prends ou télécharge ta photo',
    desc: 'Un selfie en bonne lumière suffit. Ton visage naturel est parfait.',
    detail: '30 sec',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'L\'IA analyse ton visage',
    desc: 'Notre algorithme examine plus de 68 points de référence faciaux en temps réel.',
    detail: '< 30 sec',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Découvre ton rapport',
    desc: 'Symétrie, proportions, structure — des insights actionnables et bienveillants.',
    detail: 'Instantané',
  },
  {
    icon: Download,
    number: '04',
    title: 'Accède à tes conseils',
    desc: 'Coiffures, maquillage, skincare — des recommandations ciblées pour toi.',
    detail: 'Sur-mesure',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how" ref={ref} className="relative py-16 md:py-24 bg-[#111]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-5"
          >
            Comment ça marche
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-3"
          >
            Tout ce qu'il te faut pour devenir
            <br /><span className="text-[#cc3c69]">la meilleure version de toi-même.</span>
          </motion.h2>
        </div>

        {/* Steps — vertical on mobile, grid on desktop */}
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center p-5 rounded-2xl border border-white/8 bg-[#1a1a1a]/60"
              >
                {/* Icon */}
                <div className="relative shrink-0 mb-0 md:mb-5">
                  <div className="w-14 h-14 rounded-xl bg-[#222] border border-white/10 flex items-center justify-center">
                    <Icon size={24} className="text-[#cc3c69]" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-black text-[#cc3c69] bg-[#111] border border-[#cc3c69]/30 rounded-md px-1.5 py-0.5">
                    {step.number}
                  </span>
                </div>

                <div className="flex-1 md:flex-none">
                  <h3 className="font-bold text-sm md:text-base mb-1 leading-snug">{step.title}</h3>
                  <p className="text-xs md:text-sm text-white/50 leading-relaxed mb-3">{step.desc}</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#cc3c69]/10 border border-[#cc3c69]/20">
                    <span className="w-1 h-1 rounded-full bg-[#cc3c69]" />
                    <span className="text-xs text-[#cc3c69] font-semibold">{step.detail}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

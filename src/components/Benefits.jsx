import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const benefits = [
  {
    emoji: '🎯',
    title: 'Insights qui changent la donne',
    desc: 'Des données précises sur ton visage, pas des généralités.',
    tag: 'Précision',
  },
  {
    emoji: '💡',
    title: 'Conseils actionnables',
    desc: 'Coupe de cheveux, contour, soins ciblés — immédiatement applicables.',
    tag: 'Pratique',
  },
  {
    emoji: '🔒',
    title: 'Confidentialité absolue',
    desc: 'Tes photos ne sont jamais stockées ni partagées.',
    tag: 'Privé',
  },
  {
    emoji: '🌍',
    title: 'Pour toutes les femmes',
    desc: 'Nos algorithmes valorisent la diversité — toutes origines, tous types.',
    tag: 'Inclusif',
  },
  {
    emoji: '📈',
    title: 'Suis ton évolution',
    desc: 'Compare tes analyses et mesure l\'impact de ta routine beauté.',
    tag: 'Suivi',
  },
  {
    emoji: '⚡',
    title: 'Résultats en 30 secondes',
    desc: 'Notre IA de dernière génération. Zéro attente.',
    tag: 'Rapide',
  },
]

export default function Benefits() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="benefits" ref={ref} className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-[#cc3c69]/6 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-5">

        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-5"
          >
            Ce que tu gagnes
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight"
          >
            Pourquoi <span className="text-[#cc3c69]">des milliers de femmes</span>
            <br />utilisent notre analyse.
          </motion.h2>
        </div>

        {/* Featured first row — 2 large cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {benefits.slice(0, 2).map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.08 }}
              className="relative p-6 rounded-2xl bg-[#161616] border border-white/8 overflow-hidden group"
            >
              {/* Accent line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/50 to-transparent" />

              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-[10px] font-bold text-[#cc3c69] bg-[#cc3c69]/10 border border-[#cc3c69]/20 px-2 py-0.5 rounded-full tracking-wider uppercase">
                  {b.tag}
                </span>
              </div>
              <h3 className="font-bold text-base mb-2">{b.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Middle row — 3 compact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {benefits.slice(2, 5).map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.2 + i * 0.08 }}
              className="relative p-5 rounded-2xl bg-[#161616] border border-white/8 overflow-hidden group"
            >
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/30 to-transparent" />

              <span className="text-2xl mb-3 block">{b.emoji}</span>
              <h3 className="font-bold text-sm mb-1.5">{b.title}</h3>
              <p className="text-xs text-white/45 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Last row — 1 full-width card */}
        {benefits.slice(5).map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.36 }}
            className="relative p-5 sm:p-6 rounded-2xl bg-[#161616] border border-white/8 overflow-hidden"
          >
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/30 to-transparent" />

            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-3xl shrink-0">{b.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-sm sm:text-base">{b.title}</h3>
                  <span className="text-[10px] font-bold text-[#cc3c69] bg-[#cc3c69]/10 border border-[#cc3c69]/20 px-2 py-0.5 rounded-full tracking-wider uppercase shrink-0">
                    {b.tag}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/45 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

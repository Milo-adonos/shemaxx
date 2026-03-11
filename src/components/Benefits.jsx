import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const benefits = [
  {
    emoji: '🎯',
    title: 'Insights qui changent la donne',
    desc: 'Comprends enfin ce qui crée ton aura et ton impact visuel. Pas des généralités — des données précises sur ton visage.',
    tag: 'Précision',
  },
  {
    emoji: '💡',
    title: 'Conseils immédiatement actionnables',
    desc: 'Chaque résultat est accompagné de recommandations concrètes : coupe de cheveux, techniques de contour, soins ciblés.',
    tag: 'Pratique',
  },
  {
    emoji: '🔒',
    title: 'Confidentialité absolue',
    desc: 'Tes photos ne sont jamais stockées ni partagées. L\'analyse se fait en temps réel et disparaît instantanément.',
    tag: 'Privé',
  },
  {
    emoji: '🌍',
    title: 'Pensée pour toutes les femmes',
    desc: 'Nos algorithmes reconnaissent et valorisent la diversité des visages féminins — toutes origines, tous types.',
    tag: 'Inclusif',
  },
  {
    emoji: '📈',
    title: 'Suis ton évolution',
    desc: 'Compare tes analyses au fil du temps et mesure l\'impact de tes changements de routine beauté.',
    tag: 'Suivi',
  },
  {
    emoji: '⚡',
    title: 'Résultats en 30 secondes',
    desc: 'Notre IA de dernière génération traite ton analyse plus vite qu\'un clin d\'œil. Zéro attente.',
    tag: 'Rapide',
  },
]

export default function Benefits() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="benefits" ref={ref} className="relative py-28">
      {/* Glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#cc3c69]/6 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-6"
          >
            Ce que tu gagnes
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black leading-tight tracking-tight"
          >
            La confiance qui vient
            <br />de <span className="text-[#cc3c69]">vraiment se connaître.</span>
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.05 + i * 0.08 }}
              className="group relative p-7 rounded-2xl border border-white/8 bg-[#222]/50 hover:border-[#cc3c69]/25 hover:bg-[#222]/80 transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#cc3c69]/0 to-[#cc3c69]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="text-[10px] font-bold text-[#cc3c69] bg-[#cc3c69]/10 border border-[#cc3c69]/20 px-2.5 py-1 rounded-full tracking-wider uppercase">
                    {b.tag}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-2 group-hover:text-[#e0557f] transition-colors duration-300">
                  {b.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

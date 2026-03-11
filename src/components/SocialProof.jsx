import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Camille R.',
    role: 'Créatrice de contenu',
    initial: 'C',
    stars: 5,
    quote: 'J\'ai essayé tous les outils du marché. Shemaxx est le seul qui m\'a donné des vrais insights plutôt que des compliments vides. Mon rapport a changé ma façon de me maquiller complètement.',
    highlight: 'vrais insights',
  },
  {
    name: 'Yasmine T.',
    role: 'Photographe',
    initial: 'Y',
    stars: 5,
    quote: 'En tant que photographe, je pensais bien connaître les proportions faciales. Shemaxx m\'a montré des choses sur mon propre visage que je n\'avais jamais remarquées. Bluffant.',
    highlight: 'Bluffant',
  },
  {
    name: 'Léa M.',
    role: 'Étudiante en médecine',
    initial: 'L',
    stars: 5,
    quote: 'L\'aspect scientifique m\'a convaincue. L\'analyse est rigoureuse, les explications sont claires, et les recommandations sont réalistes. Pas de promesses magiques, juste de la vraie donnée.',
    highlight: 'vraie donnée',
  },
  {
    name: 'Inès B.',
    role: 'Cheffe d\'entreprise',
    initial: 'I',
    stars: 5,
    quote: 'Ce que j\'aime c\'est le ton : bienveillant, jamais jugeant. On parle de potentiel, de forces, jamais de "défauts à corriger". Ça change tout psychologiquement.',
    highlight: 'jamais jugeant',
  },
  {
    name: 'Sofia K.',
    role: 'Coach bien-être',
    initial: 'S',
    stars: 5,
    quote: 'Je le recommande à toutes mes clientes. C\'est un outil de connaissance de soi que je n\'aurais pas cru possible il y a encore deux ans.',
    highlight: 'connaissance de soi',
  },
  {
    name: 'Amara D.',
    role: 'Architecte',
    initial: 'A',
    stars: 5,
    quote: 'Enfin une app qui tient compte de la diversité. Mon type de visage était parfaitement reconnu et les conseils correspondaient vraiment à mes traits. Aucune autre app n\'a réussi ça.',
    highlight: 'diversité',
  },
]

const globalStats = [
  { value: '12 000+', label: 'analyses réalisées' },
  { value: '4.9/5', label: 'note moyenne' },
  { value: '97%', label: 'de satisfaction' },
  { value: '68+', label: 'points analysés' },
]

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} fill="#cc3c69" stroke="none" />
      ))}
    </div>
  )
}

function highlightText(text, keyword) {
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase()
      ? <span key={i} className="text-[#cc3c69] font-semibold">{part}</span>
      : part
  )
}

export default function SocialProof() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="proof" ref={ref} className="relative py-28 bg-[#1e1e1e] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#cc3c69]/5 blur-[120px]" />
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
            Elles l'ont testé
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black leading-tight tracking-tight"
          >
            Des femmes qui ont osé
            <br /><span className="text-[#cc3c69]">se découvrir vraiment.</span>
          </motion.h2>
        </div>

        {/* Global stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {globalStats.map((s, i) => (
            <div key={i} className="text-center p-5 rounded-2xl border border-white/8 bg-[#222]/60">
              <div className="text-3xl font-black text-[#cc3c69] mb-1">{s.value}</div>
              <div className="text-xs text-white/50">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.08 }}
              className="group p-6 rounded-2xl border border-white/8 bg-[#222]/50 hover:border-[#cc3c69]/25 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cc3c69] to-[#a02f54] flex items-center justify-center text-sm font-black text-white shrink-0">
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
                <div className="ml-auto">
                  <Stars count={t.stars} />
                </div>
              </div>

              <blockquote className="text-sm text-white/60 leading-relaxed flex-1">
                "{highlightText(t.quote, t.highlight)}"
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

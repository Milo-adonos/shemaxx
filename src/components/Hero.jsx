import { motion } from 'framer-motion'

function getDailyCount() {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const x = Math.sin(seed) * 10000
  const rand = x - Math.floor(x)
  return Math.floor(rand * (2287 - 823 + 1)) + 823
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[#cc3c69]/10 blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[150px] md:w-[300px] h-[150px] md:h-[300px] rounded-full bg-[#cc3c69]/5 blur-[60px]" />
      </div>

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-5 py-16 md:py-24 flex flex-col items-center text-center">

        <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] animate-pulse shrink-0" />
          {getDailyCount().toLocaleString('fr-FR')} analyses aujourd'hui
        </motion.div>

        <motion.h1
          {...fadeUp(0.2)}
          className="text-[2.6rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-5"
        >
          Maximise{' '}
          <span className="relative inline-block">
            <span className="text-[#cc3c69]">ton potentiel</span>
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none" aria-hidden="true">
              <path d="M2 6C50 2 150 2 298 6" stroke="#cc3c69" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </span>
          <br />avec l'IA.
        </motion.h1>

        <motion.p
          {...fadeUp(0.35)}
          className="text-base md:text-lg text-white/55 leading-relaxed max-w-sm md:max-w-xl mx-auto mb-8"
        >
          Analyse ton visage et découvre des conseils personnalisés pour révéler ton potentiel.
        </motion.p>

        <motion.div {...fadeUp(0.5)} className="flex justify-center mb-10">
          <a
            href="#cta"
            className="px-8 py-4 rounded-full font-bold text-base bg-[#cc3c69] text-white text-center active:scale-95 transition-transform duration-150 shadow-[0_0_30px_rgba(204,60,105,0.3)]"
          >
            Analyser mon visage
          </a>
        </motion.div>

        <motion.div
          {...fadeUp(0.65)}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center"
        >
          {[
            { value: '12 000+', label: 'analyses' },
            { value: '4.9/5', label: 'note' },
            { value: '97%', label: 'satisfaction' },
            { value: '68+', label: 'points analysés' },
          ].map((s, i) => (
            <div key={i} className="flex items-baseline gap-1">
              <span className="text-sm font-black text-[#cc3c69]">{s.value}</span>
              <span className="text-xs text-white/35">{s.label}</span>
              {i < 3 && <span className="ml-2 text-white/10">·</span>}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="text-[10px] text-white/25 tracking-widest uppercase">Découvrir</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-6 bg-gradient-to-b from-[#cc3c69]/50 to-transparent"
        />
      </motion.div>
    </section>
  )
}

import { motion } from 'framer-motion'
import FaceGrid from './FaceGrid'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#cc3c69]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[#cc3c69]/5 blur-[80px]" />
      </div>

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
        {/* Text content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] animate-pulse" />
            IA · Analyse faciale · Exclusif femmes
          </motion.div>

          <motion.h1
            {...fadeUp(0.2)}
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            Découvre ce que<br />
            <span className="relative">
              <span className="text-[#cc3c69]">ton visage</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 6C50 2 150 2 298 6" stroke="#cc3c69" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>{' '}
            <br />dit de toi.
          </motion.h1>

          <motion.p
            {...fadeUp(0.35)}
            className="text-lg md:text-xl text-white/55 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
          >
            La première IA d'analyse faciale pensée <em className="text-white/80 not-italic">exclusivement pour les femmes</em>. Des insights personnalisés sur ta symétrie, tes proportions et ton potentiel — sans filtre, sans jugement.
          </motion.p>

          <motion.div {...fadeUp(0.5)} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a
              href="#cta"
              className="group relative px-8 py-4 rounded-full font-bold text-base bg-[#cc3c69] text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(204,60,105,0.5)] hover:scale-[1.02] active:scale-95"
            >
              <span className="relative z-10">Analyser mon visage gratuitement</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#cc3c69] to-[#e0557f] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
            <a
              href="#how"
              className="px-8 py-4 rounded-full font-semibold text-base border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-all duration-200"
            >
              Voir comment ça marche
            </a>
          </motion.div>

          <motion.div
            {...fadeUp(0.65)}
            className="mt-10 flex items-center gap-6 justify-center lg:justify-start"
          >
            <div className="flex -space-x-3">
              {['A', 'B', 'C', 'D', 'E'].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#090909] bg-gradient-to-br from-[#cc3c69]/60 to-[#2a2a2a] flex items-center justify-center text-xs font-bold"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/50">
              <span className="text-white font-semibold">+12 000</span> femmes ont déjà découvert leur score
            </p>
          </motion.div>
        </div>

        {/* Visual - Face analysis demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex justify-center lg:justify-end"
        >
          <FaceGrid />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/30 tracking-widest uppercase">Découvrir</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-[#cc3c69]/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

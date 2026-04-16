import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { useT } from '../contexts/LangContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

function CountUp({ target, suffix, inView }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const ref = useRef(null)

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, target, { duration: 1.4, ease: 'easeOut' })
    return controls.stop
  }, [inView, target, count])

  return (
    <motion.span ref={ref}>
      {useTransform(rounded, (v) => `${v}${suffix}`).get
        ? <motion.span>{rounded}</motion.span>
        : null}
      <motion.span>{rounded}</motion.span>
      <span>{suffix}</span>
    </motion.span>
  )
}

function AnimatedStat({ target, suffix, inView }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) =>
    target === 0 ? '0' : Math.round(v).toString()
  )

  useEffect(() => {
    if (!inView || target === 0) return
    const controls = animate(count, target, { duration: 1.2, ease: 'easeOut' })
    return controls.stop
  }, [inView, target, count])

  if (target === 0) {
    return <span>0</span>
  }

  return (
    <>
      <motion.span>{rounded}</motion.span>
      <span>{suffix}</span>
    </>
  )
}

export default function WhyNow() {
  const { ref, inView } = useScrollReveal()
  const t = useT()
  const stats = t.whyNow.stats

  return (
    <section ref={ref} className="relative py-16 md:py-24 bg-[#111] overflow-hidden">
      {/* Top border accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#cc3c69]/8 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-5">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#cc3c69]/30 bg-[#cc3c69]/10 text-[#cc3c69] text-xs font-semibold tracking-widest uppercase">
            {t.whyNow.badge}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-center mb-8"
        >
          {t.whyNow.title1}<br />
          <span className="text-[#cc3c69]">{t.whyNow.title2}</span>
        </motion.h2>

        {/* Paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3 text-sm text-white/50 leading-relaxed text-center max-w-lg mx-auto"
        >
          <p>{t.whyNow.p1}</p>
          <p><span className="text-white font-medium">{t.whyNow.p2}</span>{t.whyNow.p2b}</p>
          <p>{t.whyNow.p3}</p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="my-12 h-px bg-gradient-to-r from-transparent via-[#cc3c69]/40 to-transparent origin-center"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.12 }}
              className="flex flex-col items-center text-center px-6 py-6 sm:py-4 group"
            >
              {/* Top accent line */}
              <div className="hidden sm:block w-8 h-0.5 bg-[#cc3c69]/50 rounded-full mb-5 group-hover:w-14 transition-all duration-300" />

              <div
                className="text-5xl md:text-6xl font-black leading-none mb-3 tabular-nums"
                style={{
                  color: '#cc3c69',
                  textShadow: '0 0 12px rgba(204,60,105,0.55), 0 0 30px rgba(204,60,105,0.25)',
                }}
              >
                <AnimatedStat target={s.value} suffix={s.suffix} inView={inView} />
              </div>

              <p className="text-xs text-white/45 leading-relaxed max-w-[160px]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

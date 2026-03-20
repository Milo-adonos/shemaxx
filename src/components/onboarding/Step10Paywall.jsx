import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

const METRIC_GRID = [
  { label: 'Symétrie',           icon: '◈', key: 'symmetry'    },
  { label: 'Proportions',        icon: '⬡', key: 'proportions' },
  { label: 'Impact du regard',   icon: '◎', key: 'regard'      },
  { label: 'Structure du visage',icon: '⬟', key: 'structure'   },
  { label: 'Qualité de peau',    icon: '✦', key: 'skin'        },
  { label: 'Photogénie',         icon: '◇', key: 'photogenie'  },
]

// ── Slide 2 : traits faciaux ──────────────────────────────────────────────────
const TRAITS = [
  { label: 'Forme du visage',     value: 'Ovale' },
  { label: 'Inclinaison canthal', value: 'Positive' },
  { label: 'Forme des yeux',      value: 'Amande' },
]

// ── Slide 3 : actions d'amélioration ─────────────────────────────────────────
const IMPROVEMENTS = [
  {
    emoji: '✨',
    title: 'Routine beauté personnalisée',
    desc: 'Une routine sur mesure pour révéler ton meilleur teint. Tape pour en savoir plus.',
  },
  {
    emoji: '💎',
    title: 'Conseils de style avancés',
    desc: 'Adapte ta coupe, ton contour et ton maquillage à ta morphologie.',
  },
]

const SLIDES = [
  { id: 'ratings', title: 'Ta carte résultats' },
  { id: 'traits',  title: 'En apprendre sur toi' },
  { id: 'improve', title: 'Commence à progresser' },
]

export default function Step10Paywall({ pseudo, faceScores = {}, onClose }) {
  const scores  = faceScores ?? {}
  const total   = scores.total   ?? 70
  const ranking = scores.ranking ?? 'Top 50 %'

  const [userPhoto, setUserPhoto]   = useState(null)
  const fileInputRef                = useRef(null)
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUserPhoto(URL.createObjectURL(file))
  }

  const [slideIdx, setSlideIdx] = useState(0)
  const [dir, setDir] = useState(1)

  const goTo = (idx) => {
    setDir(idx > slideIdx ? 1 : -1)
    setSlideIdx(idx)
  }

  const slideVariants = {
    enter:  (d) => ({ opacity: 0, x: d > 0 ?  48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit:   (d) => ({ opacity: 0, x: d > 0 ? -48 :  48 }),
  }

  return (
    <div className="flex flex-col min-h-full"
      style={{ background: 'linear-gradient(180deg, #0d0d14 0%, #090909 100%)' }}>

      {/* ── Glow accent en haut ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, rgba(204,60,105,0.22), transparent)`, filter: 'blur(32px)' }} />

      {/* ── Titre héro ── */}
      <div className="relative z-10 pt-12 pb-4 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="font-black text-white leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.4rem, 8vw, 3rem)', letterSpacing: '-0.02em' }}>
          {pseudo
            ? <><span style={{ color: PINK }}>{pseudo}</span>, débloque<br />tes résultats</>
            : <>Débloque tes<br /><span style={{ color: PINK }}>résultats complets</span></>
          }
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="mt-2 text-sm"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          Prouvé pour révéler ton potentiel beauté.
        </motion.p>
      </div>

      {/* ── Carousel card ── */}
      <div className="relative z-10 flex-1 px-5 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
          }}>

          {/* Slide title */}
          <div className="px-6 pt-6 pb-4">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.p key={SLIDES[slideIdx].id + '-title'}
                custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg font-black text-white">
                {SLIDES[slideIdx].title}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Slide content */}
          <div className="px-5 pb-6" style={{ minHeight: slideIdx === 0 ? 'auto' : 220 }}>
            <AnimatePresence mode="wait" custom={dir}>
              {/* ── SLIDE 1 : carte résultats (design identique à Step9Reveal) ── */}
              {slideIdx === 0 && (
                <motion.div key="ratings"
                  custom={dir} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>

                  {/* Carte */}
                  <div className="relative rounded-3xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(160deg, #16121a 0%, #110e16 100%)',
                      border: '1px solid rgba(205,55,103,0.18)',
                      boxShadow: '0 0 40px rgba(205,55,103,0.1), 0 16px 40px rgba(0,0,0,0.6)',
                    }}>

                    {/* Top glow */}
                    <div className="absolute top-0 inset-x-0 h-32 pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(205,55,103,0.18) 0%, transparent 65%)' }} />

                    <div className="relative z-10 px-5 pt-5 pb-6">

                      {/* Branding */}
                      <div className="flex items-center justify-center mb-5">
                        <span className="text-base font-black tracking-tight">
                          <span style={{ color: '#cc3c69' }}>She</span>
                          <span className="text-white">maxx</span>
                        </span>
                      </div>

                      {/* Profile row */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="relative shrink-0">
                          <motion.div className="absolute rounded-full"
                            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                            style={{ inset: -4, border: '2px solid rgba(205,55,103,0.7)', borderRadius: '50%',
                              boxShadow: '0 0 16px rgba(205,55,103,0.5)' }} />
                          <input ref={fileInputRef} type="file" accept="image/*"
                            onChange={handlePhotoChange} style={{ display: 'none' }} />
                          <button onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center relative group"
                            style={{ background: 'linear-gradient(135deg, #1d1424, #231929)', border: '2px solid #cc3c69' }}>
                            {userPhoto ? (
                              <img src={userPhoto} alt="photo"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div className="flex flex-col items-center gap-0.5">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                                  stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <path d="m21 15-5-5L5 21"/>
                                </svg>
                                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ background: '#cc3c69', border: '2px solid #000', boxShadow: '0 0 8px rgba(204,60,105,0.6)' }}>
                                  <span className="text-white font-black" style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                                </div>
                              </div>
                            )}
                            {userPhoto && (
                              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: 'rgba(0,0,0,0.5)' }}>
                                <span style={{ fontSize: 16 }}>✎</span>
                              </div>
                            )}
                          </button>
                        </div>

                        <div className="flex-1 min-w-0 ml-3">
                          <p className="text-xl font-black text-white leading-tight truncate">
                            {pseudo || 'Mon analyse'}
                          </p>
                          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-2xl px-4 py-3 text-center relative overflow-hidden"
                          style={{ background: 'rgba(205,55,103,0.1)', border: '1px solid rgba(205,55,103,0.3)',
                            backdropFilter: 'blur(8px)', minWidth: 80 }}>
                          <div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at 50% 100%, rgba(205,55,103,0.2), transparent 70%)' }} />
                          <p className="text-[9px] uppercase tracking-widest font-bold relative z-10"
                            style={{ color: 'rgba(205,55,103,0.7)' }}>Total</p>
                          <p className="text-3xl font-black leading-tight relative z-10"
                            style={{ color: '#ff4d88', textShadow: '0 0 20px rgba(255,77,136,0.5)' }}>{total}</p>
                        </div>
                      </div>

                      {/* Classement */}
                      <div className="flex items-center justify-between rounded-2xl px-4 py-3 mb-4"
                        style={{ background: 'rgba(205,55,103,0.07)', border: '1px solid rgba(205,55,103,0.18)',
                          backdropFilter: 'blur(8px)' }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                            style={{ background: 'rgba(205,55,103,0.2)' }}>🏆</div>
                          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            Classement global
                          </span>
                        </div>
                        <span className="text-lg font-black" style={{ color: '#ff4d88' }}>{ranking}</span>
                      </div>

                      {/* Grille 2×3 métriques */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {METRIC_GRID.map((m, i) => (
                          <div key={i}
                            className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                              backdropFilter: 'blur(6px)' }}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span style={{ color: 'rgba(205,55,103,0.6)', fontSize: 11, flexShrink: 0 }}>{m.icon}</span>
                              <span className="text-xs font-semibold leading-tight"
                                style={{ color: 'rgba(255,255,255,0.5)' }}>{m.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2 shrink-0">
                              <span className="text-xl font-black tabular-nums"
                                style={{ color: '#ff4d88', filter: 'blur(8px)', userSelect: 'none' }}>
                                {scores[m.key] ?? 72}
                              </span>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-3 mt-5">
                        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                        <span className="text-[10px] font-semibold tracking-widest uppercase"
                          style={{ color: 'rgba(255,255,255,0.2)' }}>Analyse IA</span>
                        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SLIDE 2 : traits ── */}
              {slideIdx === 1 && (
                <motion.div key="traits"
                  custom={dir} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-2">
                  {TRAITS.map((t) => (
                    <div key={t.label}
                      className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <span className="text-sm text-white/60">{t.label}</span>
                      <span className="text-sm font-black text-white">{t.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ── SLIDE 3 : améliorations ── */}
              {slideIdx === 2 && (
                <motion.div key="improve"
                  custom={dir} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3">
                  {IMPROVEMENTS.map((item) => (
                    <div key={item.title}
                      className="flex items-start gap-3.5 px-4 py-3.5 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <span className="text-2xl mt-0.5 shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white mb-0.5">{item.title}</p>
                        <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 mt-1" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 pb-5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width:  i === slideIdx ? 20 : 7,
                  height: 7,
                  background: i === slideIdx ? PINK : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                }} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 px-5 pb-8 pt-4 space-y-3">

        {/* Note de frais */}
        <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          L'analyse IA a un coût — merci pour ta compréhension 🤝
        </p>

        {/* Bouton CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-black text-base text-white"
          style={{
            background: `linear-gradient(135deg, ${PINK}, #e0557f)`,
            boxShadow: `0 0 28px rgba(204,60,105,0.45), 0 8px 24px rgba(0,0,0,0.4)`,
          }}>
          Obtiens tes résultats maintenant 🙌
        </motion.button>

        {/* Prix */}
        <p className="text-center font-black text-white text-sm">3,99 € par semaine</p>

        {/* Liens légaux */}
        <div className="flex items-center justify-center gap-4">
          <button className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Conditions d'utilisation
          </button>
          <button className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Confidentialité
          </button>
        </div>

        {/* Skip */}
        <button onClick={onClose}
          className="w-full text-center text-xs py-1 transition-opacity hover:opacity-60"
          style={{ color: 'rgba(255,255,255,0.18)' }}>
          Peut-être plus tard
        </button>
      </div>
    </div>
  )
}

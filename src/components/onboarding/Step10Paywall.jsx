import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HolographicFaceTraits from './HolographicFaceTraits'
import { DEFAULT_DEFAUTS } from './Step9Reveal'
import AuthModal from '../AuthModal'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { track } from '../../lib/posthog.js'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

// Compresse la photo en JPEG 500px max / qualité 0.65 avant stockage localStorage
async function compressPhoto(dataUrl, maxW = 500, quality = 0.65) {
  if (!dataUrl) return null
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl) // fallback si erreur
    img.src = dataUrl
  })
}

const PAYWALL_ZONE_ICONS = {
  nez:       { icon: '👃', color: '#e8608a' },
  nasal:     { icon: '👃', color: '#e8608a' },
  sourcil:   { icon: '〰️', color: '#b57cff' },
  yeux:      { icon: '👁️', color: '#5cc8ff' },
  regard:    { icon: '👁️', color: '#5cc8ff' },
  joue:      { icon: '◉',  color: '#f472b6' },
  mâchoire:  { icon: '⬟',  color: '#fb923c' },
  structure: { icon: '⬟',  color: '#fb923c' },
  pommette:  { icon: '◈',  color: '#a78bfa' },
  peau:      { icon: '✦',  color: '#34d399' },
  front:     { icon: '▱',  color: '#60a5fa' },
  lèvres:    { icon: '◡',  color: '#f87171' },
  menton:    { icon: '◇',  color: '#fbbf24' },
  symétrie:  { icon: '⟺', color: '#cc3c69' },
  proportion:{ icon: '⬡',  color: '#818cf8' },
}
function getPaywallZoneStyle(zone) {
  const z = (zone || '').toLowerCase()
  for (const [key, val] of Object.entries(PAYWALL_ZONE_ICONS)) {
    if (z.includes(key)) return val
  }
  return { icon: '◆', color: PINK }
}

const METRIC_GRID = [
  { label: 'Symétrie',           icon: '◈', key: 'symmetry'    },
  { label: 'Proportions',        icon: '⬡', key: 'proportions' },
  { label: 'Impact du regard',   icon: '◎', key: 'regard'      },
  { label: 'Structure du visage',icon: '⬟', key: 'structure'   },
  { label: 'Qualité de peau',    icon: '✦', key: 'skin'        },
  { label: 'Photogénie',         icon: '◇', key: 'photogenie'  },
]


const SLIDES = [
  { id: 'ratings', title: 'Ta carte résultats' },
  { id: 'traits',  title: 'En apprendre sur toi' },
  { id: 'improve', title: 'Commence à progresser' },
]

export default function Step10Paywall({ pseudo, faceScores = {}, onNext, onClose }) {
  const { user } = useAuth()
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

  const [slideIdx,    setSlideIdx]    = useState(0)
  const [dir,         setDir]         = useState(1)
  const [showAuth,    setShowAuth]    = useState(false)
  const [checkoutErr, setCheckoutErr] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const touchStartX = useRef(null)

  useEffect(() => {
    track('paywall_viewed', {
      total:   faceScores?.total,
      ranking: faceScores?.ranking,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (idx) => {
    if (idx < 0 || idx >= SLIDES.length) return
    setDir(idx > slideIdx ? 1 : -1)
    setSlideIdx(idx)
  }

  // ── Swipe touch handlers ──────────────────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 40) return // trop petit pour considérer un swipe
    if (delta < 0) goTo(slideIdx + 1) // swipe gauche → slide suivant
    else           goTo(slideIdx - 1) // swipe droite → slide précédent
  }

  const slideVariants = {
    enter:  (d) => ({ opacity: 0, x: d > 0 ?  48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit:   (d) => ({ opacity: 0, x: d > 0 ? -48 :  48 }),
  }

  // Redirige vers Stripe dès que le compte est créé
  const startCheckout = async () => {
    setCheckoutLoading(true)
    setCheckoutErr(null)
    track('checkout_started', {
      total:   faceScores?.total,
      ranking: faceScores?.ranking,
    })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Session introuvable — reconnecte-toi.')

      const priceId = import.meta.env.VITE_STRIPE_PRICE_ID
      const origin  = window.location.origin

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          priceId,
          successUrl: `${origin}/?payment=success`,
          cancelUrl:  `${origin}/`,
        },
      })

      if (error) {
        let errMsg = error.message || 'Erreur checkout'
        try {
          const body = await error.context?.json?.()
          if (body?.error || body?.message) errMsg = body.error || body.message
        } catch { /* ignore */ }
        throw new Error(errMsg)
      }
      if (!data?.url) throw new Error('URL de paiement manquante')

      // Sauvegarde les scores avant la redirection Stripe
      if (faceScores) {
        const { photoUrl, photoLandmarks, ...scoresOnly } = faceScores
        try { localStorage.setItem('shemaxx_pending_scores', JSON.stringify(scoresOnly)) } catch { /* ignore */ }
        // Compresse la photo avant de la sauvegarder (réduit de ~2MB à ~150KB)
        if (photoUrl) {
          try {
            const compressed = await compressPhoto(photoUrl)
            localStorage.setItem('shemaxx_pending_photo', compressed)
            // sessionStorage survit aux redirections dans le même onglet
            sessionStorage.setItem('shemaxx_pending_photo', compressed)
          } catch {
            // Même si localStorage échoue, sessionStorage a plus de chances
            try {
              const compressed = await compressPhoto(photoUrl, 400, 0.55)
              sessionStorage.setItem('shemaxx_pending_photo', compressed)
            } catch { /* ignore */ }
          }
        }
        if (photoLandmarks) try { localStorage.setItem('shemaxx_pending_landmarks', JSON.stringify(photoLandmarks)) } catch { /* ignore */ }
      }

      window.location.href = data.url
    } catch (err) {
      setCheckoutErr(err.message || 'Erreur lors du paiement.')
      setCheckoutLoading(false)
    }
  }

  // Clic sur "Obtiens tes résultats" : auth si besoin, puis Stripe
  const handleCta = () => {
    if (user) {
      startCheckout()
    } else {
      setShowAuth(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    startCheckout()
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
          className="rounded-3xl overflow-hidden w-full mx-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            maxWidth: 360,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
          }}>

          {/* Slide title — masqué sur slide 0 car la carte a déjà son branding */}
          {slideIdx !== 0 && (
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
          )}

          {/* Slide content */}
          <div
            className={slideIdx === 0 ? 'px-4 pt-4 pb-4' : 'px-5 pb-6'}
            style={{
              minHeight: slideIdx === 0 ? 'auto' : slideIdx === 1 ? 'auto' : 280,
              maxHeight: slideIdx === 2 ? 'min(52vh, 420px)' : undefined,
              overflowY: slideIdx === 2 ? 'auto' : undefined,
            }}
          >
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

                    <div className="relative z-10 px-4 pt-4 pb-4">

                      {/* Shemaxx centré + TOTAL */}
                      <div className="flex flex-col items-center mb-4 gap-1">
                        <span className="text-base font-black tracking-tight">
                          <span style={{ color: '#cc3c69' }}>She</span>
                          <span className="text-white">maxx</span>
                        </span>
                        <div className="rounded-2xl px-5 py-1.5 text-center relative overflow-hidden"
                          style={{ background: 'rgba(205,55,103,0.12)', border: '1px solid rgba(205,55,103,0.35)', backdropFilter: 'blur(8px)' }}>
                          <div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at 50% 110%, rgba(205,55,103,0.25), transparent 65%)' }} />
                          <p className="text-[8px] uppercase tracking-widest font-bold relative z-10"
                            style={{ color: 'rgba(205,55,103,0.8)' }}>Total</p>
                          <p className="text-[32px] font-black leading-none relative z-10"
                            style={{ color: '#ff4d88', textShadow: '0 0 20px rgba(255,77,136,0.55)' }}>{total}</p>
                        </div>
                      </div>

                      {/* Photo centrée */}
                      <div className="flex justify-center mb-3">
                        <div className="relative">
                          <motion.div className="absolute rounded-full pointer-events-none"
                            animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2, repeat: Infinity }}
                            style={{ inset: -5, border: '2px solid rgba(205,55,103,0.75)', borderRadius: '50%',
                              boxShadow: '0 0 22px rgba(205,55,103,0.55)' }} />
                          <input ref={fileInputRef} type="file" accept="image/*"
                            onChange={handlePhotoChange} style={{ display: 'none' }} />
                          <button onClick={() => fileInputRef.current?.click()}
                            className="w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center relative group"
                            style={{ background: 'linear-gradient(135deg, #1d1424, #231929)', border: '2px solid #cc3c69' }}>
                            {userPhoto ? (
                              <img src={userPhoto} alt="photo"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                                  stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <path d="m21 15-5-5L5 21"/>
                                </svg>
                                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ background: '#cc3c69', border: '2px solid #000', boxShadow: '0 0 8px rgba(204,60,105,0.6)' }}>
                                  <span className="text-white font-black" style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                                </div>
                              </>
                            )}
                            {userPhoto && (
                              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: 'rgba(0,0,0,0.5)' }}>
                                <span style={{ fontSize: 16 }}>✎</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Classement global — compact */}
                      <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3"
                        style={{ background: 'rgba(205,55,103,0.08)', border: '1px solid rgba(205,55,103,0.2)' }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 13 }}>🏆</span>
                          <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Classement global</span>
                        </div>
                        <span className="text-[14px] font-black" style={{ color: '#ff4d88' }}>{ranking}</span>
                      </div>

                      {/* Grille 2×3 métriques */}
                      <div className="grid grid-cols-2 gap-2">
                        {METRIC_GRID.map((m, i) => (
                          <div key={i}
                            className="rounded-xl px-3 py-2 flex flex-col gap-1"
                            style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center gap-1">
                              <span style={{ color: 'rgba(205,55,103,0.65)', fontSize: 11, flexShrink: 0 }}>{m.icon}</span>
                              <span className="text-[11px] font-semibold leading-tight"
                                style={{ color: 'rgba(255,255,255,0.55)' }}>{m.label}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[22px] font-black tabular-nums leading-none"
                                style={{ color: '#ff4d88', filter: 'blur(8px)', userSelect: 'none' }}>
                                {scores[m.key] ?? 72}
                              </span>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                              <div className="h-full rounded-full w-3/4" style={{ background: '#ff4d88', filter: 'blur(4px)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SLIDE 2 : visage holographique + zones interactives ── */}
              {slideIdx === 1 && (
                <motion.div key="traits"
                  custom={dir} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                  <HolographicFaceTraits
                    faceScores={scores}
                    photoUrl={faceScores?.photoUrl ?? null}
                    photoLandmarks={faceScores?.photoLandmarks ?? null}
                  />
                </motion.div>
              )}

              {/* ── SLIDE 3 : vrais défauts détectés, conseils floutés ── */}
              {slideIdx === 2 && (
                <motion.div key="improve"
                  custom={dir} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3 pr-0.5">
                  <p className="text-[11px] leading-relaxed px-1 -mt-1 mb-2" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    Tes améliorations personnalisées — débloque pour tout lire.
                  </p>
                  {(faceScores?.defauts?.length > 0 ? faceScores.defauts : DEFAULT_DEFAUTS).map((d, i) => {
                    const zoneStyle = getPaywallZoneStyle(d.zone)
                    return (
                      <div key={i} className="relative overflow-hidden rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                        {/* Barre colorée gauche */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                          style={{ background: zoneStyle.color, opacity: 0.7 }} />
                        <div className="pl-4 pr-4 pt-3 pb-3">
                          {/* Badge zone */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm leading-none">{zoneStyle.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{ background: `${zoneStyle.color}22`, color: zoneStyle.color, border: `1px solid ${zoneStyle.color}44` }}>
                              {d.zone}
                            </span>
                          </div>
                          {/* Problème — flouté */}
                          <p className="text-[12px] font-semibold leading-snug mb-2 select-none"
                            style={{ color: 'rgba(255,255,255,0.7)', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                            {d.probleme}
                          </p>
                          {/* Conseil — entièrement flouté */}
                          <div className="rounded-xl px-3 py-2 relative overflow-hidden"
                            style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p className="text-[11px] leading-relaxed select-none pointer-events-none"
                              style={{ color: 'rgba(255,255,255,0.6)', filter: 'blur(5px)' }}>
                              {d.conseil.slice(0, 80)}...
                            </p>
                            <div className="mt-1.5 space-y-1" style={{ userSelect: 'none' }}>
                              <div className="h-2 rounded-full" style={{ width: '85%', background: 'rgba(255,255,255,0.06)', filter: 'blur(2px)' }} />
                              <div className="h-2 rounded-full" style={{ width: '60%', background: 'rgba(255,255,255,0.04)', filter: 'blur(2px)' }} />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                              style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))' }} />
                            <div className="absolute bottom-2 right-3 flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(204,60,105,0.7)" strokeWidth="2.5" strokeLinecap="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)', color: '#fff' }}>
                                PRO
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
          Analyse avancée par IA — résultats détaillés et personnalisés
        </p>

        {/* Erreur checkout */}
        {checkoutErr && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-center rounded-xl px-3 py-2"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            {checkoutErr}
          </motion.p>
        )}

        {/* Bouton CTA */}
        <motion.button
          onClick={handleCta}
          disabled={checkoutLoading}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-black text-base text-white relative overflow-hidden"
          style={{
            background: checkoutLoading ? PINK_A(0.5) : `linear-gradient(135deg, ${PINK}, #e0557f)`,
            boxShadow: checkoutLoading ? 'none' : `0 0 28px rgba(204,60,105,0.45), 0 8px 24px rgba(0,0,0,0.4)`,
          }}>
          {!checkoutLoading && (
            <motion.div className="absolute inset-0 pointer-events-none"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', width: '60%' }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {checkoutLoading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Redirection vers le paiement…
              </>
            ) : 'Obtiens tes résultats maintenant 🙌'}
          </span>
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

      {/* Auth modal */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            mode="signup"
            title="Crée ton compte"
            subtitle="Pour accéder à tes résultats complets."
            onSuccess={handleAuthSuccess}
            onClose={() => setShowAuth(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

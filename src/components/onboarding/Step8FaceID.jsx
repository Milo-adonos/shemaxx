import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaceMesh } from '@mediapipe/face_mesh'

// ── Dimensions UI ────────────────────────────────────────────────────────────
const OVAL_W   = 260
const OVAL_H   = 320
const RING_PAD = 22
const RX       = OVAL_W / 2 + RING_PAD
const RY       = OVAL_H / 2 + RING_PAD
const SVG_W    = OVAL_W + RING_PAD * 2 + 16
const SVG_H    = OVAL_H + RING_PAD * 2 + 16
const SVG_CX   = SVG_W / 2
const SVG_CY   = SVG_H / 2
const DOTS     = 64

// ── Détection circulaire ─────────────────────────────────────────────────────
const SECTORS        = 8       // cercle divisé en 8 secteurs de 45°
const SECTORS_NEEDED = 7       // 7/8 pour valider
const MIN_RADIUS     = 0.038   // déplacement min du nez depuis le centre pour compter
const CALIB_FRAMES   = 30      // frames de calibration avant de tracker
const NOSE           = 1       // index landmark bout du nez
const PAUSE_GRACE    = 800     // ms avant de considérer le visage vraiment perdu

// ── Messages liés aux secteurs visités ───────────────────────────────────────
const SCAN_MESSAGES = [
  { atSectors: 0, text: 'Visage détecté — fais un cercle avec ta tête' },
  { atSectors: 2, text: 'Analyse de la structure faciale…' },
  { atSectors: 4, text: 'Mesure de la symétrie…' },
  { atSectors: 6, text: 'Calcul de l\'harmonie faciale…' },
  { atSectors: 7, text: 'Génération du rapport…' },
]

// ── Couleurs ─────────────────────────────────────────────────────────────────
const PINK   = '#cc3c69'
const GREEN  = '#34d399'
const PINK_A = (a) => `rgba(204,60,105,${a})`

export default function Step8FaceID({ onNext }) {
  const [camStatus,  setCamStatus]  = useState('idle')
  // phase: 'waiting' | 'calibrating' | 'scanning' | 'paused' | 'done'
  const [phase,      setPhase]      = useState('waiting')
  const [sectors,    setSectors]    = useState(new Array(SECTORS).fill(false))
  const [msgIndex,   setMsgIndex]   = useState(0)
  const [faceOk,     setFaceOk]     = useState(false)
  const [noseAngle,  setNoseAngle]  = useState(null) // angle courant pour le dot visuel

  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const streamRef   = useRef(null)
  const faceMeshRef = useRef(null)
  const rafRef      = useRef(null)
  const drawRafRef  = useRef(null)
  const doneRef     = useRef(false)
  const landmarksRef = useRef(null)
  const scanLineT   = useRef(0)     // temps accumulé pour la scan line

  // ── Refs de tracking (pas de re-render) ──────────────────────────────────
  const phaseRef       = useRef('waiting')
  const faceOkRef      = useRef(false)
  const calibCount     = useRef(0)
  const baseline       = useRef(null)   // {x, y} position neutre du nez
  const sectorArr      = useRef(new Array(SECTORS).fill(false))
  const lastFaceTime   = useRef(null)
  const noseAngleRef   = useRef(null)

  const setPhaseSync = (p) => { phaseRef.current = p; setPhase(p) }

  // ── Ouverture caméra ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setCamStatus('requesting')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        setCamStatus('granted')
      } catch {
        setCamStatus('denied')
      }
    }
    init()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      cancelAnimationFrame(rafRef.current)
      cancelAnimationFrame(drawRafRef.current)
      faceMeshRef.current?.close?.()
    }
  }, [])

  // ── Attache le stream à la vidéo ─────────────────────────────────────────
  useEffect(() => {
    if (camStatus !== 'granted') return
    const vid = videoRef.current
    if (!vid || !streamRef.current) return
    vid.srcObject = streamRef.current
    vid.play().catch(() => {})
  }, [camStatus])

  // ── Init FaceMesh ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (camStatus !== 'granted') return
    let active = true

    const mesh = new FaceMesh({
      locateFile: (file) => `/mediapipe/face_mesh/${file}`,
    })
    mesh.setOptions({
      maxNumFaces:            1,
      refineLandmarks:        false,
      minDetectionConfidence: 0.55,
      minTrackingConfidence:  0.55,
    })

    mesh.onResults((results) => {
      if (!active || doneRef.current) return

      const lm       = results.multiFaceLandmarks?.[0] ?? null
      const detected = !!lm
      landmarksRef.current = lm
      faceOkRef.current    = detected
      setFaceOk(detected)

      const now = Date.now()

      if (detected) {
        lastFaceTime.current = now

        // Reprend si on était en pause
        if (phaseRef.current === 'paused') {
          setPhaseSync(calibCount.current >= CALIB_FRAMES ? 'scanning' : 'calibrating')
        }

        // Lance la calibration dès la première détection
        if (phaseRef.current === 'waiting') {
          setPhaseSync('calibrating')
        }

        const nose = lm[NOSE]

        // ── Calibration : moyenne des N premières positions ──
        if (phaseRef.current === 'calibrating') {
          calibCount.current++
          if (!baseline.current) {
            baseline.current = { x: nose.x, y: nose.y, n: 1 }
          } else {
            const n = baseline.current.n + 1
            baseline.current = {
              x: (baseline.current.x * baseline.current.n + nose.x) / n,
              y: (baseline.current.y * baseline.current.n + nose.y) / n,
              n,
            }
          }
          if (calibCount.current >= CALIB_FRAMES) {
            setPhaseSync('scanning')
          }
          return
        }

        // ── Tracking circulaire ──
        if (phaseRef.current === 'scanning' && baseline.current) {
          // Inverse dx pour correspondre à la vidéo miroir
          const dx   = baseline.current.x - nose.x
          const dy   = nose.y - baseline.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          // Soustrait π/2 pour aligner atan2 avec le départ du ring (haut = -π/2)
          // → tourner à droite = dot à droite, nod bas = dot en bas, etc.
          let ang = Math.atan2(dy, dx) - Math.PI / 2
          if (ang <= -Math.PI) ang += 2 * Math.PI

          noseAngleRef.current = ang
          setNoseAngle(ang)

          if (dist > MIN_RADIUS) {
            const idx = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * SECTORS) % SECTORS
            if (!sectorArr.current[idx]) {
              const next = [...sectorArr.current]
              next[idx]  = true
              sectorArr.current = next
              setSectors(next)

              const visited = next.filter(Boolean).length

              // Met à jour le message
              const msgIdx = [...SCAN_MESSAGES]
                .reverse()
                .findIndex(m => m.atSectors <= visited)
              if (msgIdx >= 0) setMsgIndex(SCAN_MESSAGES.length - 1 - msgIdx)

              // Terminé !
              if (visited >= SECTORS_NEEDED) {
                doneRef.current = true
                setPhaseSync('done')
                streamRef.current?.getTracks().forEach(t => t.stop())
                setTimeout(onNext, 1400)
              }
            }
          }
        }

      } else {
        // Visage perdu : attend la grâce avant de mettre en pause
        if (
          (phaseRef.current === 'scanning' || phaseRef.current === 'calibrating') &&
          lastFaceTime.current &&
          now - lastFaceTime.current > PAUSE_GRACE
        ) {
          setPhaseSync('paused')
        }
      }
    })

    faceMeshRef.current = mesh

    let frameIdx = 0
    const loop = async () => {
      if (!active) return
      const vid = videoRef.current
      if (vid && vid.readyState >= 2 && vid.videoWidth > 0) {
        frameIdx++
        if (frameIdx % 2 === 0) {
          try { await faceMeshRef.current?.send({ image: vid }) } catch { /* ignore */ }
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    const waitAndStart = () => {
      const vid = videoRef.current
      if (vid && vid.readyState >= 2) { loop(); return }
      setTimeout(waitAndStart, 200)
    }
    waitAndStart()

    return () => { active = false; cancelAnimationFrame(rafRef.current) }
  }, [camStatus])

  // ── Boucle canvas : landmarks + scan line ────────────────────────────────
  useEffect(() => {
    if (camStatus !== 'granted') return
    let lastT = 0

    const drawFrame = (t) => {
      const dt = t - lastT; lastT = t
      const canvas = canvasRef.current
      if (!canvas) { drawRafRef.current = requestAnimationFrame(drawFrame); return }

      const cw  = canvas.width  = OVAL_W
      const ch  = canvas.height = OVAL_H
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, cw, ch)

      const isActive = phaseRef.current === 'scanning'
      const isPaused = phaseRef.current === 'paused'
      const alpha    = isPaused ? 0.3 : 1

      // ── Connexions FaceMesh ──
      if (landmarksRef.current) {
        const lm = landmarksRef.current
        const CONNECTIONS = [
          [10,338],[338,297],[297,332],[332,284],[284,251],[251,389],[389,356],
          [356,454],[454,323],[323,361],[361,288],[288,397],[397,365],[365,379],
          [379,378],[378,400],[400,377],[377,152],[152,148],[148,176],[176,149],
          [149,150],[150,136],[136,172],[172,58],[58,132],[132,93],[93,234],
          [234,127],[127,162],[162,21],[21,54],[54,103],[103,67],[67,109],[109,10],
          [33,7],[7,163],[163,144],[144,145],[145,153],[153,154],[154,155],[155,133],
          [133,173],[173,157],[157,158],[158,159],[159,160],[160,161],[161,246],[246,33],
          [362,382],[382,381],[381,380],[380,374],[374,373],[373,390],[390,249],[249,263],
          [263,466],[466,388],[388,387],[387,386],[386,385],[385,384],[384,398],[398,362],
          [61,146],[146,91],[91,181],[181,84],[84,17],[17,314],[314,405],[405,321],
          [321,375],[375,291],[291,61],
          [1,2],[2,98],[98,97],[97,2],[2,326],[326,327],[327,2],
        ]
        ctx.strokeStyle = `rgba(204,60,105,${0.12 * alpha})`
        ctx.lineWidth = 0.6
        CONNECTIONS.forEach(([a, b]) => {
          if (!lm[a] || !lm[b]) return
          ctx.beginPath()
          ctx.moveTo((1 - lm[a].x) * cw, lm[a].y * ch)
          ctx.lineTo((1 - lm[b].x) * cw, lm[b].y * ch)
          ctx.stroke()
        })

        const KEY = [1,10,152,33,133,362,263,61,291,17,84,70,107,336,300,234,454,127,356]
        KEY.forEach(idx => {
          if (!lm[idx]) return
          const x = (1 - lm[idx].x) * cw
          const y = lm[idx].y * ch
          const g = ctx.createRadialGradient(x, y, 0, x, y, 4)
          g.addColorStop(0, `rgba(204,60,105,${0.9 * alpha})`)
          g.addColorStop(1, `rgba(204,60,105,0)`)
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fillStyle = g
          ctx.fill()
        })

        // Nez mis en évidence
        if (lm[NOSE]) {
          const nx = (1 - lm[NOSE].x) * cw
          const ny = lm[NOSE].y * ch
          ctx.beginPath()
          ctx.arc(nx, ny, 6, 0, 2 * Math.PI)
          ctx.fillStyle = `rgba(204,60,105,${0.5 * alpha})`
          ctx.fill()
          ctx.beginPath()
          ctx.arc(nx, ny, 3, 0, 2 * Math.PI)
          ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`
          ctx.fill()
        }
      }

      // ── Scan line (seulement si actif) ──
      if (isActive) {
        scanLineT.current += dt
        const sy = ((scanLineT.current / 1800) * ch) % ch

        const grd = ctx.createLinearGradient(0, sy - 40, 0, sy + 40)
        grd.addColorStop(0,   PINK_A(0))
        grd.addColorStop(0.4, PINK_A(0.18))
        grd.addColorStop(0.5, PINK_A(0.55))
        grd.addColorStop(0.6, PINK_A(0.18))
        grd.addColorStop(1,   PINK_A(0))
        ctx.fillStyle = grd
        ctx.fillRect(0, sy - 40, cw, 80)

        ctx.beginPath()
        ctx.moveTo(0, sy); ctx.lineTo(cw, sy)
        ctx.strokeStyle = PINK_A(0.7)
        ctx.lineWidth   = 1.2
        ctx.stroke()
      }

      drawRafRef.current = requestAnimationFrame(drawFrame)
    }

    drawRafRef.current = requestAnimationFrame(drawFrame)
    return () => cancelAnimationFrame(drawRafRef.current)
  }, [camStatus])

  // ── Écrans statut caméra ──────────────────────────────────────────────────
  if (camStatus === 'idle' || camStatus === 'requesting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 text-center gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2"
          style={{ borderColor: PINK, borderTopColor: 'transparent' }} />
        <div>
          <p className="text-xl font-black text-white mb-2">Activation de la caméra</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Autorise l'accès à ta caméra pour analyser ton visage.
          </p>
        </div>
      </div>
    )
  }

  if (camStatus === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 text-center gap-5">
        <div className="text-5xl">📷</div>
        <div>
          <p className="text-xl font-black text-white mb-2">Caméra refusée</p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Active l'accès à la caméra dans les réglages puis réessaie.
          </p>
        </div>
        <button onClick={onNext} className="px-8 py-3 rounded-full text-sm font-bold text-white"
          style={{ background: PINK }}>
          Continuer sans caméra
        </button>
      </div>
    )
  }

  const isDone      = phase === 'done'
  const isScanning  = phase === 'scanning'
  const isPaused    = phase === 'paused'
  const isCalib     = phase === 'calibrating'
  const visitedCount = sectors.filter(Boolean).length
  const fillPct      = (visitedCount / SECTORS) * 100

  // Couleur de la bordure ovale
  const ovalBorder = isDone ? GREEN : isPaused ? '#ef4444' : isScanning ? PINK : 'rgba(255,255,255,0.15)'

  return (
    <div className="flex flex-col min-h-full items-center justify-between pt-6 pb-8"
      style={{ background: '#000' }}>

      {/* ── Badge ── */}
      <div className="relative z-20 flex items-center justify-center h-9">
        <AnimatePresence mode="wait">
          {isDone && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.4)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
              <span className="text-xs font-semibold" style={{ color: GREEN }}>Analyse complète</span>
            </motion.div>
          )}
          {isPaused && (
            <motion.div key="paused" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)' }}>
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.9, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-red-400">Visage perdu — analyse en pause</span>
            </motion.div>
          )}
          {isScanning && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: PINK_A(0.1), border: `1px solid ${PINK_A(0.4)}` }}>
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.7, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: PINK }} />
              <span className="text-xs font-semibold" style={{ color: PINK }}>
                Scan en cours — {visitedCount}/{SECTORS_NEEDED} secteurs
              </span>
            </motion.div>
          )}
          {(isCalib || phase === 'waiting') && (
            <motion.div key="calib" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="text-xs font-semibold text-white/40">
                {isCalib ? 'Calibration…' : faceOk ? 'Visage détecté ✓' : 'Positionne ton visage…'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Zone visage ── */}
      <div className="flex-1 flex items-center justify-center">
        <div style={{ position: 'relative', width: SVG_W, height: SVG_H }}>

          {/* Ovale caméra */}
          <motion.div
            animate={{ boxShadow: `0 0 0 2px ${ovalBorder}` }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              left: SVG_CX - OVAL_W / 2, top: SVG_CY - OVAL_H / 2,
              width: OVAL_W, height: OVAL_H,
              borderRadius: '50%', overflow: 'hidden',
              zIndex: 1, background: '#0a0a0a',
            }}
          >
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            <canvas ref={canvasRef}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

            {/* Overlay pause */}
            <AnimatePresence>
              {isPaused && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
                  <span className="text-2xl">👤</span>
                  <p className="text-xs font-bold text-red-400">Aucun visage détecté</p>
                  <p className="text-xs text-white/40 px-6 text-center">Replace-toi dans le cadre</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Coins guides Face ID */}
          {['tl','tr','bl','br'].map(pos => {
            const top  = pos.startsWith('t')
            const left = pos.endsWith('l')
            return (
              <motion.div key={pos}
                animate={{ opacity: faceOk ? 1 : 0.2 }}
                style={{
                  position: 'absolute', width: 20, height: 20, zIndex: 3,
                  top:    top  ? SVG_CY - OVAL_H / 2 - 10 : undefined,
                  bottom: !top ? SVG_H - SVG_CY - OVAL_H / 2 - 10 : undefined,
                  left:   left ? SVG_CX - OVAL_W / 2 - 10 : undefined,
                  right:  !left? SVG_W - SVG_CX - OVAL_W / 2 - 10 : undefined,
                  borderTop:    top  ? `2px solid ${PINK}` : undefined,
                  borderBottom: !top ? `2px solid ${PINK}` : undefined,
                  borderLeft:   left ? `2px solid ${PINK}` : undefined,
                  borderRight:  !left? `2px solid ${PINK}` : undefined,
                }}
              />
            )
          })}

          {/* Anneau SVG — dots allumés par secteur */}
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={RX} ry={RY}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />

            {Array.from({ length: DOTS }).map((_, i) => {
              const dotAngle   = (i / DOTS) * 2 * Math.PI - Math.PI / 2
              const dx         = RX * Math.cos(dotAngle)
              const dy         = RY * Math.sin(dotAngle)
              // Quel secteur ce dot représente-t-il ?
              const dotSector  = Math.floor((i / DOTS) * SECTORS) % SECTORS
              const sectorLit  = sectorArr.current[dotSector]

              // Dot de tête : suit l'angle actuel du nez
              const noseAng    = noseAngle
              const noseFrac   = noseAng !== null
                ? ((noseAng + Math.PI) / (2 * Math.PI))
                : -1
              const dotFrac    = i / DOTS
              const isNoseDot  = isScanning && noseAng !== null
                && Math.abs(dotFrac - noseFrac) < 0.025

              return (
                <motion.circle key={i}
                  cx={SVG_CX + dx} cy={SVG_CY + dy}
                  r={isNoseDot ? 5.5 : 2.5}
                  animate={{
                    fill: isDone
                      ? GREEN
                      : sectorLit
                        ? PINK
                        : isNoseDot
                          ? 'rgba(204,60,105,0.5)'
                          : 'rgba(255,255,255,0.08)',
                    opacity: isNoseDot ? [0.5, 1, 0.5] : 1,
                  }}
                  transition={isNoseDot
                    ? { opacity: { duration: 0.35, repeat: Infinity } }
                    : { duration: 0.15 }}
                />
              )
            })}
          </svg>

          {/* Checkmark */}
          <AnimatePresence>
            {isDone && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ position: 'absolute', inset: 0, zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.15)', border: `2px solid ${GREEN}` }}>
                  <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <motion.path d="M8 18L15 25L28 11" stroke={GREEN} strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
                  </motion.svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="relative z-20 text-center w-full px-6">
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div key="done-msg" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-2xl font-black text-white">Analyse terminée ✓</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Traitement en cours…</p>
            </motion.div>
          ) : isPaused ? (
            <motion.div key="pause-msg" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xl font-black text-white">Analyse en pause</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Replace ton visage dans le cadre pour reprendre
              </p>
            </motion.div>
          ) : isScanning ? (
            <motion.div key={`msg-${msgIndex}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <p className="text-lg font-bold text-white">{SCAN_MESSAGES[msgIndex]?.text}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Analyse faciale IA en cours</p>
            </motion.div>
          ) : (
            <motion.div key="wait-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xl font-black text-white">
                {isCalib ? 'Calibration en cours…' : faceOk ? 'Visage détecté' : 'Positionne ton visage'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {isCalib ? 'Reste immobile quelques instants' : faceOk ? 'Préparation du scan…' : 'Centre ton visage dans le cadre'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progression secteurs */}
        {(isScanning || isPaused) && !isDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: isPaused ? 0.4 : 1 }}
            className="mt-4 mx-auto w-48 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full" style={{
              background: PINK,
              width: `${fillPct}%`,
              transition: 'width 0.3s ease',
            }} />
          </motion.div>
        )}
      </div>
    </div>
  )
}

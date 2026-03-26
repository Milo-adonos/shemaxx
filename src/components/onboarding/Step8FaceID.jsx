import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaceMesh } from '@mediapipe/face_mesh'
import { captureVideoFrame } from '../../utils/analyzeWithAI'

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
const SECTORS        = 12      // cercle divisé en 12 secteurs de 30°
const SECTORS_NEEDED = 12      // tour complet obligatoire (360°)
const MIN_RADIUS     = 0.030   // déplacement min du nez (plus indulgent)
const CALIB_FRAMES   = 30      // frames de calibration avant de tracker
const NOSE           = 1       // index landmark bout du nez
const PAUSE_GRACE    = 1400    // ms avant de considérer le visage vraiment perdu (plus tolérant)

// ── Phases de positionnement (avant le scan circulaire) ──────────────────────
const HOLD_FRAMES = 70   // frames consécutives à maintenir (~2.3s à 30fps)
const POSITION_STEPS = [
  {
    key: 'front',
    label: 'Regarde droit devant',
    hint: 'Centre ton visage dans le cadre',
    icon: '👁',
    check: (nx) => nx > 0.43 && nx < 0.57,
  },
  {
    key: 'left',
    label: 'Tourne la tête à gauche',
    hint: 'Tourne lentement vers ta gauche',
    icon: '←',
    check: (nx) => nx > 0.60,
  },
  {
    key: 'right',
    label: 'Tourne la tête à droite',
    hint: 'Tourne lentement vers ta droite',
    icon: '→',
    check: (nx) => nx < 0.40,
  },
]

// ── Messages liés aux secteurs visités ───────────────────────────────────────
const SCAN_MESSAGES = [
  { atSectors: 0,  text: 'Fais un cercle complet avec ta tête' },
  { atSectors: 3,  text: 'Analyse de la structure faciale…' },
  { atSectors: 6,  text: 'Mesure de la symétrie…' },
  { atSectors: 9,  text: 'Calcul de l\'harmonie faciale…' },
  { atSectors: 11, text: 'Génération du rapport…' },
]

// ── Couleurs ─────────────────────────────────────────────────────────────────
const PINK   = '#cc3c69'
const GREEN  = '#34d399'
const PINK_A = (a) => `rgba(204,60,105,${a})`

// Messages d'erreur selon le contexte
const RETRY_REASONS = [
  'Assure-toi d\'être dans une pièce bien éclairée',
  'Évite les contre-jours (fenêtre derrière toi)',
  'Centre bien ton visage dans le cadre',
  'Fais le cercle lentement et régulièrement',
]

export default function Step8FaceID({ onNext, onRetry, age = null }) {
  const [camInitTrigger, setCamInitTrigger] = useState(0) // incrémenté pour relancer la caméra
  const [camStatus,    setCamStatus]    = useState('idle')
  // phase: 'photo' | 'waiting' | 'calibrating' | 'front' | 'left' | 'right' | 'scanning' | 'paused' | 'done' | 'error'
  const [phase,        setPhase]        = useState('photo')
  const [scanError,    setScanError]    = useState(null)
  const [sectors,      setSectors]      = useState(new Array(SECTORS).fill(false))
  const [msgIndex,     setMsgIndex]     = useState(0)
  const [faceOk,       setFaceOk]       = useState(false)
  const [noseAngle,    setNoseAngle]    = useState(null)
  const [videoReady,   setVideoReady]   = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [photoFlash,    setPhotoFlash]    = useState(false)
  const [faceTooFar,    setFaceTooFar]    = useState(false)
  const [headTilted,    setHeadTilted]    = useState(false)
  const [lookingAway,   setLookingAway]   = useState(false)
  const [gazeOff,       setGazeOff]       = useState(false)  // yeux pas dans la caméra
  const [centerHint,    setCenterHint]    = useState(null)    // 'left'|'right'|'up'|'down'|null
  // null = pas d'erreur, sinon { emoji, title, detail }
  const [photoQualError, setPhotoQualError] = useState(null)

  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const streamRef   = useRef(null)
  const faceMeshRef = useRef(null)
  const rafRef      = useRef(null)
  const drawRafRef  = useRef(null)
  const doneRef     = useRef(false)
  const landmarksRef = useRef(null)
  const scanLineT   = useRef(0)

  // ── Refs de tracking (pas de re-render) ──────────────────────────────────
  const phaseRef           = useRef('photo')
  const faceOkRef          = useRef(false)
  const calibCount         = useRef(0)
  const baseline           = useRef(null)
  const sectorArr          = useRef(new Array(SECTORS).fill(false))
  const lastFaceTime       = useRef(null)
  const noseAngleRef       = useRef(null)
  const holdCount          = useRef(0)
  const completedStepsRef  = useRef([])
  const lastActivePosPhase = useRef('front')  // phase de position active avant pause
  const frontPhotoRef      = useRef(null)     // photo capturée manuellement
  const frontLandmarksRef  = useRef(null)     // landmarks MediaPipe au moment de la photo

  const setPhaseSync = (p) => { phaseRef.current = p; setPhase(p) }

  // ── Analyse qualité d'une photo (luminosité + flou) côté client ──────────
  const checkPhotoQuality = (dataUrl) => new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const SIZE = 160
      const cv = document.createElement('canvas')
      cv.width = SIZE; cv.height = SIZE
      const ctx = cv.getContext('2d')
      ctx.drawImage(img, 0, 0, SIZE, SIZE)
      const d = ctx.getImageData(0, 0, SIZE, SIZE).data

      // ── Luminosité moyenne ──
      let bright = 0
      const px = d.length / 4
      for (let i = 0; i < d.length; i += 4)
        bright += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
      bright /= px

      // Seuils volontairement très souples — seuls les cas vraiment inutilisables bloquent
      if (bright < 8) return resolve({
        ok: false, emoji: '💡', title: 'Trop sombre',
        detail: 'Il fait vraiment trop noir. Allume une lumière devant toi.',
        tips: ['Allume une lampe devant toi', 'Mets-toi face à une fenêtre'],
      })
      if (bright > 252) return resolve({
        ok: false, emoji: '☀️', title: 'Image surexposée',
        detail: 'La photo est entièrement blanche. Éloigne-toi de la lumière.',
        tips: ['Éloigne-toi de la source lumineuse'],
      })

      // Flou — seuil très bas, on bloque uniquement les images vraiment inutilisables
      const gray = new Float32Array(SIZE * SIZE)
      for (let i = 0; i < SIZE * SIZE; i++) {
        const p = i * 4
        gray[i] = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114
      }
      let s = 0, s2 = 0, n = 0
      for (let y = 1; y < SIZE - 1; y++) {
        for (let x = 1; x < SIZE - 1; x++) {
          const lap = (
            -gray[(y-1)*SIZE+x-1] - gray[(y-1)*SIZE+x] - gray[(y-1)*SIZE+x+1]
            - gray[y*SIZE+x-1] + 8*gray[y*SIZE+x] - gray[y*SIZE+x+1]
            - gray[(y+1)*SIZE+x-1] - gray[(y+1)*SIZE+x] - gray[(y+1)*SIZE+x+1]
          )
          s += lap; s2 += lap * lap; n++
        }
      }
      const variance = s2 / n - (s / n) ** 2

      if (variance < 5) return resolve({
        ok: false, emoji: '📷', title: 'Image trop floue',
        detail: 'L\'objectif est peut-être couvert. Nettoie ta caméra.',
        tips: ['Nettoie l\'objectif de ta caméra', 'Reste immobile'],
      })

      resolve({ ok: true })
    }
    img.onerror = () => resolve({ ok: true })
    img.src = dataUrl
  })

  // ── Prise de photo manuelle (phase 'photo') ───────────────────────────────
  const capturePhoto = async () => {
    if (!videoRef.current) return
    setPhotoQualError(null)

    let dataUrl = null
    try {
      dataUrl = captureVideoFrame(videoRef.current)
      frontPhotoRef.current = dataUrl
    } catch { /* ignore */ }

    // Sauvegarde des landmarks au moment exact de la photo
    if (landmarksRef.current && landmarksRef.current.length >= 468) {
      frontLandmarksRef.current = landmarksRef.current.map(p => ({ x: p.x, y: p.y, z: p.z ?? 0 }))
    }

    // Flash visuel
    setPhotoFlash(true)
    await new Promise(r => setTimeout(r, 480))
    setPhotoFlash(false)

    // Vérification qualité
    if (dataUrl) {
      const check = await checkPhotoQuality(dataUrl)
      if (!check.ok) {
        setPhotoQualError({ emoji: check.emoji, title: check.title, detail: check.detail, tips: check.tips })
        frontPhotoRef.current = null  // annule la photo invalide
        return
      }
    }

    setCenterHint(null)
    setFaceTooFar(false)
    setGazeOff(false)
    setPhaseSync('waiting')
  }

  // ── Arrête tout et affiche l'écran d'erreur ───────────────────────────────
  const restartScan = (errorMsg) => {
    cancelAnimationFrame(rafRef.current)
    cancelAnimationFrame(drawRafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (faceMeshRef.current) { faceMeshRef.current.close?.(); faceMeshRef.current = null }
    setScanError(errorMsg || 'Une erreur est survenue pendant l\'analyse.')
    setPhaseSync('error')
  }

  // ── Retry : reset total + relance la caméra en interne ───────────────────
  const doRetry = () => {
    // Arrêt des ressources existantes
    cancelAnimationFrame(rafRef.current)
    cancelAnimationFrame(drawRafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (faceMeshRef.current) { faceMeshRef.current.close?.(); faceMeshRef.current = null }

    // Reset des refs
    doneRef.current        = false
    calibCount.current     = 0
    baseline.current       = null
    sectorArr.current      = new Array(SECTORS).fill(false)
    lastFaceTime.current   = null
    noseAngleRef.current   = null
    landmarksRef.current   = null
    holdCount.current      = 0
    completedStepsRef.current   = []
    lastActivePosPhase.current  = 'front'
    frontPhotoRef.current       = null
    frontLandmarksRef.current   = null
    phaseRef.current            = 'photo'
    faceOkRef.current           = false
    scanLineT.current           = 0

    // Reset du state UI
    setPhase('photo')
    setScanError(null)
    setSectors(new Array(SECTORS).fill(false))
    setMsgIndex(0)
    setFaceOk(false)
    setNoseAngle(null)
    setVideoReady(false)
    setHoldProgress(0)
    setCompletedSteps([])
    setPhotoFlash(false)
    setFaceTooFar(false)
    setHeadTilted(false)
    setLookingAway(false)
    setGazeOff(false)
    setCenterHint(null)
    setCamStatus('idle')

    // Déclenche la réinitialisation de la caméra
    setCamInitTrigger(t => t + 1)
  }

  // ── Ouverture caméra ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setCamStatus('requesting')
      // Petit délai au retry pour laisser le hardware se libérer
      if (camInitTrigger > 0) {
        await new Promise(r => setTimeout(r, 450))
      }
      if (cancelled) return
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camInitTrigger])

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
      refineLandmarks:        true,   // active les iris (landmarks 468-477)
      minDetectionConfidence: 0.45,
      minTrackingConfidence:  0.45,
    })

    mesh.onResults((results) => {
      if (!active || doneRef.current) return

      const lm       = results.multiFaceLandmarks?.[0] ?? null
      const detected = !!lm
      landmarksRef.current = lm
      faceOkRef.current    = detected
      setFaceOk(detected)

      const now = Date.now()
      const posPhases = ['front', 'left', 'right']

      if (detected) {
        lastFaceTime.current = now

        // Reprend si on était en pause
        if (phaseRef.current === 'paused') {
          const resumeTo = lastActivePosPhase.current
          setPhaseSync(calibCount.current >= CALIB_FRAMES ? resumeTo : 'calibrating')
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
            setPhaseSync('front')
            lastActivePosPhase.current = 'front'
          }
          return
        }

        // ── Phases de positionnement (front → left → right) ──
        if (posPhases.includes(phaseRef.current)) {
          lastActivePosPhase.current = phaseRef.current

          // ── Vérifications qualité (uniquement phase front) ─────────────────
          const faceHeight  = lm[152] && lm[10] ? Math.abs(lm[152].y - lm[10].y) : 0
          const faceTooSmall = faceHeight < 0.22

          // Roll : angle d'inclinaison de la tête (gauche/droite)
          // lm[33] = coin externe oeil gauche, lm[263] = coin externe oeil droit
          // On utilise les coordonnées brutes (sans miroir) pour ce calcul angulaire
          let tiltDeg = 0
          if (lm[33] && lm[263]) {
            const dx = lm[263].x - lm[33].x  // toujours positif pour un visage normal
            const dy = lm[263].y - lm[33].y  // ≈ 0 si tête droite
            tiltDeg  = Math.atan2(dy, dx) * (180 / Math.PI)
          }
          const isTilted = Math.abs(tiltDeg) > 12  // tolérance ±12°

          // Pitch : nez trop haut ou trop bas par rapport aux yeux
          // On vérifie juste que le nez est SOUS le milieu des yeux (regard frontal)
          let isLookingAway = false
          if (lm[1] && lm[33] && lm[263]) {
            const eyeMidY  = (lm[33].y + lm[263].y) / 2
            const eyeWidth = Math.abs(lm[263].x - lm[33].x) || 0.1
            const ratio    = (lm[1].y - eyeMidY) / eyeWidth
            // ratio ≈ 0.4–1.2 pour un visage frontal normal
            isLookingAway  = ratio < 0.2 || ratio > 1.6
          }

          // ── Centrage dans l'ovale ──────────────────────────────────────────
          const noseX = 1 - nose.x  // miroir horizontal
          const noseY = nose.y

          // Horizontal : nez entre 40% et 60%
          let hintH = null
          if      (noseX < 0.40) hintH = 'right'
          else if (noseX > 0.60) hintH = 'left'

          // Vertical : nez entre 38% et 68%
          let hintV = null
          if      (noseY < 0.38) hintV = 'down'
          else if (noseY > 0.68) hintV = 'up'

          const newHint = hintH || hintV || null

          // ── Détection regard par iris (refineLandmarks=true → lm[468] et lm[473]) ──
          // lm[468] = iris gauche centre, lm[473] = iris droit centre
          // lm[33]  = coin ext œil gauche, lm[133] = coin int œil gauche
          // lm[362] = coin int œil droit,  lm[263] = coin ext œil droit
          let isGazeOff = false
          const irisL = lm[468], irisR = lm[473]
          if (irisL && irisR && lm[33] && lm[133] && lm[362] && lm[263]) {
            // Ratio horizontal de l'iris dans l'œil : 0 = côté externe, 1 = côté nez
            // Pour regarder droit : ratio ≈ 0.35–0.65
            const eyeWidthL  = Math.abs(lm[133].x - lm[33].x)  || 0.01
            const eyeWidthR  = Math.abs(lm[263].x - lm[362].x) || 0.01
            const gazeRatioL = (irisL.x - lm[33].x)  / eyeWidthL
            const gazeRatioR = (irisR.x - lm[362].x) / eyeWidthR
            const avgGaze    = (gazeRatioL + gazeRatioR) / 2
            // Hors tolérance = regard décalé sur le côté
            isGazeOff = avgGaze < 0.25 || avgGaze > 0.75
          }

          // Phase photo ET front : mise à jour des hints visuels
          if (phaseRef.current === 'photo' || phaseRef.current === 'front') {
            setFaceTooFar(faceTooSmall)
            setHeadTilted(isTilted)
            setLookingAway(isLookingAway)
            setGazeOff(isGazeOff)
            setCenterHint(newHint)
          }

          // Phase photo : ne pas auto-avancer, attendre le bouton déclencheur
          if (phaseRef.current === 'photo') return

          const stepDef = POSITION_STEPS.find(s => s.key === phaseRef.current)

          const isCenteredX = noseX >= 0.38 && noseX <= 0.62
          const isCenteredY = noseY >= 0.35 && noseY <= 0.72
          const sizeOk = phaseRef.current === 'front'
            ? (faceHeight >= 0.18 && faceHeight <= 0.85 && isCenteredX && isCenteredY && !isGazeOff)
            : true

          if (stepDef && (phaseRef.current !== 'front' ? stepDef.check(nose.x) : isCenteredX) && sizeOk) {
            holdCount.current++
            const pct = Math.min(100, Math.round((holdCount.current / HOLD_FRAMES) * 100))
            setHoldProgress(pct)

            if (holdCount.current >= HOLD_FRAMES) {
              holdCount.current = 0
              setHoldProgress(0)
              const stepIdx = POSITION_STEPS.findIndex(s => s.key === phaseRef.current)

              // Photo déjà prise manuellement en phase 'photo' — pas de re-capture ici

              const newCompleted = [...completedStepsRef.current, phaseRef.current]
              completedStepsRef.current = newCompleted
              setCompletedSteps(newCompleted)

              if (stepIdx < POSITION_STEPS.length - 1) {
                const nextStep = POSITION_STEPS[stepIdx + 1].key
                setPhaseSync(nextStep)
                lastActivePosPhase.current = nextStep
              } else {
                // Toutes les positions validées → scan circulaire
                setPhaseSync('scanning')
                lastActivePosPhase.current = 'scanning'
              }
            }
          } else {
            // Position incorrecte : décrémente lentement
            holdCount.current = Math.max(0, holdCount.current - 1)
            setHoldProgress(Math.min(100, Math.round((holdCount.current / HOLD_FRAMES) * 100)))
          }
          return
        }

        // ── Tracking circulaire ──
        if (phaseRef.current === 'scanning' && baseline.current) {
          // Inverse dx pour correspondre à la vidéo miroir
          const dx   = baseline.current.x - nose.x
          const dy   = nose.y - baseline.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
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

              const msgIdx = [...SCAN_MESSAGES]
                .reverse()
                .findIndex(m => m.atSectors <= visited)
              if (msgIdx >= 0) setMsgIndex(SCAN_MESSAGES.length - 1 - msgIdx)

              if (visited >= SECTORS_NEEDED) {
                doneRef.current = true
                setPhaseSync('done')

                // Copie des landmarks au moment du succès (avant arrêt caméra / perte de détection)
                const landmarksSnapshot =
                  lm && lm.length >= 468
                    ? lm.map((p) => ({ x: p.x, y: p.y, z: p.z ?? 0 }))
                    : null

                let imageDataUrl = null
                try {
                  imageDataUrl = captureVideoFrame(videoRef.current)
                } catch { /* ignore */ }

                streamRef.current?.getTracks().forEach(t => t.stop())

                // Avance après 2s max — l'appel IA se fait dans Step9AnalyzingIA
                setTimeout(() => {
                  onNext({
                    photoUrl:       frontPhotoRef.current,
                    photoLandmarks: frontLandmarksRef.current,
                    analysisData:   { imageDataUrl, landmarksSnapshot },
                  })
                }, 2000)
              }
            }
          }
        }

      } else {
        // Visage perdu : attend la grâce avant de mettre en pause
        const pausablePhases = ['scanning', 'calibrating', 'front', 'left', 'right']
        if (
          pausablePhases.includes(phaseRef.current) &&
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
  const isPosPhase  = ['front', 'left', 'right'].includes(phase)
  const currentPosStep = POSITION_STEPS.find(s => s.key === phase)
  const visitedCount = sectors.filter(Boolean).length
  const fillPct      = (visitedCount / SECTORS) * 100

  // Couleur de la bordure ovale
  const ovalBorder = isDone
    ? GREEN
    : isPaused
    ? '#ef4444'
    : (isScanning || isPosPhase)
    ? PINK
    : 'rgba(255,255,255,0.15)'

  // ── Écran erreur + retry ─────────────────────────────────────────────────
  // ── Écran phase PHOTO ────────────────────────────────────────────────────
  if (phase === 'photo') {
    const photoReady = faceOk && !centerHint && !gazeOff && !faceTooFar
    return (
      <div className="flex flex-col min-h-full items-center justify-between pt-6 pb-8"
        style={{ background: '#000' }}>

        {/* Header */}
        <div className="w-full px-5 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: PINK_A(0.12), border: `1px solid ${PINK_A(0.35)}` }}>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: PINK }}>
              Étape 1 sur 2
            </span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-black text-white leading-tight mb-2">
            Prends-toi en photo
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sm leading-relaxed px-4"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Centre ton visage dans le cercle,<br />
            regarde droit dans la caméra, puis appuie sur le bouton.
          </motion.p>
        </div>

        {/* Zone caméra */}
        <div className="flex-1 flex items-center justify-center">
          <div style={{ position: 'relative', width: SVG_W, height: SVG_H }}>

            {/* Anneau de statut */}
            <motion.div
              animate={{ boxShadow: photoReady
                ? `0 0 0 3px ${GREEN}, 0 0 20px ${GREEN}55`
                : `0 0 0 2px ${PINK_A(0.5)}` }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: SVG_CX - OVAL_W / 2, top: SVG_CY - OVAL_H / 2,
                width: OVAL_W, height: OVAL_H,
                borderRadius: '50%', overflow: 'hidden',
                zIndex: 1, background: '#0a0a0a',
              }}>
              <video ref={videoRef} autoPlay playsInline muted
                onLoadedData={() => setVideoReady(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />

              {/* Flash */}
              <AnimatePresence>
                {photoFlash && (
                  <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: '#fff', zIndex: 10 }} />
                )}
              </AnimatePresence>

              {/* Chargement vidéo */}
              <AnimatePresence>
                {!videoReady && (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    style={{ background: '#0a0a0a' }}>
                    <motion.div animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 rounded-full"
                      style={{ border: `2px solid ${PINK_A(0.3)}`, borderTopColor: PINK }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Flèches de guidage centrage */}
              <AnimatePresence>
                {centerHint && !photoFlash && (
                  <motion.div key={centerHint}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute pointer-events-none flex items-center justify-center"
                    style={{
                      ...(centerHint === 'up'    && { bottom: 14, left: '50%', transform: 'translateX(-50%)' }),
                      ...(centerHint === 'down'  && { top: 14,    left: '50%', transform: 'translateX(-50%)' }),
                      ...(centerHint === 'left'  && { right: 14,  top:  '50%', transform: 'translateY(-50%)' }),
                      ...(centerHint === 'right' && { left: 14,   top:  '50%', transform: 'translateY(-50%)' }),
                      width: 32, height: 32, borderRadius: '50%', zIndex: 8,
                      background: 'rgba(204,60,105,0.3)',
                      border: '1.5px solid rgba(204,60,105,0.7)',
                    }}>
                    <motion.span
                      animate={{ x: centerHint === 'left' ? [-2,2,-2] : centerHint === 'right' ? [2,-2,2] : 0,
                                 y: centerHint === 'up'   ? [-2,2,-2] : centerHint === 'down'  ? [2,-2,2] : 0 }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      style={{ fontSize: 14, color: '#ff4d88' }}>
                      {centerHint === 'up' ? '↑' : centerHint === 'down' ? '↓' : centerHint === 'left' ? '←' : '→'}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Coins guides */}
            {['tl','tr','bl','br'].map(pos => {
              const top  = pos.startsWith('t')
              const left = pos.endsWith('l')
              return (
                <motion.div key={pos}
                  animate={{ opacity: photoReady ? 1 : 0.3, borderColor: photoReady ? GREEN : PINK }}
                  style={{
                    position: 'absolute', width: 20, height: 20, zIndex: 3,
                    top:    top  ? SVG_CY - OVAL_H / 2 - 10 : undefined,
                    bottom: !top ? SVG_H - SVG_CY - OVAL_H / 2 - 10 : undefined,
                    left:   left ? SVG_CX - OVAL_W / 2 - 10 : undefined,
                    right:  !left? SVG_W - SVG_CX - OVAL_W / 2 - 10 : undefined,
                    borderTop:    top  ? '2px solid' : undefined,
                    borderBottom: !top ? '2px solid' : undefined,
                    borderLeft:   left ? '2px solid' : undefined,
                    borderRight:  !left? '2px solid' : undefined,
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Badge état + bouton déclencheur */}
        <div className="w-full px-6 flex flex-col items-center gap-4">

          {/* Message d'état */}
          <AnimatePresence mode="wait">
            <motion.div key={faceTooFar ? 'far' : gazeOff ? 'gaze' : centerHint ?? 'ok'}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: photoReady ? 'rgba(52,211,153,0.1)' : PINK_A(0.08),
                border: `1px solid ${photoReady ? 'rgba(52,211,153,0.4)' : PINK_A(0.3)}`,
              }}>
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: photoReady ? GREEN : PINK }} />
              <span className="text-xs font-semibold"
                style={{ color: photoReady ? GREEN : PINK }}>
                {!faceOk
                  ? 'Place ton visage dans le cercle'
                  : faceTooFar
                  ? 'Rapproche-toi de la caméra 📷'
                  : centerHint === 'left'  ? 'Décale-toi vers la gauche ←'
                  : centerHint === 'right' ? 'Décale-toi vers la droite →'
                  : centerHint === 'up'    ? 'Remonte ton visage ↑'
                  : centerHint === 'down'  ? 'Descends ton visage ↓'
                  : gazeOff
                  ? 'Regarde directement dans la caméra 👁'
                  : '✓ Parfait ! Appuie sur le bouton'}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Bouton déclencheur */}
          <motion.button
            onClick={capturePhoto}
            disabled={!faceOk || !!photoFlash}
            whileTap={{ scale: 0.93 }}
            animate={{ opacity: faceOk ? 1 : 0.35 }}
            className="relative flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72,
              background: photoReady
                ? `radial-gradient(circle, ${GREEN}, #059669)`
                : `radial-gradient(circle, ${PINK}, #991f45)`,
              boxShadow: photoReady
                ? `0 0 28px ${GREEN}88, 0 0 0 4px rgba(52,211,153,0.2)`
                : `0 0 28px ${PINK_A(0.6)}, 0 0 0 4px ${PINK_A(0.15)}`,
              transition: 'background 0.3s, box-shadow 0.3s',
            }}>
            {/* Anneau extérieur */}
            <div className="absolute rounded-full pointer-events-none"
              style={{ inset: -6, border: `2px solid ${photoReady ? GREEN : PINK}44`, borderRadius: '50%' }} />
            {/* Icône */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </motion.button>

          <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Cette photo reste sur ton appareil — elle n'est jamais partagée
          </p>
        </div>

        {/* Erreur qualité photo */}
        <AnimatePresence>
          {photoQualError && (
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-10 px-6"
              style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)' }}
            >
              <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
                {/* Icône */}
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.35)' }}>
                  {photoQualError.emoji}
                </div>

                <div>
                  <p className="text-xl font-black text-white mb-2">{photoQualError.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {photoQualError.detail}
                  </p>
                </div>

                {/* Conseils */}
                <div className="w-full rounded-2xl px-4 py-3 space-y-2 text-left"
                  style={{ background: 'rgba(204,60,105,0.07)', border: '1px solid rgba(204,60,105,0.2)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: 'rgba(204,60,105,0.7)' }}>Comment corriger</p>
                  {photoQualError.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span style={{ color: PINK, fontSize: 10, marginTop: 2 }}>›</span>
                      <span className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>{tip}</span>
                    </div>
                  ))}
                </div>

                {/* Bouton retry */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setPhotoQualError(null)}
                  className="w-full py-4 rounded-2xl font-black text-base text-white"
                  style={{ background: 'linear-gradient(135deg, #cc3c69, #e8608a)',
                    boxShadow: '0 0 24px rgba(204,60,105,0.45)' }}>
                  📸 Réessayer la photo
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col min-h-full items-center justify-center gap-7 px-8 text-center"
        style={{ background: '#000' }}>

        {/* Icône */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.4)' }}>
          📸
        </motion.div>

        <div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="text-xl font-black text-white mb-3">
            Analyse impossible
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm leading-relaxed mb-6"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            {scanError}
          </motion.p>
        </div>

        {/* Conseils */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="w-full max-w-xs rounded-2xl p-4 space-y-2.5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(255,255,255,0.3)' }}>Pour une meilleure analyse</p>
          {RETRY_REASONS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span style={{ color: PINK, fontSize: 10, marginTop: 2 }}>✦</span>
              <span className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{tip}</span>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 180 }}
          whileTap={{ scale: 0.97 }}
          onClick={doRetry}
          className="w-full max-w-xs py-4 rounded-2xl font-black text-base text-white"
          style={{
            background: 'linear-gradient(135deg, #cc3c69, #e8608a)',
            boxShadow: '0 0 28px rgba(204,60,105,0.45), 0 8px 24px rgba(0,0,0,0.4)',
          }}>
          Refaire l'analyse →
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full items-center justify-between pt-4 pb-8"
      style={{ background: '#000' }}>

      {/* ── Indicateur d'étapes ── */}
      <div className="relative z-20 w-full px-6">
        {/* Étapes de positionnement + cercle */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {POSITION_STEPS.map((step, i) => {
            const done    = completedSteps.includes(step.key)
            const active  = phase === step.key
            const pending = !done && !active
            return (
              <div key={step.key} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    background: done ? GREEN : active ? PINK : 'rgba(255,255,255,0.08)',
                    scale: active ? 1.1 : 1,
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ border: `1px solid ${done ? GREEN : active ? PINK : 'rgba(255,255,255,0.1)'}` }}>
                  <span className="text-xs font-bold" style={{ color: done ? '#000' : active ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                    {done ? '✓' : `${i + 1}`}
                  </span>
                  {active && (
                    <span className="text-xs font-semibold text-white hidden sm:inline">
                      {step.label.split(' ').slice(-1)[0]}
                    </span>
                  )}
                </motion.div>
                {i < POSITION_STEPS.length - 1 && (
                  <div className="w-4 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            )
          })}
          {/* Étape cercle */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <motion.div
              animate={{
                background: isDone ? GREEN : isScanning ? PINK : 'rgba(255,255,255,0.08)',
                scale: isScanning ? 1.1 : 1,
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ border: `1px solid ${isDone ? GREEN : isScanning ? PINK : 'rgba(255,255,255,0.1)'}` }}>
              <span className="text-xs font-bold"
                style={{ color: isDone ? '#000' : isScanning ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                {isDone ? '✓' : '↻'}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Badge statut */}
        <div className="flex items-center justify-center h-7">
          <AnimatePresence mode="wait">
            {isDone && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.4)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                <span className="text-xs font-semibold" style={{ color: GREEN }}>Analyse complète</span>
              </motion.div>
            )}
            {isPaused && (
              <motion.div key="paused" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)' }}>
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.9, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-xs font-semibold text-red-400">Visage perdu — reprends ta position</span>
              </motion.div>
            )}
            {isScanning && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: PINK_A(0.1), border: `1px solid ${PINK_A(0.4)}` }}>
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.7, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full" style={{ background: PINK }} />
                <span className="text-xs font-semibold" style={{ color: PINK }}>
                  Scan circulaire — {visitedCount}/{SECTORS_NEEDED}
                </span>
              </motion.div>
            )}
            {isPosPhase && (
              <motion.div key={`pos-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  background: phase === 'front' && holdProgress > 60
                    ? 'rgba(255,255,255,0.1)' : PINK_A(0.08),
                  border: `1px solid ${phase === 'front' && holdProgress > 60 ? 'rgba(255,255,255,0.3)' : PINK_A(0.3)}`,
                }}>
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: phase === 'front' && holdProgress > 60 ? '#fff' : PINK }} />
                <span className="text-xs font-semibold"
                  style={{ color: phase === 'front' && holdProgress > 60 ? '#fff' : PINK }}>
                  {phase === 'front' && faceTooFar
                    ? 'Rapproche-toi de la caméra 📷'
                    : phase === 'front' && centerHint === 'left'
                    ? 'Décale-toi vers la gauche ←'
                    : phase === 'front' && centerHint === 'right'
                    ? 'Décale-toi vers la droite →'
                    : phase === 'front' && centerHint === 'up'
                    ? 'Remonte ton visage ↑'
                    : phase === 'front' && centerHint === 'down'
                    ? 'Descends ton visage ↓'
                    : phase === 'front' && gazeOff
                    ? 'Regarde directement dans la caméra 👁'
                    : phase === 'front' && holdProgress > 60
                    ? '📸 Ne bouge plus…'
                    : faceOk
                    ? 'Maintiens la position…'
                    : 'Positionne ton visage'}
                </span>
              </motion.div>
            )}
            {(isCalib || phase === 'waiting') && (
              <motion.div key="calib" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
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
              onLoadedData={() => setVideoReady(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            <canvas ref={canvasRef}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

            {/* Overlay chargement vidéo */}
            <AnimatePresence>
              {!videoReady && (
                <motion.div
                  initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: '#0a0a0a' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 rounded-full"
                    style={{ border: `2px solid ${PINK_A(0.3)}`, borderTopColor: PINK }}
                  />
                  <span className="text-xs font-semibold" style={{ color: PINK_A(0.6) }}>
                    Activation caméra…
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flèche de guidage centrage */}
            <AnimatePresence>
              {phase === 'front' && centerHint && !photoFlash && (
                <motion.div
                  key={centerHint}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    ...(centerHint === 'up'    && { bottom: 12, left: '50%', transform: 'translateX(-50%)' }),
                    ...(centerHint === 'down'  && { top: 12,    left: '50%', transform: 'translateX(-50%)' }),
                    ...(centerHint === 'left'  && { right: 12,  top:  '50%', transform: 'translateY(-50%)' }),
                    ...(centerHint === 'right' && { left: 12,   top:  '50%', transform: 'translateY(-50%)' }),
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: 'rgba(204,60,105,0.3)',
                    border: '1.5px solid rgba(204,60,105,0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 8,
                  }}>
                  <motion.span
                    animate={{ x: centerHint === 'left' ? [-2,2,-2] : centerHint === 'right' ? [2,-2,2] : 0,
                               y: centerHint === 'up'   ? [-2,2,-2] : centerHint === 'down'  ? [2,-2,2] : 0 }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                    style={{ fontSize: 14, color: '#ff4d88' }}>
                    {centerHint === 'up' ? '↑' : centerHint === 'down' ? '↓' : centerHint === 'left' ? '←' : '→'}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flash photo */}
            <AnimatePresence>
              {photoFlash && (
                <motion.div
                  initial={{ opacity: 0.9 }} animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: '#fff', zIndex: 10 }}
                />
              )}
            </AnimatePresence>

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

      {/* ── Messages + progression ── */}
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
          ) : isPosPhase && currentPosStep ? (
            <motion.div key={`pos-msg-${phase}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Flèche directionnelle */}
              <motion.div
                animate={{ x: phase === 'left' ? [-4, 4, -4] : phase === 'right' ? [4, -4, 4] : [0, 0, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-3xl mb-2">
                {phase === 'left' ? '←' : phase === 'right' ? '→' : '⊙'}
              </motion.div>
              <p className="text-xl font-black text-white">{currentPosStep.label}</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {faceOk ? currentPosStep.hint : 'Centre ton visage dans le cadre'}
              </p>
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

        {/* Barre de progression maintien position */}
        {isPosPhase && faceOk && !isDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 mx-auto w-48 h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full rounded-full"
              animate={{ width: `${holdProgress}%` }}
              transition={{ duration: 0.1 }}
              style={{ background: `linear-gradient(90deg, ${PINK}, #e8608a)` }} />
          </motion.div>
        )}

        {/* Progression secteurs (scan circulaire) */}
        {(isScanning || (isPaused && lastActivePosPhase.current === 'scanning')) && !isDone && (
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

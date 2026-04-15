import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useT } from '../../contexts/LangContext'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

// ── Vérification qualité image ────────────────────────────────────────────────
function checkImageQuality(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 800
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h).data

      // Luminosité moyenne
      let brightness = 0
      for (let i = 0; i < data.length; i += 4)
        brightness += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      brightness /= data.length / 4

      // Netteté (variance Laplacien)
      const gray = []
      for (let i = 0; i < data.length; i += 4)
        gray.push(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
      let laplacian = 0, cnt = 0
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x
          laplacian += Math.abs(
            -gray[idx - w - 1] - gray[idx - w] - gray[idx - w + 1]
            - gray[idx - 1] + 8 * gray[idx] - gray[idx + 1]
            - gray[idx + w - 1] - gray[idx + w] - gray[idx + w + 1]
          )
          cnt++
        }
      }
      laplacian /= cnt
      resolve({ brightness, sharpness: laplacian })
    }
    img.onerror = () => resolve({ brightness: 100, sharpness: 10 })
    img.src = dataUrl
  })
}

// ── Illustration visage de face (SVG femme) ───────────────────────────────────
function FrontFaceIllustration() {
  return (
    <svg viewBox="0 0 200 260" width="160" height="210" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cou */}
      <path d="M84 195 Q84 215 70 240 L130 240 Q116 215 116 195Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      {/* Visage */}
      <ellipse cx="100" cy="115" rx="62" ry="78" fill="rgba(255,255,255,0.05)" stroke={PINK_A(0.5)} strokeWidth="1.5"/>
      {/* Cheveux (longs) */}
      <path d="M38 100 Q32 60 52 35 Q70 12 100 10 Q130 12 148 35 Q168 60 162 100 Q155 70 148 55 Q130 28 100 26 Q70 28 52 55 Q45 70 38 100Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <path d="M38 100 Q30 130 32 160 Q34 155 36 145 Q38 160 40 175" stroke="rgba(255,255,255,0.07)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M162 100 Q170 130 168 160 Q166 155 164 145 Q162 160 160 175" stroke="rgba(255,255,255,0.07)" strokeWidth="8" strokeLinecap="round"/>
      {/* Sourcils */}
      <path d="M72 97 Q80 93 90 95" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M110 95 Q120 93 128 97" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Yeux */}
      <ellipse cx="83" cy="108" rx="10" ry="6" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
      <circle cx="83" cy="108" r="3.5" fill="rgba(255,255,255,0.2)"/>
      <ellipse cx="117" cy="108" rx="10" ry="6" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
      <circle cx="117" cy="108" r="3.5" fill="rgba(255,255,255,0.2)"/>
      {/* Nez */}
      <path d="M100 112 L97 135 Q100 138 103 135 L100 112Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Bouche */}
      <path d="M88 152 Q100 160 112 152" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M88 152 Q100 150 112 152" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"/>
      {/* Oreilles */}
      <ellipse cx="38" cy="120" rx="6" ry="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <ellipse cx="162" cy="120" rx="6" ry="9" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      {/* Indice "FACE" */}
      <text x="100" y="250" textAnchor="middle" fill={PINK_A(0.6)} fontSize="10" fontWeight="700" letterSpacing="3">FACE</text>
    </svg>
  )
}

// ── Illustration profil de côté (SVG femme) ───────────────────────────────────
function SideFaceIllustration() {
  return (
    <svg viewBox="0 0 200 260" width="160" height="210" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cou */}
      <path d="M85 195 Q80 215 72 240 L110 240 Q108 215 105 195Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      {/* Visage profil */}
      <path d="M145 60 Q155 80 158 110 Q160 140 150 165 Q138 190 120 195 Q100 198 85 195 L85 160 Q95 165 105 158 Q115 148 118 135 Q122 120 118 105 Q112 88 100 80 Q90 72 85 65 Q95 40 115 35 Q135 38 145 60Z"
        fill="rgba(255,255,255,0.05)" stroke={PINK_A(0.5)} strokeWidth="1.5"/>
      {/* Cheveux arrière */}
      <path d="M85 65 Q65 55 52 80 Q42 105 45 140 Q48 165 60 185 Q70 200 85 195"
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      {/* Oeil */}
      <ellipse cx="132" cy="100" rx="8" ry="5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
      <circle cx="132" cy="100" r="2.5" fill="rgba(255,255,255,0.2)"/>
      {/* Sourcil */}
      <path d="M122 88 Q132 84 142 88" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Nez */}
      <path d="M152 120 Q160 130 155 140 Q150 145 145 143" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Bouche */}
      <path d="M135 160 Q142 162 148 158" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Oreille */}
      <ellipse cx="88" cy="118" rx="5" ry="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      {/* Indice */}
      <text x="100" y="250" textAnchor="middle" fill={PINK_A(0.6)} fontSize="10" fontWeight="700" letterSpacing="3">PROFIL</text>
    </svg>
  )
}

// ── Flow d'upload photos ──────────────────────────────────────────────────────
function UploadFlow({ onDone, onBack }) {
  const [uploadStep, setUploadStep] = useState(0)  // 0 = face, 1 = profil
  const [frontPhoto, setFrontPhoto] = useState(null)
  const [sidePhoto,  setSidePhoto]  = useState(null)
  const [error,      setError]      = useState(null)
  const [checking,   setChecking]   = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // reset input pour permettre re-sélection du même fichier
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result

      if (uploadStep === 0) {
        setChecking(true)
        const { brightness, sharpness } = await checkImageQuality(dataUrl)
        setChecking(false)

        if (brightness < 25) {
          setError({ title: 'Photo trop sombre 💡', detail: 'Place-toi face à une lumière. La photo doit être bien éclairée.' })
          return
        }
        if (sharpness < 1.5) {
          setError({ title: 'Photo trop floue 📷', detail: 'Nettoie ton objectif et assure-toi que la photo soit nette.' })
          return
        }
        setError(null)
        setFrontPhoto(dataUrl)
        setUploadStep(1)
      } else {
        setError(null)
        setSidePhoto(dataUrl)
        onDone(frontPhoto, dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const steps = [
    {
      title:       'Photo de face',
      hint:        'Regarde droit devant, visage centré, bonne lumière',
      illustration: <FrontFaceIllustration />,
      photo:       frontPhoto,
    },
    {
      title:       'Photo de profil',
      hint:        'Tourne-toi sur le côté gauche ou droit',
      illustration: <SideFaceIllustration />,
      photo:       sidePhoto,
    },
  ]
  const cur = steps[uploadStep]

  return (
    <div className="flex flex-col min-h-full px-5 pt-6 pb-8" style={{ background: '#050508' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div className="flex gap-2 flex-1">
          {steps.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all"
              style={{ background: i <= uploadStep ? PINK : 'rgba(255,255,255,0.12)' }} />
          ))}
        </div>
      </div>

      {/* Titre */}
      <AnimatePresence mode="wait">
        <motion.div key={uploadStep}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-4">
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: PINK_A(0.7) }}>
            {uploadStep + 1} / {steps.length}
          </p>
          <h1 className="text-3xl font-black text-white">{cur.title}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>{cur.hint}</p>
        </motion.div>
      </AnimatePresence>

      {/* Zone photo */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <AnimatePresence mode="wait">
          <motion.div key={uploadStep + (cur.photo ? '-filled' : '-empty')}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-56 rounded-3xl overflow-hidden flex items-center justify-center"
            style={{
              height: 280,
              background: cur.photo ? 'transparent' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${cur.photo ? PINK_A(0.4) : 'rgba(255,255,255,0.08)'}`,
              boxShadow: cur.photo ? `0 0 30px ${PINK_A(0.2)}` : 'none',
            }}>
            {cur.photo ? (
              <img src={cur.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : cur.illustration}

            {/* Overlay coins décoratifs */}
            {!cur.photo && (
              <>
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: PINK_A(0.5) }} />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: PINK_A(0.5) }} />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: PINK_A(0.5) }} />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: PINK_A(0.5) }} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Erreur */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: '#f87171' }}>{error.title}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{error.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton upload */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
      <motion.button
        onClick={() => { setError(null); fileInputRef.current?.click() }}
        disabled={checking}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-full font-black text-base flex items-center justify-center gap-2"
        style={{
          background: checking ? PINK_A(0.5) : `linear-gradient(135deg, ${PINK}, #e0557f)`,
          color: '#fff',
          boxShadow: checking ? 'none' : `0 0 28px ${PINK_A(0.4)}`,
        }}>
        {checking ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Vérification…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Upload ou prend un selfie
          </>
        )}
      </motion.button>

      <p className="text-[10px] text-center mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
        🔒 Tes photos ne sont jamais stockées ni partagées
      </p>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Step8Photos({ onNext, onNextUpload }) {
  const t = useT()
  const titleLines = t.step8Photos.title.split('\n')
  const [uploadMode, setUploadMode] = useState(false)

  if (uploadMode) {
    return (
      <UploadFlow
        onBack={() => setUploadMode(false)}
        onDone={(frontUrl, sideUrl) => {
          // Utilise la photo de face comme image d'analyse principale
          onNextUpload({
            photoUrl:       frontUrl,
            photoLandmarks: null,
            analysisData:   { imageDataUrl: frontUrl, landmarksSnapshot: null },
          })
        }}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-full px-6 pt-8 pb-8">

      {/* ── Titre ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
          {titleLines[0]}<br />{titleLines[1]}
        </h1>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Notre IA va scanner ton visage en temps réel.<br />
          Tu suivras d'abord des positions de tête, puis un mouvement circulaire.
        </p>
      </motion.div>

      {/* ── Illustration cercle ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-center mb-8"
      >
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="90" cy="90" r="70" fill="none" stroke={PINK_A(0.12)} strokeWidth="2" strokeDasharray="8 5"/>
            <motion.circle cx="90" cy="90" r="70" fill="none" stroke={PINK} strokeWidth="2.5"
              strokeLinecap="round" strokeDasharray="440"
              initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 0.4, duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
            />
            <motion.g animate={{ rotate: 360 }}
              transition={{ delay: 0.4, duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
              style={{ transformOrigin: '90px 90px' }}>
              <circle cx="90" cy="20" r="7" fill={PINK} />
              <polygon points="90,12 94,22 86,22" fill="white" />
            </motion.g>
          </svg>
          <div className="absolute flex flex-col items-center justify-center rounded-full"
            style={{ inset: '35px', background: PINK_A(0.1), border: `1.5px solid ${PINK_A(0.3)}` }}>
            <span style={{ fontSize: 28 }}>👤</span>
          </div>
        </div>
      </motion.div>

      {/* ── Instructions ── */}
      <div className="flex flex-col gap-3 mb-8">
        {t.step8Photos.instructions.map((instr, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
            className="flex items-start gap-4 px-4 py-3.5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
              style={{ background: PINK_A(0.15), border: `1.5px solid ${PINK_A(0.4)}`, color: PINK }}>
              {i + 1}
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{instr.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>{instr.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Note ── */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
        className="text-xs text-center leading-relaxed mb-6 px-2"
        style={{ color: 'rgba(255,255,255,0.25)' }}>
        {t.step8Photos.privacy}
      </motion.p>

      {/* ── CTA principal ── */}
      <motion.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full py-5 rounded-full font-black text-base"
        style={{ background: PINK, color: '#fff', fontSize: 17, boxShadow: `0 0 30px ${PINK_A(0.4)}` }}>
        {t.step8Photos.cta}
      </motion.button>

      {/* ── Séparateur Ou ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
        className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>Ou</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </motion.div>

      {/* ── CTA upload ── */}
      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setUploadMode(true)}
        className="w-full py-4 rounded-full font-black text-sm"
        style={{
          background: 'rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
        📁 Upload tes photos
      </motion.button>
    </div>
  )
}

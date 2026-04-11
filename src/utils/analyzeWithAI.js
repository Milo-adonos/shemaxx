// URL de la Edge Function Supabase — la clé OpenAI est stockée côté serveur (jamais exposée au navigateur)
const ANALYZE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-face`
const SUPABASE_ANON_KEY    = import.meta.env.VITE_SUPABASE_ANON_KEY

// Détecte la langue de l'utilisatrice pour l'envoyer au serveur
function detectLang() {
  const nav = (navigator.language || 'fr').toLowerCase()
  return nav.startsWith('en') ? 'en' : 'fr'
}

/**
 * Capture une frame de la vidéo et retourne un data URL base64 (JPEG)
 */
export function captureVideoFrame(videoElement, maxSize = 512) {
  const canvas = document.createElement('canvas')
  const vw = videoElement.videoWidth  || 640
  const vh = videoElement.videoHeight || 480
  const scale = Math.min(maxSize / vw, maxSize / vh, 1)
  canvas.width  = Math.round(vw * scale)
  canvas.height = Math.round(vh * scale)
  const ctx = canvas.getContext('2d')
  // Miroir horizontal (comme l'affichage caméra frontale)
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, Math.round(Number(v) || 70)))

// Erreurs de qualité image — typées pour l'affichage dans Step9AnalyzingIA
const IMAGE_QUALITY_ERRORS = {
  bad_lighting: {
    title: 'Éclairage insuffisant',
    detail: 'L\'IA ne peut pas voir tes traits clairement. Place-toi face à une source de lumière (fenêtre ou lampe devant toi), évite la lumière dans le dos.',
    emoji: '💡',
  },
  blurry: {
    title: 'Image trop floue',
    detail: 'L\'image est trop floue pour analyser ton visage. Nettoie l\'objectif de ta caméra et reste bien immobile pendant le scan.',
    emoji: '📷',
  },
  bad_angle: {
    title: 'Angle incorrect',
    detail: 'Ton visage est trop de côté ou trop incliné. Regarde droit dans la caméra, tête bien droite, visage centré dans le cercle.',
    emoji: '↔️',
  },
  no_face: {
    title: 'Visage non détecté',
    detail: 'Aucun visage clairement visible dans l\'image. Assure-toi que ton visage est bien éclairé et centré dans le cadre.',
    emoji: '👤',
  },
}

/**
 * Formate et valide les scores retournés par l'IA
 */
function formatScores(raw) {
  if (raw.imageQuality === 'no_face') {
    const qErr = IMAGE_QUALITY_ERRORS['no_face']
    const err = new Error(qErr.detail)
    err.isImageQuality = true
    err.qualityTitle   = qErr.title
    err.qualityEmoji   = qErr.emoji
    throw err
  }

  const rawDefauts = Array.isArray(raw.defauts) ? raw.defauts : []
  const defauts = rawDefauts
    .filter(d => d && d.zone && d.probleme && d.conseil)
    .slice(0, 8)
    .map(d => ({
      zone:     String(d.zone).trim(),
      probleme: String(d.probleme).trim(),
      conseil:  String(d.conseil).trim(),
    }))

  return {
    symmetry:    clamp(raw.symmetry,    0, 100),
    proportions: clamp(raw.proportions, 0, 100),
    regard:      clamp(raw.regard,      0, 100),
    structure:   clamp(raw.structure,   0, 100),
    skin:        clamp(raw.skin,        0, 100),
    photogenie:  clamp(raw.photogenie,  0, 100),
    total:       clamp(raw.total,      55,  96),
    ranking:     raw.ranking    || 'Top 50 %',
    beautyScore: raw.beautyScore || '7.0',
    rank:        raw.rank        || 'B',
    defauts,
  }
}

/**
 * Appelle la Edge Function Supabase avec timeout de 90s
 */
async function callAPI(imageDataUrl, age = null) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90000)

  try {
    const response = await fetch(ANALYZE_FUNCTION_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ imageDataUrl, age, lang: detectLang() }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Erreur serveur ${response.status}: ${errText.slice(0, 200)}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Envoie l'image à la Edge Function Supabase pour analyse IA.
 * La clé OpenAI est stockée côté serveur — jamais exposée au navigateur.
 */
export async function analyzeWithAI(imageDataUrl, _landmarks = null, age = null) {
  let lastError
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await callAPI(imageDataUrl, age)

      if (raw.error) {
        throw new Error(raw.error)
      }

      return formatScores(raw)
    } catch (err) {
      lastError = err
      console.warn(`Analyse IA — tentative ${attempt} échouée :`, err.message)
      if (err.isImageQuality) throw err
      // Ne réessaye pas si c'est un timeout (déjà long)
      if (err.message?.includes('abort') || err.message?.includes('timeout')) throw err
      if (attempt < 2) await new Promise(r => setTimeout(r, 2000))
    }
  }

  throw lastError
}

import { computeFaceScores } from './faceAnalysis.js'

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

/** Conseils génériques quand l’analyse passe par le moteur local (sans OpenAI) */
const FALLBACK_DEFAUTS = [
  {
    zone: 'Proportions',
    probleme: 'Équilibre des traits à optimiser',
    conseil: 'Travaille la lumière en photo (lumière douce de face) et un léger contouring pour harmoniser visuellement.',
  },
  {
    zone: 'Peau',
    probleme: 'Texture et éclat',
    conseil: 'Routine hydratante matin/soir et SPF quotidien améliorent le rendu sur quelques semaines.',
  },
  {
    zone: 'Suivi',
    probleme: 'Analyse basée sur ton scan facial',
    conseil: 'Réessaie le scan avec une lumière naturelle pour affiner les recommandations dans l’app.',
  },
]

/**
 * Scores calculés uniquement à partir des landmarks MediaPipe (aucun appel réseau).
 */
export function scoresFromLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 468) return null
  const s = computeFaceScores(landmarks)
  if (!s) return null
  return formatScores({ ...s, defauts: FALLBACK_DEFAUTS })
}

const PROMPT = `Tu es une experte en analyse de beauté féminine, looksmaxxing et chirurgie esthétique.
Analyse ce visage de femme avec précision et objectivité. Identifie les vrais défauts visibles.

SCORES (0 à 100, réaliste — la moyenne est 60-70, sois honnête) :
- symmetry : symétrie gauche/droite (yeux, sourcils, joues, nez, bouche)
- proportions : ratio d'or facial, finesse du nez, volume lèvres, équilibre tiers du visage
- regard : tilt canthal, taille et ouverture des yeux, expressivité, symétrie des yeux
- structure : définition mâchoire, pommettes, V-taper, joues creuses ou rondes
- skin : qualité de peau visible (texture, uniformité, éclat, cernes, pores)
- photogenie : rendu global, charisme photographique, angles flatteurs

CALCULS :
- total : symmetry×0.20 + proportions×0.20 + regard×0.18 + structure×0.18 + skin×0.10 + photogenie×0.14, arrondi, entre 48 et 98
- ranking : ≥90="Top 1 %", ≥85="Top 5 %", ≥78="Top 10 %", ≥70="Top 20 %", ≥60="Top 30 %", sinon "Top 50 %"
- beautyScore : total/10 arrondi à 1 décimale (ex: "7.2")
- rank : ≥90="S", ≥85="A+", ≥78="A", ≥70="B+", ≥60="B", sinon "C+"

DÉFAUTS : Identifie entre 3 et 6 défauts réels et visibles sur ce visage. Sois très spécifique (ex: "nez dévié vers la droite", pas juste "nez"). Pour chaque défaut, donne un conseil actionnable précis et verrouillé (l'utilisatrice ne voit que le titre du problème, le conseil est flou).

Réponds UNIQUEMENT avec ce JSON valide, sans texte autour :
{
  "symmetry": <nombre>,
  "proportions": <nombre>,
  "regard": <nombre>,
  "structure": <nombre>,
  "skin": <nombre>,
  "photogenie": <nombre>,
  "total": <nombre>,
  "ranking": "<texte>",
  "beautyScore": "<X.X>",
  "rank": "<lettre>",
  "defauts": [
    { "zone": "<zone du visage>", "probleme": "<défaut précis et honnête>", "conseil": "<conseil actionnable détaillé>" },
    { "zone": "<zone>", "probleme": "<défaut>", "conseil": "<conseil>" },
    { "zone": "<zone>", "probleme": "<défaut>", "conseil": "<conseil>" }
  ]
}`

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

/**
 * Parse le JSON retourné par GPT (gère les blocs ```json ... ```)
 */
function parseAIResponse(content) {
  // Enlève les blocs markdown si présents
  const cleaned = content.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
  // Extrait le premier objet JSON trouvé
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Aucun JSON trouvé dans la réponse : ' + content.slice(0, 200))
  return JSON.parse(match[0])
}

/**
 * Formate et valide les scores retournés par l'IA
 */
function formatScores(raw) {
  const rawDefauts = Array.isArray(raw.defauts) ? raw.defauts : []
  const defauts = rawDefauts
    .filter(d => d && d.zone && d.probleme && d.conseil)
    .slice(0, 6)
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
    total:       clamp(raw.total,      48,  98),
    ranking:     raw.ranking    || 'Top 20 %',
    beautyScore: raw.beautyScore || '7.0',
    rank:        raw.rank        || 'B+',
    defauts,
  }
}

/**
 * Un appel à l'API OpenAI avec timeout
 */
async function callAPI(imageDataUrl) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000) // 25s timeout

  const content = imageDataUrl
    ? [
        { type: 'text', text: PROMPT },
        { type: 'image_url', image_url: { url: imageDataUrl, detail: 'low' } },
      ]
    : [{ type: 'text', text: PROMPT + '\n\n(Pas d\'image disponible — génère des scores plausibles)' }]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 900,
        temperature: 0.3,
        messages: [{ role: 'user', content }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API ${response.status}: ${errText.slice(0, 200)}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    return parseAIResponse(text)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Envoie une image à GPT-4o mini si une clé API est définie ; sinon ou en cas d’échec,
 * utilise les landmarks MediaPipe passés en second argument (analyse 100 % locale).
 *
 * @param {string|null} imageDataUrl — capture vidéo (peut être null si canvas « tainted »)
 * @param {Array<{x:number,y:number,z?:number}>|null} landmarksSnapshot — copie des 468 points à la fin du scan
 */
export async function analyzeWithAI(imageDataUrl, landmarksSnapshot = null) {
  const local = () => scoresFromLandmarks(landmarksSnapshot)

  if (!API_KEY) {
    const scores = local()
    if (scores) {
      console.info('Analyse : mode local (pas de VITE_OPENAI_API_KEY).')
      return scores
    }
    throw new Error('Clé API manquante et landmarks insuffisants pour l’analyse locale.')
  }

  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw = await callAPI(imageDataUrl)
      return formatScores(raw)
    } catch (err) {
      lastError = err
      console.warn(`Analyse IA — tentative ${attempt} échouée :`, err.message)
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1500))
      }
    }
  }

  const scores = local()
  if (scores) {
    console.info('Analyse : repli local après échec de l’API OpenAI.')
    return scores
  }

  throw lastError
}

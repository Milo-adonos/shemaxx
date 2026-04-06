const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const GROUP_RANKING_PROMPT = `Tu es un expert en détection de visages et looksmaxxing féminin.

ÉTAPE 1 — Compte TOUS les visages féminins visibles sur cette photo. Note ce nombre.
ÉTAPE 2 — Pour CHACUN de ces visages (sans en oublier aucun) :

A. Note looksmaxxing 1→10 basée sur : mâchoire définie, structure osseuse, tilt canthal, pommettes, symétrie, sous-orbite, nez, regard, peau. IGNORE maquillage et vêtements.

B. Bbox du visage en coordonnées normalisées 0→1. RÈGLES CRITIQUES :
   - bbox.x = position X du bord GAUCHE de la tête ÷ largeur totale image
   - bbox.y = position Y du sommet du FRONT ÷ hauteur totale image  
   - bbox.w = largeur de la tête ÷ largeur totale image
   - bbox.h = hauteur tête (front→menton) ÷ hauteur totale image
   - Chaque bbox = 1 seul visage. Pas de chevauchement.
   - Sois précis : si une personne est à x=400px sur image 1000px large, bbox.x=0.40

C. 1 trait looksmaxxing en français (ex: "pommettes hautes et saillantes").

Désigne la plus hot.
JSON : { "total_faces": 7, "girls": [ { "id": 1, "score": 8.4, "traits": "...", "winner": false, "bbox": { "x": 0.08, "y": 0.03, "w": 0.18, "h": 0.32 } } ], "winner_id": 1, "winner_reason": "..." }

IMPORTANT : girls.length DOIT être égal à total_faces. Aucun visage de face ne doit être omis.`

const DESCRIBE_PERSON_PROMPT = `Describe this woman's exact physical appearance in detail for a photorealistic portrait generation. Include:
- Exact hair color (shade), texture, length, style
- Eye color and shape
- Skin tone (exact shade: fair, olive, medium-brown, dark-brown, etc.)
- Face shape (oval, square, round, heart, diamond)
- Nose shape (button, straight, aquiline, etc.)
- Lip fullness and shape
- Eyebrow shape and color
- Approximate age range
- Any distinctive features (freckles, dimples, etc.)
Write as a dense paragraph of physical descriptors only. Be extremely precise.`

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const key = Deno.env.get('OPENAI_API_KEY')
  if (!key) return json({ error: 'Clé OpenAI non configurée côté serveur' }, 500)

  let body: { type?: string; imageBase64?: string; prompt?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Corps de requête invalide' }, 400)
  }

  const { type, imageBase64, prompt } = body

  // ── group_ranking : analyse photo de groupe via GPT-4o vision ─────────────
  if (type === 'group_ranking') {
    if (!imageBase64) return json({ error: 'imageBase64 manquant' }, 400)

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1800,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } },
            { type: 'text', text: GROUP_RANKING_PROMPT },
          ],
        }],
      }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      return json({ error: err?.error?.message || `OpenAI HTTP ${resp.status}` }, 502)
    }

    const d = await resp.json()
    const raw = JSON.parse(d.choices?.[0]?.message?.content ?? '{}')
    return json(raw)
  }

  // ── style_transform : édition d'image via GPT-image-1 ────────────────────
  if (type === 'style_transform') {
    if (!imageBase64 || !prompt) return json({ error: 'imageBase64 et prompt requis' }, 400)

    const imageBytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0))
    const imageBlob  = new Blob([imageBytes], { type: 'image/jpeg' })

    const form = new FormData()
    form.append('model',   'gpt-image-1')
    form.append('image[]', imageBlob, 'photo.jpg')
    form.append('prompt',  prompt)
    form.append('size',    '1024x1024')
    form.append('quality', 'medium')
    form.append('n',       '1')

    const resp = await fetch('https://api.openai.com/v1/images/edits', {
      method:  'POST',
      headers: { Authorization: `Bearer ${key}` },
      body:    form,
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      return json({ error: err?.error?.message || `OpenAI HTTP ${resp.status}` }, 502)
    }

    const data = await resp.json()
    const b64  = data?.data?.[0]?.b64_json
    if (!b64) return json({ error: 'Réponse inattendue de OpenAI' }, 502)
    return json({ b64_json: b64 })
  }

  // ── describe_person : description physique via GPT-4o ─────────────────────
  if (type === 'describe_person') {
    if (!imageBase64) return json({ error: 'imageBase64 manquant' }, 400)

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } },
            { type: 'text', text: DESCRIBE_PERSON_PROMPT },
          ],
        }],
      }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      return json({ error: err?.error?.message || `OpenAI HTTP ${resp.status}` }, 502)
    }

    const d = await resp.json()
    const description = d.choices?.[0]?.message?.content ?? 'a young woman with natural features'
    return json({ description })
  }

  // ── generate_image : génération via DALL-E 3 ─────────────────────────────
  if (type === 'generate_image') {
    if (!prompt) return json({ error: 'prompt manquant' }, 400)

    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body:    JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024', quality: 'hd' }),
    })

    const d = await resp.json()
    if (d.error) return json({ error: d.error.message }, 502)
    return json({ url: d.data?.[0]?.url ?? null })
  }

  return json({ error: `Type inconnu : ${type}` }, 400)
})

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

const GROUP_RANKING_PROMPT = `You are an expert in face detection and female looksmaxxing.

STEP 1 — Count ALL visible female faces in this photo. Note this number.
STEP 2 — For EACH of these faces (without missing any):

A. Looksmaxxing score 1→10 based on: defined jawline, bone structure, canthal tilt, cheekbones, symmetry, under-eye area, nose, gaze, skin. IGNORE makeup and clothing.

B. Face bounding box in normalized coordinates 0→1. CRITICAL RULES:
   - bbox.x = X position of the LEFT edge of the head ÷ total image width
   - bbox.y = Y position of the top of the FOREHEAD ÷ total image height
   - bbox.w = head width ÷ total image width
   - bbox.h = head height (forehead→chin) ÷ total image height
   - Each bbox = 1 face only. No overlap.
   - Be precise: if a person is at x=400px on a 1000px wide image, bbox.x=0.40

C. 1 looksmaxxing trait in English (e.g., "high and prominent cheekbones").

Designate the hottest.
JSON: { "total_faces": 7, "girls": [ { "id": 1, "score": 8.4, "traits": "...", "winner": false, "bbox": { "x": 0.08, "y": 0.03, "w": 0.18, "h": 0.32 } } ], "winner_id": 1, "winner_reason": "..." }

IMPORTANT: girls.length MUST equal total_faces. No visible face should be omitted.`

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
  if (!key) return json({ error: 'OpenAI API key not configured on server' }, 500)

  let body: { type?: string; imageBase64?: string; prompt?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  const { type, imageBase64, prompt } = body

  // ── group_ranking : analyse photo de groupe via GPT-4o vision ─────────────
  if (type === 'group_ranking') {
    if (!imageBase64) return json({ error: 'imageBase64 missing' }, 400)

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
    if (!imageBase64 || !prompt) return json({ error: 'imageBase64 and prompt required' }, 400)

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
    if (!b64) return json({ error: 'Unexpected response from OpenAI' }, 502)
    return json({ b64_json: b64 })
  }

  // ── describe_person : description physique via GPT-4o ─────────────────────
  if (type === 'describe_person') {
    if (!imageBase64) return json({ error: 'imageBase64 missing' }, 400)

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
    if (!prompt) return json({ error: 'prompt missing' }, 400)

    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body:    JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024', quality: 'hd' }),
    })

    const d = await resp.json()
    if (d.error) return json({ error: d.error.message }, 502)
    return json({ url: d.data?.[0]?.url ?? null })
  }

  return json({ error: `Unknown type: ${type}` }, 400)
})

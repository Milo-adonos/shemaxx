const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Accepted beauty/looksmaxxing topics
const BEAUTY_KEYWORDS = [
  // English
  'face','skin','eyebrow','eye','nose','lip','mouth','jaw','jawline','cheek','cheekbone',
  'forehead','chin','complexion','wrinkle','pore','acne','scar','skincare','serum',
  'retinol','niacinamide','spf','cream','mask','routine','mewing','gua sha','guasha',
  'roller','derma','led','facial exercise','contour','collagen','omega','zinc','vitamin',
  'herbal','tea','nutrition','diet','beauty','attractiveness','looksmax','looksmaxxing',
  'score','analysis','proportion','symmetry','structure','gaze','lifting','drainage',
  'lymphatic','massage','oil','natural','naturo','plant','ginger','hydrat','glow',
  'texture','firmness','elasticity','advice','improvement','potential','self care','selfcare',
  'hair','lash','brow','eyelid','canthal','tilt','dark circle','puffiness','bloating',
  // French (users may type in French even if app is in English)
  'visage','peau','sourcil','yeux','nez','lèvre','lèvres','bouche','mâchoire','machoire',
  'joue','pommette','front','menton','teint','rides','pores','acné','cicatrice',
  'soin','sérum','crème','creme','beauté','beaute','attractivité','attractivite',
  'conseil','amélioration','amelioration','potentiel','tisane','alimentation',
]

function isBeautyRelated(text: string): boolean {
  const lower = text.toLowerCase()
  return BEAUTY_KEYWORDS.some(kw => lower.includes(kw))
}

const SYSTEM_PROMPT = `You are Shemaxx Coach, an expert in looksmaxxing, natural beauty, and food-based naturopathy. You help women improve their physical appearance in a 100% natural and sustainable way.

ABSOLUTE RULES:
- Only respond to questions about beauty, looksmaxxing, facial care, skin-related naturopathy, facial exercises, or nutrition for beauty
- If the question is not related to these topics, respond ONLY with: "I only specialize in beauty and looksmaxxing. Ask me about your skincare, face or nutrition!"
- ZERO makeup, ZERO surgery, ZERO medications — only natural techniques and real foods
- SHORT responses: 2 to 4 sentences maximum, simple and direct vocabulary
- Be warm, encouraging, and expert
- Always mention 1 concrete technique or 1 specific food/ingredient in your answer
- If relevant, mention that a product is available on Amazon`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { message, history = [], lang = 'en' } = await req.json()

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Empty message' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key missing' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Server-side check: question must be beauty-related
    if (!isBeautyRelated(message)) {
      return new Response(JSON.stringify({
        reply: "I only specialize in beauty and looksmaxxing. Ask me about your skincare, face or nutrition!"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Construit l'historique (max 6 derniers messages pour limiter les tokens)
    const recentHistory = (history || []).slice(-6)
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentHistory,
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 180,
        temperature: 0.5,
        messages,
      }),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `OpenAI ${response.status}` }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content?.trim() ?? ''

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

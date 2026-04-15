const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Thèmes acceptés (looksmaxxing, beauté, naturopathie, soin)
const BEAUTY_KEYWORDS = [
  'visage','peau','sourcil','yeux','nez','lèvre','lèvres','bouche','mâchoire','machoire',
  'joue','pommette','front','menton','teint','rides','pores','acné','acne','cicatrice',
  'soin','sérum','retinol','niacinamide','spf','crème','creme','masque','routine',
  'mewing','gua sha','guasha','roller','derma','led','exercice facial','jawline','contour',
  'collagène','collagene','omega','zinc','vitamine','tisane','nutrition','alimentation',
  'beauté','beaute','attractivité','attractivite','looksmax','looksmaxing','looksmaxxing',
  'score','analyse','proportion','symetrie','symétrie','structure','regard','lifting',
  'drainage','lymphatique','massage','huile','soin naturel','naturo','plante','gingembre',
  'skin','face','cheek','jaw','eye','nose','lip','brow','forehead','hair','cils','cheveux',
  'hydrat','éclat','eclat','lumineux','luminosité','texture','fermeté','fermete','elasticité',
  'conseil','amélioration','amelioration','ameliorer','améliorer','progresser','potentiel',
  'beauté intérieure','self care','selfcare',
]

function isBeautyRelated(text: string): boolean {
  const lower = text.toLowerCase()
  return BEAUTY_KEYWORDS.some(kw => lower.includes(kw))
}

const SYSTEM_PROMPT = `Tu es Shemaxx Coach, une experte en looksmaxxing, beauté naturelle et naturopathie. Tu aidES des femmes à améliorer leur apparence physique de façon 100% naturelle et durable.

REGLES ABSOLUES :
- Réponds UNIQUEMENT aux questions sur la beauté, le looksmaxxing, les soins du visage, la naturopathie liée à la peau/visage, les exercices faciaux, l'alimentation pour la beauté
- Si la question ne parle pas de ces sujets, réponds UNIQUEMENT : "Je suis spécialisée uniquement en beauté et looksmaxxing. Pose-moi une question sur tes soins, ton visage ou ton alimentation !"
- ZERO maquillage, ZERO chirurgie, ZERO médicament — uniquement des techniques naturelles et des aliments
- Réponses COURTES : 2 à 4 phrases maximum, vocabulaire simple et direct
- Sois chaleureuse, encourageante, experte
- Cite toujours 1 technique concrète ou 1 aliment précis dans ta réponse
- Si pertinent, mentionne qu'un produit est disponible sur Amazon`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { message, history = [], lang = 'fr' } = await req.json()

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message vide' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Clé API manquante' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Vérification côté serveur si la question est liée à la beauté
    if (!isBeautyRelated(message)) {
      const offTopicReply = lang === 'en'
        ? "I only specialize in beauty and looksmaxxing. Ask me about your skincare, face or nutrition!"
        : "Je suis spécialisée uniquement en beauté et looksmaxxing. Pose-moi une question sur tes soins, ton visage ou ton alimentation !"
      return new Response(JSON.stringify({ reply: offTopicReply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = lang === 'en'
      ? SYSTEM_PROMPT.replace('Tu es Shemaxx Coach', 'You are Shemaxx Coach')
          .replace('UNIQUEMENT aux questions', 'ONLY to questions')
          .replace('Réponds', 'Respond')
      : SYSTEM_PROMPT

    // Construit l'historique (max 6 derniers messages pour limiter les tokens)
    const recentHistory = (history || []).slice(-6)
    const messages = [
      { role: 'system', content: systemPrompt },
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
        max_tokens: 180,   // Réponses courtes = peu de tokens = coût minimal
        temperature: 0.5,
        messages,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
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
    return new Response(JSON.stringify({ error: err?.message || 'Erreur inconnue' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

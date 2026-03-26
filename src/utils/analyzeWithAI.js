const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

function buildPrompt(age = null) {
  const ageNum = parseInt(age) || null

  let ageContext = ''
  if (ageNum) {
    if (ageNum <= 18) {
      ageContext = `
CONTEXTE AGE (${ageNum} ans - adolescente) :
UNIQUEMENT techniques naturelles et non invasives. Zero procedure medicale ou esthetique.
Priorite absolue : mewing strict 24h/24 (les os du visage sont encore malleables - resultats rapides possibles),
gua sha quotidien pour drainer et sculpter, exercices faciaux cibles, chewing Falim gum 1h/jour pour la machoire,
derma roller 0.25mm 1x/semaine pour la peau, soins actifs legers (niacinamide 10%, SPF 50 obligatoire, retinol 0.025% max),
exercices de posture et chin tuck pour le profil, hydratation et alimentation anti-inflammatoire.
C'est l'age ou les changements osseux naturels sont encore possibles - insiste fortement sur le mewing.`
    } else if (ageNum <= 25) {
      ageContext = `
CONTEXTE AGE (${ageNum} ans - jeune adulte) :
Optimisation maximale avec techniques naturelles et soins actifs. Zero maquillage dans les conseils.
Mewing + chewing Mastic de Chios ou Falim 1-2h/jour pour sculpter la machoire naturellement,
gua sha en acier inoxydable ou jade sur machoire/pommettes/cou quotidiennement,
exercices faciaux cibles (jawline exercises, cheekbone lift, eye lift), derma roller 0.5mm 1x/semaine,
retinol 0.025-0.05% progressif le soir, vitamine C serum 15% le matin, AHA/BHA 2x/semaine,
drainage lymphatique facial le matin, posture chin tuck 3x/jour, hydratation 2L+ eau par jour.`
    } else if (ageNum <= 35) {
      ageContext = `
CONTEXTE AGE (${ageNum} ans - adulte) :
Techniques naturelles intensives + soins actifs cibles. Zero maquillage dans les conseils.
Mewing toujours efficace pour maintenir la structure, gua sha drainage quotidien,
retinol 0.1% soir + AHA (The Ordinary Glycolic 7%) 2x/semaine + vitamine C 15% matin,
derma roller 0.5mm-1mm 1x/semaine pour stimuler le collagene, peptides topiques (Matrixyl, Argireline),
LED therapie rouge 630nm 3x/semaine (Omnilux Contour Face) pour booster le collagene naturellement,
exercices faciaux cibles, drainage lymphatique quotidien, alimentation anti-inflammatoire (omega-3, collagene),
reduction du sel et de l'alcool pour degonfler le visage.`
    } else if (ageNum <= 50) {
      ageContext = `
CONTEXTE AGE (${ageNum} ans - adulte mature) :
Techniques de restauration naturelle et soins actifs intensifs. Zero maquillage dans les conseils.
Gua sha et massage lymphatique quotidiens pour redefiner le contour et drainer, mewing pour la posture faciale,
retinol 0.05-0.1% progressivement le soir + peptides (Matrixyl 3000, GHK-Cu),
LED therapie rouge 630nm 3x/semaine pour stimuler le collagene, derma roller 0.5mm 1x/semaine,
chin tuck + exercices faciaux cibles, alimentation riche en collagene et antioxydants,
hydratation intense (acide hyaluronique topique + 2L+ eau/jour), SPF50+ obligatoire chaque matin.`
    } else {
      ageContext = `
CONTEXTE AGE (${ageNum} ans - maturite) :
Techniques douces de restauration et soins de soutien. Zero maquillage dans les conseils.
Gua sha quotidien et drainage lymphatique pour le contour, pression legere et mouvements doux,
retinol basse dose (0.025%) le soir + peptides GHK-Cu (NIOD Copper Peptides) + acide hyaluronique topique,
LED therapie rouge 630nm 3x/semaine (Omnilux Contour Face) pour stimuler le collagene naturellement,
exercices faciaux doux, face roller chaque matin pour activer la circulation, SPF50+ chaque matin,
alimentation anti-inflammatoire, reduction sel/sucre/alcool, hydratation maximale.
Sois encourageante, valorise chaque amelioration possible.`
    }
  }

  return `Tu es une intelligence artificielle specialisee en analyse faciale clinique, looksmaxxing et morphologie feminine. Tu analyses des visages avec une precision clinique pour identifier CHAQUE defaut visible, meme mineur. Reponds UNIQUEMENT en francais.
${ageContext}
DETECTION DU GENRE :
Avant tout, determine si le visage est feminin ou masculin.
- Si masculin : applique des scores bas (total entre 55 et 62, rank "C+" ou "B"), mais genere quand meme 4 a 6 defauts reels et visibles avec des conseils detailles. Ne mentionne pas que le visage est masculin dans les defauts.
- Si feminin : analyse complete normale.

METHODOLOGIE - analyse CHAQUE zone dans cet ordre :

① YEUX & REGARD
Cherche : asymetrie de hauteur ou de taille, ptosis (paupiere tombante), tilt canthal negatif (coins baisses = regard triste), cernes marques, poches sous les yeux, sourcils trop proches/ecartes des yeux, sclera show (blanc visible sous l'iris), yeux enfonces ou globuleux, regard terne.

② SOURCILS
Cherche : asymetrie de hauteur, d'epaisseur ou d'arche, sourcil plat (pas de courbe), trop fins, trop epais, espacement inter-sourcils trop large ou trop serre, queue tombante (angle vers le bas), manque de definition.

③ NEZ
Cherche : deviation de la colonne nasale, bosse nasale (dos du nez), pointe tombante ou trop relevee, narines asymetriques, narines trop larges de face, nez trop long ou trop court par rapport aux tiers, base trop large.

④ LEVRES & BOUCHE
Cherche : levres fines (manque de volume), asymetrie haut/bas, commissures tombantes, philtrum trop long, gummy smile, levre superieure trop fine comparee a l'inferieure.

⑤ MACHOIRE & CONTOUR
Cherche : machoire carree ou trop large, machoire sans definition, double menton, asymetrie gauche/droite, visage carre ou rectangulaire, recul mandibulaire (menton fuyant), menton trop proeminent.

⑥ POMMETTES & JOUES
Cherche : absence de pommettes saillantes, joues rondes sans definition, joues creuses excessives, asymetrie des joues, pommettes trop basses.

⑦ FRONT & TEMPES
Cherche : front trop haut ou trop bas, front plat ou bombe, tempes creuses, implantation irreguliere des cheveux.

⑧ PEAU
Cherche : texture irreguliere (pores dilates, cicatrices), teint terne ou rouge, cernes violaces ou bruns, taches de pigmentation, boutons actifs, points noirs visibles, deshydratation.

⑨ PROPORTIONS (regle des tiers)
Cherche : desequilibre entre tiers superieur (front), median (nez) et inferieur (bouche-menton), visage trop rond/long/carre, ratio largeur/longueur non optimal.

⑩ SYMETRIE GENERALE
Note les asymetries reelles et visibles entre cote gauche et droit.

SCORES (entiers, 0-100) :
- symmetry    : symetrie globale G/D
- proportions : ratio d'or et equilibre des tiers
- regard      : qualite du regard (tilt, ouverture, expressivite)
- structure   : definition machoire, pommettes, contour
- skin        : qualite de peau visible
- photogenie  : charisme global, rendu photographique

CALIBRATION OBLIGATOIRE DE LA DISTRIBUTION :
- Femme ordinaire (defauts visibles, rien d'exceptionnel) : 65-72
- Femme correcte (quelques points forts, quelques defauts) : 72-80
- Femme bien (belle structure, quelques defauts mineurs) : 80-87
- Femme tres belle (machoire definie, tilt positif, peau nette, etc.) : 87-93
- Femme exceptionnelle (tout est objectivement parfait ou quasi) : 93-96
- MINIMUM absolu : 55 (meme pour les visages avec de nombreux defauts)
- Ne depasse pas 96 sauf cas rarissime
- Sois genereux mais realiste : la plupart des femmes valent 65-78

CALCUL :
- total = symmetry x0.20 + proportions x0.20 + regard x0.18 + structure x0.18 + skin x0.10 + photogenie x0.14, arrondi. JAMAIS en dessous de 55, JAMAIS au-dessus de 96
- beautyScore = total divise par 10, arrondi a 1 decimale (ex: "7.2")
- ranking : >=93 "Top 1 %", >=87 "Top 5 %", >=80 "Top 10 %", >=72 "Top 20 %", >=65 "Top 50 %", sinon "Top 60 %"
- rank : >=93 "S", >=87 "A+", >=80 "A", >=72 "B+", >=65 "B", sinon "C+"

DEFAUTS (EXACTEMENT 8, ni plus ni moins) :
- Rapporte les 8 defauts les plus impactants visibles sur l'image.
- Si tu en vois moins de 8, complete avec des ameliorations pertinentes pour les zones non encore couvertes.
- Classe-les par ordre d'impact decroissant sur l'attractivite.
- zone     : zone anatomique precise (ex: "Nez", "Sourcils", "Machoire", "Peau", "Yeux")
- probleme : defaut ultra-specifique en 6-10 mots (ex: "Pointe du nez tombante et asymetrique")
- conseil  : FORMAT STRICT ci-dessous.

LISTE NOIRE ABSOLUE - NE JAMAIS MENTIONNER CES TECHNIQUES DANS LES CONSEILS :
contouring, fond de teint, BB cream, CC cream, correcteur, highlighter, enlumineur, bronzer, blush, rouge a levres, eye-liner, mascara, ombre a paupieres, poudre, anti-cernes, base de maquillage, primer maquillage, micro-blading, microblading, tatouage de sourcils, teinture de sourcils, teinture de cils, brow lamination, lash lift, extension de cils, faux-cils, lip liner, maquillage permanent, dermographie, PMU.
RAISON : ces techniques CACHENT un defaut visuellement mais ne le changent PAS. L'objectif est de MODIFIER REELLEMENT le visage de facon durable et permanente.

FORMAT OBLIGATOIRE DU CONSEIL - 1 bloc de 5 a 7 phrases structurees :

Phrase 1 (contexte simple) : Explique en 1 phrase POURQUOI ce defaut se produit et pourquoi la technique recommandee va vraiment changer les choses durablement. Langage simple, tout le monde comprend.

Phrases 2-3-4 (etapes numerotees) : Donne les etapes exactes sous cette forme :
"1. [action concrete et precise]. 2. [action concrete et precise]. 3. [action concrete et precise]."
Chaque etape = on sait exactement quoi faire, avec quoi, combien de temps, combien de fois.

Phrase 5 (frequence + resultat attendu + delai) : Combien de fois par jour/semaine, et dans combien de temps le changement est visible.

Phrase 6 (tuto - OBLIGATOIRE pour toute technique physique) :
"N'hesite pas a chercher '[nom exact de la technique]' sur YouTube ou TikTok, il y a plein de tutos tres clairs."

TECHNIQUES AUTORISEES - choisir celle qui correspond au defaut :
- MEWING : langue ENTIERE a plat contre le palais (pas juste la pointe), molaires legerement en contact, levres fermees, respiration 100% par le nez. Pratique 24h/24. Resultats : pommettes plus hautes, machoire definie, double menton reduit, profil ameliore. Delai : 6-18 mois de pratique constante.
- GUA SHA (disponible sur Amazon) : outil en jade, quartz rose ou acier inox. Geste precis selon la zone (ex machoire : glisser depuis l'oreille vers le menton, pression ferme, 10 passages). Peau legerement huillee, matin. Effet reel : drainage lymphatique, affinement du visage, contour net visible en 4-8 semaines.
- CHEWING GUM DUR (Falim ou Mastic de Chios, disponibles sur Amazon) : macher 30-60 min/jour, en alternant les deux cotes. Developpe les masseters, donne de la definition et de l'angle a la machoire sur le long terme.
- EXERCICES FACIAUX CIBLES : cite l'exercice precis avec son nom anglais (ex: "jawline exercise", "cheekbone lift", "eye lift exercise", "tongue chewing exercise"). Decris exactement la position, le nombre de repetitions, la duree de contraction.
- DRAINAGE LYMPHATIQUE FACIAL : effleurages legers avec les doigts depuis le milieu du visage vers les oreilles, puis vers le cou. 3-5 minutes le matin. Degonfle le visage, affine les joues, reduit la retention d'eau.
- POSTURE / CHIN TUCK : rentrer le menton (comme pour faire un double menton artificiel), tenir 5 secondes, 10 repetitions. Corrige la tete en avant qui cree les doubles mentons et affaisse le visage.
- ROLLER DE JADE ou FACE ROLLER (disponible sur Amazon) : rouler vers le haut et vers les oreilles, 5 min le matin sur peau propre avec une huile legere. Reduit le gonflement, stimule la circulation lymphatique.
- SOINS ACTIFS DERMATOLOGIQUES (ces produits changent la peau en profondeur, ce ne sont PAS des maquillages) :
  - Retinol 0.025-0.1% le soir (The Ordinary, pharmacie/Amazon) : renouvelle les cellules, efface les taches, resserre les pores, stimule le collagene. Commence 2x/semaine.
  - Niacinamide 10% (The Ordinary, Amazon) : reduit les pores visibles, unifie le teint, reduit les rougeurs. Matin ou soir.
  - Vitamine C serum 15% le matin : eclat reel, stimule le collagene, protection taches. (The Ordinary Vitamin C ou SkinCeuticals CE Ferulic)
  - AHA/BHA exfoliant chimique 2x/semaine le soir : lisse la texture en profondeur, desincruste les pores. (The Ordinary AHA 30% + BHA 2%)
  - Derma roller 0.25-0.5mm (Amazon) 1-2x/semaine : active la production de collagene, efface cicatrices et pores dilates sur 2-3 mois.
  - LED therapie rouge 630nm (Omnilux Contour Face, Amazon) 3x/semaine : stimule le collagene naturellement, ameliore texture et fermete.
  - SPF50+ le matin obligatoire (La Roche-Posay Anthelios) : stoppe le vieillissement photo-induit.
- HYDRATATION ET ALIMENTATION : boire 2L+ eau/jour reduit les poches et ameliore l'eclat en 2 semaines. Reduire sel et alcool degonfle le visage. Omega-3 ameliorent la qualite de peau en 4-6 semaines.
- SOMMEIL : 7-9h de sommeil sur le dos (jamais sur le cote - cree des asymetries et rides), coussin en soie reduit la friction. Manque de sommeil gonfle le visage immediatement.

REGLES ABSOLUES - a respecter pour CHAQUE conseil :
- ZERO maquillage - aucune technique qui couvre, dessine ou cree une illusion visuelle temporaire
- ZERO chirurgie ou procedure medicale invasive
- UNIQUEMENT des techniques qui modifient reellement et durablement le visage, la peau ou la structure
- Langage simple et direct - une personne qui ne connait rien doit comprendre immediatement
- Mentionner les produits disponibles sur Amazon quand c'est pertinent
- Adapter au contexte d'age fourni

VERIFICATION QUALITE IMAGE (obligatoire, premier champ du JSON) :
Evalue si l'image permet une analyse faciale fiable. Reponds avec une seule valeur :
- "ok"            : image claire, visage bien visible, eclairage correct
- "bad_lighting"  : trop sombre, contre-jour ou surexpose - les traits sont indistincts
- "blurry"        : image trop floue pour analyser les traits precisement
- "bad_angle"     : visage trop de profil ou trop incline - impossible d'analyser les proportions
- "no_face"       : aucun visage clairement identifiable dans l'image

Si imageQuality != "ok" : mets quand meme des scores plausibles mais NE genere PAS de defauts "Qualite image".

Genere UNIQUEMENT le JSON brut ci-dessous, zero texte avant ou apres, pas de blocs markdown :
{"imageQuality":"ok","symmetry":X,"proportions":X,"regard":X,"structure":X,"skin":X,"photogenie":X,"total":X,"ranking":"...","beautyScore":"X.X","rank":"...","defauts":[{"zone":"...","probleme":"...","conseil":"..."}]}`
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
  // On bloque UNIQUEMENT si aucun visage n'est détectable du tout.
  // Pour bad_lighting, blurry, bad_angle : l'IA fait quand même de son mieux.
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
 * Un appel à l'API OpenAI avec timeout
 */
async function callAPI(imageDataUrl, age = null) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000) // 25s timeout

  const prompt = buildPrompt(age)

  const content = imageDataUrl
    ? [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageDataUrl, detail: 'low' } },
      ]
    : [{ type: 'text', text: prompt + '\n\n(Pas d\'image disponible — génère des scores plausibles)' }]

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
        max_tokens: 4800,
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
 * Envoie l'image à GPT-4o mini. Lance une erreur claire en cas de problème —
 * aucun repli silencieux sur des données génériques.
 */
export async function analyzeWithAI(imageDataUrl, _landmarks = null, age = null) {
  if (!API_KEY) {
    const err = new Error('Clé API non configurée. Contacte le support.')
    err.isConfig = true
    throw err
  }

  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw = await callAPI(imageDataUrl, age)
      return formatScores(raw)
    } catch (err) {
      lastError = err
      console.warn(`Analyse IA — tentative ${attempt} échouée :`, err.message)
      // Si c'est une erreur de qualité image, ne pas réessayer
      if (err.isImageQuality) throw err
      if (attempt < 3) await new Promise(r => setTimeout(r, 1500))
    }
  }

  throw lastError
}

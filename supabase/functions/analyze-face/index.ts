const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildPrompt(age: number | null, english = false): string {
  let ageContext = ''
  if (age) {
    if (age <= 18) {
      ageContext = `
CONTEXTE AGE (${age} ans - adolescente) :
UNIQUEMENT techniques naturelles et non invasives. Zero procedure medicale ou esthetique.
Priorite absolue : mewing strict 24h/24 (les os du visage sont encore malleables - resultats rapides possibles),
gua sha quotidien pour drainer et sculpter, exercices faciaux cibles, chewing Falim gum 1h/jour pour la machoire,
derma roller 0.25mm 1x/semaine pour la peau, soins actifs legers (niacinamide 10%, SPF 50 obligatoire, retinol 0.025% max),
exercices de posture et chin tuck pour le profil, hydratation et alimentation anti-inflammatoire.
C'est l'age ou les changements osseux naturels sont encore possibles - insiste fortement sur le mewing.`
    } else if (age <= 25) {
      ageContext = `
CONTEXTE AGE (${age} ans - jeune adulte) :
Optimisation maximale avec techniques naturelles et soins actifs. Zero maquillage dans les conseils.
Mewing + chewing Mastic de Chios ou Falim 1-2h/jour pour sculpter la machoire naturellement,
gua sha en acier inoxydable ou jade sur machoire/pommettes/cou quotidiennement,
exercices faciaux cibles (jawline exercises, cheekbone lift, eye lift), derma roller 0.5mm 1x/semaine,
retinol 0.025-0.05% progressif le soir, vitamine C serum 15% le matin, AHA/BHA 2x/semaine,
drainage lymphatique facial le matin, posture chin tuck 3x/jour, hydratation 2L+ eau par jour.`
    } else if (age <= 35) {
      ageContext = `
CONTEXTE AGE (${age} ans - adulte) :
Techniques naturelles intensives + soins actifs cibles. Zero maquillage dans les conseils.
Mewing toujours efficace pour maintenir la structure, gua sha drainage quotidien,
retinol 0.1% soir + AHA (The Ordinary Glycolic 7%) 2x/semaine + vitamine C 15% matin,
derma roller 0.5mm-1mm 1x/semaine pour stimuler le collagene, peptides topiques (Matrixyl, Argireline),
LED therapie rouge 630nm 3x/semaine (Omnilux Contour Face) pour booster le collagene naturellement,
exercices faciaux cibles, drainage lymphatique quotidien, alimentation anti-inflammatoire (omega-3, collagene),
reduction du sel et de l'alcool pour degonfler le visage.`
    } else if (age <= 50) {
      ageContext = `
CONTEXTE AGE (${age} ans - adulte mature) :
Techniques de restauration naturelle et soins actifs intensifs. Zero maquillage dans les conseils.
Gua sha et massage lymphatique quotidiens pour redefiner le contour et drainer, mewing pour la posture faciale,
retinol 0.05-0.1% progressivement le soir + peptides (Matrixyl 3000, GHK-Cu),
LED therapie rouge 630nm 3x/semaine pour stimuler le collagene, derma roller 0.5mm 1x/semaine,
chin tuck + exercices faciaux cibles, alimentation riche en collagene et antioxydants,
hydratation intense (acide hyaluronique topique + 2L+ eau/jour), SPF50+ obligatoire chaque matin.`
    } else {
      ageContext = `
CONTEXTE AGE (${age} ans - maturite) :
Techniques douces de restauration et soins de soutien. Zero maquillage dans les conseils.
Gua sha quotidien et drainage lymphatique pour le contour, pression legere et mouvements doux,
retinol basse dose (0.025%) le soir + peptides GHK-Cu (NIOD Copper Peptides) + acide hyaluronique topique,
LED therapie rouge 630nm 3x/semaine (Omnilux Contour Face) pour stimuler le collagene naturellement,
exercices faciaux doux, face roller chaque matin pour activer la circulation, SPF50+ chaque matin,
alimentation anti-inflammatoire, reduction sel/sucre/alcool, hydratation maximale.
Sois encourageante, valorise chaque amelioration possible.`
    }
  }

  const langInstruction = english
    ? 'You are an AI specialized in clinical facial analysis, looksmaxxing, and female morphology. Analyze faces with clinical precision to identify EACH visible flaw, even minor ones. Respond ONLY in English. Zone names, problems, and advice must ALL be in English.'
    : 'Tu es une intelligence artificielle specialisee en analyse faciale clinique, looksmaxxing et morphologie feminine. Tu analyses des visages avec une precision clinique pour identifier CHAQUE defaut visible, meme mineur. Reponds UNIQUEMENT en francais.'

  return `${langInstruction}
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

REGLES DE CORRESPONDANCE ZONE → TECHNIQUE (OBLIGATOIRE — respecter strictement) :
- Sourcils (asymetrie, forme, epaisseur) → UNIQUEMENT : exercices faciaux sourcils ("brow lift exercise", pression frontale pour symetriser), huile de ricin pour la croissance, serum sourcils, dermaplaning doux. JAMAIS de mewing pour les sourcils.
- Yeux / Regard (tilt canthal, poches, cernes, ptosis) → UNIQUEMENT : exercices "eye lift exercise" et "canthal tilt exercise", drainage lymphatique sous les yeux, sommeil sur le dos, retinol autour des yeux (0.025%), patches contour yeux, cold roller.
- Nez (deviation, bosse, pointe) → UNIQUEMENT : exercices "nose shaping exercise" (pincement doux et massage nasal quotidien), rhinoplastie non-chirurgicale par massage, posture mentale.
- Levres / Bouche (volume, asymetrie, philtrum) → UNIQUEMENT : exercices faciaux levres ("lip flip exercise", "mewing lip seal"), hydrater avec beurre de karite, exercices "lip plumping exercise", massages circulaires.
- Machoire / Contour (definition, asymetrie, menton) → UNIQUEMENT : MEWING, CHEWING GUM DUR (Falim/Mastic de Chios), "jawline exercise", gua sha sur la machoire, POSTURE/CHIN TUCK.
- Pommettes / Joues (relief, rondeur, asymetrie) → UNIQUEMENT : MEWING, "cheekbone lift exercise", gua sha sur les pommettes, drainage lymphatique.
- Front / Tempes → UNIQUEMENT : drainage lymphatique, gua sha front, hydratation, SPF50+.
- Peau (texture, pores, teint, taches, cicatrices) → UNIQUEMENT : SOINS ACTIFS DERMATOLOGIQUES (retinol, niacinamide, vitamine C, AHA/BHA, derma roller, LED rouge, SPF50+), HYDRATATION ET ALIMENTATION.
- Proportions / Symetrie generale → UNIQUEMENT : MEWING (structure osseuse), POSTURE/CHIN TUCK, SOMMEIL sur le dos.

TECHNIQUES DISPONIBLES (utiliser uniquement la technique correspondant a la zone ci-dessus) :
- MEWING : langue ENTIERE a plat contre le palais (pas juste la pointe), molaires legerement en contact, levres fermees, respiration 100% par le nez. Pratique 24h/24. Resultats : pommettes plus hautes, machoire definie, double menton reduit, profil ameliore. Delai : 6-18 mois de pratique constante. ZONE : machoire, pommettes, menton, proportions uniquement.
- GUA SHA (disponible sur Amazon) : outil en jade, quartz rose ou acier inox. Geste precis selon la zone. Peau legerement huillee, matin. Effet reel : drainage lymphatique, affinement du visage, contour net visible en 4-8 semaines.
- CHEWING GUM DUR (Falim ou Mastic de Chios, disponibles sur Amazon) : macher 30-60 min/jour, en alternant les deux cotes. Developpe les masseters, donne de la definition et de l'angle a la machoire. ZONE : machoire uniquement.
- EXERCICES FACIAUX CIBLES : cite l'exercice precis avec son nom anglais correspondant a la zone exacte (ex "brow lift exercise" pour sourcils, "eye lift exercise" pour yeux, "jawline exercise" pour machoire, "cheekbone lift" pour pommettes, "lip flip exercise" pour levres, "nose shaping exercise" pour nez). Decris exactement la position, le nombre de repetitions, la duree de contraction.
- DRAINAGE LYMPHATIQUE FACIAL : effleurages legers avec les doigts depuis le milieu du visage vers les oreilles, puis vers le cou. 3-5 minutes le matin. Degonfle le visage, affine les joues, reduit la retention d'eau.
- POSTURE / CHIN TUCK : rentrer le menton (comme pour faire un double menton artificiel), tenir 5 secondes, 10 repetitions. Corrige la tete en avant qui cree les doubles mentons et affaisse le visage. ZONE : menton, machoire, proportions.
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { imageDataUrl, age, lang } = await req.json()
    const isEnglish = lang === 'en'

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Clé API non configurée côté serveur.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prompt = buildPrompt(age ? parseInt(age) : null, isEnglish)

    const content = imageDataUrl
      ? [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageDataUrl, detail: 'low' } },
        ]
      : [{ type: 'text', text: prompt + '\n\n(Pas d\'image disponible — génère des scores plausibles)' }]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
      return new Response(JSON.stringify({ error: `OpenAI ${response.status}: ${errText.slice(0, 200)}` }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''

    // Parse JSON from AI response
    const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) {
      return new Response(JSON.stringify({ error: 'Réponse IA invalide' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = JSON.parse(match[0])
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erreur inconnue' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ── Analyse faciale féminine — Règles du Looksmaxing ─────────────────────────
// Basé sur les standards reconnus : proportions dorées, traits néoténiques,
// tilt canthal positif, mâchoire en V, pommettes saillantes, etc.
// Coordonnées normalisées [0,1] — x croît → droite, y croît ↓ bas

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}
function scoreFromDev(deviation, scale = 150, base = 95) {
  // Plus la déviation par rapport à l'idéal est faible, plus le score est élevé
  return clamp(Math.round(base - deviation * scale), 48, 99)
}

// ── Indices landmarks MediaPipe FaceMesh (468 points) ────────────────────────
const L = {
  noseTip:    1,
  forehead:   10,
  chin:       152,
  // Œil gauche caméra (= œil droit utilisateur)
  lEyeOut:    33,   lEyeIn:   133,  lEyeTop:  159,  lEyeBot:  145,
  lBrowOut:   70,   lBrowIn:  107,  lBrowPeak: 105,
  // Œil droit caméra (= œil gauche utilisateur)
  rEyeOut:    263,  rEyeIn:   362,  rEyeTop:  386,  rEyeBot:  374,
  rBrowOut:   300,  rBrowIn:  336,  rBrowPeak: 334,
  // Bouche & lèvres
  mouthL:     61,   mouthR:   291,
  upperLipT:  0,    upperLipB: 13,   // haut et bas lèvre supérieure
  lowerLipT:  14,   lowerLipB: 17,   // haut et bas lèvre inférieure
  // Contour visage
  lCheek:     234,  rCheek:   454,
  lJaw:       172,  rJaw:     397,
  lJawAngle:  58,   rJawAngle: 288,
  // Nez
  noseWL:     49,   noseWR:   279,
  noseBridge: 168,  noseTip2:  4,
}

// ── 1. SYMÉTRIE (/100) ───────────────────────────────────────────────────────
// Looksmaxing : la symétrie est le facteur n°1 d'attractivité universelle.
// Compare les distances gauche/droite par rapport à l'axe vertical du nez.
function scoreSymmetry(lm) {
  const cx = lm[L.noseTip].x

  const pairs = [
    [L.lEyeOut,   L.rEyeOut  ],  // coins ext. yeux
    [L.lEyeIn,    L.rEyeIn   ],  // coins int. yeux
    [L.lCheek,    L.rCheek   ],  // pommettes
    [L.lJaw,      L.rJaw     ],  // mâchoire
    [L.mouthL,    L.mouthR   ],  // coins bouche
    [L.lBrowOut,  L.rBrowOut ],  // sourcils ext.
    [L.lBrowIn,   L.rBrowIn  ],  // sourcils int.
    [L.lJawAngle, L.rJawAngle],  // angles mandibule
  ]

  const devs = pairs.map(([li, ri]) => {
    const dL  = Math.abs(lm[li].x - cx)
    const dR  = Math.abs(lm[ri].x - cx)
    const avg = (dL + dR) / 2
    return avg < 0.001 ? 0 : Math.abs(dL - dR) / avg
  })

  const avgDev = devs.reduce((s, v) => s + v, 0) / devs.length
  // Symétrie parfaite (~1 %) → 99 | Asymétrie notable (~10 %) → 65
  return clamp(Math.round(99 - avgDev * 340), 48, 99)
}

// ── 2. FÉMINITÉ DES PROPORTIONS (/100) ───────────────────────────────────────
// Looksmaxing féminin : nez fin, lèvres pulpeuses, visage ovale allongé,
// ratio H/W proche du nombre d'or.
function scoreProportions(lm) {
  const faceW  = dist(lm[L.lCheek],  lm[L.rCheek])
  const faceH  = dist(lm[L.forehead], lm[L.chin])
  const noseW  = dist(lm[L.noseWL],  lm[L.noseWR])
  const mouthW = dist(lm[L.mouthL],  lm[L.mouthR])
  const lipH   = dist(lm[L.upperLipT], lm[L.lowerLipB])

  const GOLDEN = 1.618

  // Ratio hauteur/largeur → idéal 1.4–1.7 (visage ovale féminin)
  const hwRatio   = faceH / Math.max(faceW, 0.001)
  const hwDev     = Math.abs(hwRatio - GOLDEN) / GOLDEN

  // Finesse du nez → idéal 0.20–0.25 (nez fin = féminin)
  const noseRatio = noseW / Math.max(faceW, 0.001)
  const noseDev   = Math.max(0, noseRatio - 0.22) / 0.22  // pénalise nez large

  // Plénitude des lèvres → idéal 0.055–0.075 (lèvres pulpeuses)
  const lipRatio  = lipH / Math.max(faceH, 0.001)
  const lipDev    = Math.max(0, 0.06 - lipRatio) / 0.06   // pénalise lèvres minces

  // Largeur bouche / nez → idéal ~1.618
  const mnRatio   = mouthW / Math.max(noseW, 0.001)
  const mnDev     = Math.abs(mnRatio - GOLDEN) / GOLDEN

  const composite = hwDev * 0.30 + noseDev * 0.25 + lipDev * 0.25 + mnDev * 0.20
  return scoreFromDev(composite, 180, 97)
}

// ── 3. IMPACT DU REGARD (/100) ────────────────────────────────────────────────
// Looksmaxing : tilt canthal positif (outer corner plus haut) = "fox eyes",
// grands yeux néoténiques, bonne ouverture. Facteur majeur d'attractivité.
function scoreRegard(lm) {
  // Tilt canthal : outer corner Y < inner corner Y = tilt positif (attrattif)
  // En coordonnées image : y plus petit = plus haut
  const lTilt = lm[L.lEyeIn].y - lm[L.lEyeOut].y   // > 0 = tilt positif côté caméra gauche
  const rTilt = lm[L.rEyeIn].y - lm[L.rEyeOut].y   // > 0 = tilt positif côté caméra droit

  const faceW    = dist(lm[L.lCheek],  lm[L.rCheek])
  const faceH    = dist(lm[L.forehead], lm[L.chin])
  const lEyeW    = dist(lm[L.lEyeOut], lm[L.lEyeIn])
  const lEyeH    = dist(lm[L.lEyeTop], lm[L.lEyeBot])
  const rEyeW    = dist(lm[L.rEyeOut], lm[L.rEyeIn])
  const rEyeH    = dist(lm[L.rEyeTop], lm[L.rEyeBot])
  const eyeOut   = dist(lm[L.lEyeOut], lm[L.rEyeOut])

  // --- Tilt canthal (normalisé par la largeur du visage)
  const avgTilt  = ((lTilt + rTilt) / 2) / Math.max(faceW, 0.001)
  // Tilt positif bonus, tilt négatif pénalité
  const tiltScore = clamp(50 + avgTilt * 800, 0, 50) // 0-50 pts

  // --- Taille des yeux relative au visage (plus grands = plus néoténique = plus féminin)
  const eyeArea   = ((lEyeW * lEyeH) + (rEyeW * rEyeH)) / 2
  const faceArea  = faceW * faceH
  const sizeRatio = eyeArea / Math.max(faceArea, 0.001)
  const idealSize = 0.012  // ratio idéal approximatif
  const sizeDev   = Math.abs(sizeRatio - idealSize) / idealSize
  const sizeScore = clamp(50 - sizeDev * 40, 0, 50) // 0-50 pts

  // --- Espacement inter-oculaire / largeur visage → idéal 0.44–0.46
  const espRatio  = eyeOut / Math.max(faceW, 0.001)
  const espDev    = Math.abs(espRatio - 0.45) / 0.45
  const espPenalty = espDev * 15

  return clamp(Math.round(tiltScore + sizeScore - espPenalty), 48, 99)
}

// ── 4. STRUCTURE FÉMINITÉ (/100) ──────────────────────────────────────────────
// Looksmaxing : pommettes saillantes, mâchoire en V, tiers faciaux équilibrés,
// rapport pommettes/mâchoire élevé (V-taper féminin).
function scoreStructure(lm) {
  const faceW  = dist(lm[L.lCheek],    lm[L.rCheek])
  const jawW   = dist(lm[L.lJaw],      lm[L.rJaw])
  const foreY  = lm[L.forehead].y
  const eyeY   = (lm[L.lEyeTop].y + lm[L.rEyeTop].y) / 2
  const noseY  = lm[L.noseTip].y
  const chinY  = lm[L.chin].y

  // V-taper féminin : jawW / cheekW → idéal ≈ 0.65–0.75
  const jawCheekRatio = jawW / Math.max(faceW, 0.001)
  // Score élevé si mâchoire plus étroite que pommettes (profil en V)
  const vDev = Math.max(0, jawCheekRatio - 0.70) / 0.70  // pénalise mâchoire large

  // Tiers faciaux (front→yeux | yeux→nez | nez→menton) → idéal égaux
  const t1 = Math.abs(eyeY  - foreY)
  const t2 = Math.abs(noseY - eyeY)
  const t3 = Math.abs(chinY - noseY)
  const tot = Math.max(t1 + t2 + t3, 0.001)
  const thirdsErr = Math.abs(t1 / tot - 1/3) + Math.abs(t2 / tot - 1/3) + Math.abs(t3 / tot - 1/3)

  // Pommettes saillantes proxy : ratio cheekW / faceH
  // Plus les pommettes sont larges par rapport à la hauteur → plus elles sont définies
  const faceH     = dist(lm[L.forehead], lm[L.chin])
  const cheekProminence = faceW / Math.max(faceH, 0.001)
  // Idéal ≈ 0.62–0.68 (pommettes larges mais visage pas trop rond)
  const cheekDev  = Math.abs(cheekProminence - 0.65) / 0.65

  const composite = vDev * 0.40 + thirdsErr * 0.35 + cheekDev * 0.25
  return scoreFromDev(composite, 200, 98)
}

// ── 5. QUALITÉ DE PEAU (/100) ─────────────────────────────────────────────────
// Proxy via la variance de profondeur Z des landmarks clés.
// Surface lisse → variance Z faible → peau nette.
function scoreSkin(lm) {
  const probe = [1, 10, 152, 33, 263, 61, 291, 234, 454, 168, 0, 17, 70, 300]
  const zVals = probe.map(i => lm[i]?.z ?? 0)
  const zMean = zVals.reduce((s, v) => s + v, 0) / zVals.length
  const zStd  = Math.sqrt(zVals.reduce((s, v) => s + (v - zMean) ** 2, 0) / zVals.length)

  // Variation déterministe basée sur les données réelles du visage
  const seed   = Math.abs(zMean * 10000 + zStd * 5000) % 100
  const jitter = (seed % 12) - 6  // ±6 pts de variation reproductible

  const raw = 86 - zStd * 160 + jitter
  return clamp(Math.round(raw), 50, 95)
}

// ── 6. PHOTOGÉNIE (/100) ──────────────────────────────────────────────────────
// Combinaison pondérée : les proportions et le regard pèsent le plus en photo.
function scorePhotogenie(sym, prop, reg, str, skin) {
  const raw = sym * 0.20 + prop * 0.28 + reg * 0.25 + str * 0.17 + skin * 0.10
  return clamp(Math.round(raw * 1.01), 50, 99)
}

// ── Export principal ──────────────────────────────────────────────────────────
export function computeFaceScores(lm) {
  if (!lm || lm.length < 468) return null

  const symmetry    = scoreSymmetry(lm)
  const proportions = scoreProportions(lm)
  const regard      = scoreRegard(lm)
  const structure   = scoreStructure(lm)
  const skin        = scoreSkin(lm)
  const photogenie  = scorePhotogenie(symmetry, proportions, regard, structure, skin)

  // Score total /100 — toutes les métriques ont un poids équilibré
  const total = clamp(
    Math.round(
      symmetry    * 0.20 +
      proportions * 0.20 +
      regard      * 0.18 +
      structure   * 0.18 +
      skin        * 0.10 +
      photogenie  * 0.14
    ),
    48, 98
  )

  // Classement percentile basé sur les standards looksmaxing
  let ranking = 'Top 50 %'
  if      (total >= 92) ranking = 'Top 1 %'
  else if (total >= 87) ranking = 'Top 5 %'
  else if (total >= 82) ranking = 'Top 10 %'
  else if (total >= 75) ranking = 'Top 20 %'
  else if (total >= 66) ranking = 'Top 35 %'

  // Score beauté /10 (looksmaxing scale)
  const beautyScore = (total / 10).toFixed(1)

  // Rang lettre (inspiré du système looksmaxing)
  let rank = 'C'
  if      (total >= 93) rank = 'S'
  else if (total >= 88) rank = 'A+'
  else if (total >= 83) rank = 'A'
  else if (total >= 77) rank = 'B+'
  else if (total >= 70) rank = 'B'
  else if (total >= 62) rank = 'C+'

  return { symmetry, proportions, regard, structure, skin, photogenie, total, ranking, beautyScore, rank }
}

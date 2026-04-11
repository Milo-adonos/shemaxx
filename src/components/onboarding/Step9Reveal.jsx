import { motion } from 'framer-motion'
import { useT } from '../../contexts/LangContext'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

// ── Défauts de démonstration par défaut ────────────────────────────────────
export const DEFAULT_DEFAUTS = [
  { zone: 'Sourcils',  probleme: 'Légère asymétrie — le gauche est plus haut que le droit',     conseil: 'Le mewing strict 24h/24 repositionne progressivement les os du visage. 1. Place toute la langue à plat contre le palais supérieur. 2. Garde les molaires légèrement en contact et les lèvres fermées. 3. Respire uniquement par le nez. Pratique constante sur 6 à 12 mois. Cherche "mewing tutorial" sur YouTube pour voir exactement la bonne position.' },
  { zone: 'Mâchoire',  probleme: 'Manque de définition latérale — contour peu marqué',           conseil: 'Le gua sha quotidien draine les fluides qui "gonflent" le visage et révèle l\'angle naturel de la mâchoire. 1. Applique une huile légère sur la peau propre. 2. Glisse le gua sha depuis l\'oreille vers le menton, pression ferme, 10 passages de chaque côté. 3. Mâche du Falim gum 30 à 45 min/jour pour développer les masséters. Résultats visibles en 4 à 8 semaines. Cherche "gua sha jawline" sur YouTube.' },
  { zone: 'Peau',      probleme: 'Irrégularités de texture visibles et éclat atténué',           conseil: 'Le rétinol renouvelle les cellules en profondeur et resserre les pores progressivement. 1. Commence avec le rétinol 0,025% (The Ordinary) 2 soirs/semaine. 2. Ajoute un sérum vitamine C 15% le matin pour l\'éclat et la protection. 3. SPF 50+ obligatoire chaque matin. Résultats visibles à partir de 6 semaines, peau lissée à 3 mois. Cherche "retinol routine débutant" sur YouTube.' },
  { zone: 'Regard',    probleme: 'Tilt canthal légèrement négatif — coins des yeux bas',         conseil: 'L\'exercice "eye lift" renforce les muscles orbitaux et remonte progressivement le coin des yeux. 1. Place les index sous les sourcils, pouces sur les pommettes. 2. Essaie de fermer les yeux contre la résistance de tes doigts, 10 secondes. 3. Répète 10 fois, 2 fois par jour. Le sommeil sur le dos (jamais sur le côté) évite les asymétries dues à la pression. Résultats en 3 à 6 mois. Cherche "fox eye exercise" sur YouTube.' },
  { zone: 'Nez',       probleme: 'Légère déviation du pont nasal — asymétrie perceptible',       conseil: 'Des exercices de posture nasale et de respiration renforcent les muscles et améliorent l\'alignement facial global. 1. Pratique la respiration nasale 100% du temps (ferme la bouche). 2. Fais l\'exercice "nose pinching" : pince doucement le nez, résiste à l\'air, 5 secondes, 10 répétitions. 3. Combine avec le mewing pour un effet structurant maximal. Cherche "nose exercise face yoga" sur YouTube pour les techniques visuelles.' },
]

// ── Mappage zones sélectionnées ↔ mots-clés dans les zones de défauts ─────
const ZONE_KEYWORDS = {
  jaw:    ['mâchoire', 'structure', 'visage', 'joue', 'mandibule', 'mentonnier', 'menton'],
  cheeks: ['pommette', 'joue', 'pommettes', 'joues'],
  eyes:   ['yeux', 'œil', 'regard', 'sourcil', 'cil', 'oeil', 'canthal', 'paupière'],
  nose:   ['nez', 'nasal', 'nasale', 'narine'],
}

/**
 * Retourne les défauts filtrés/réordonnés selon les zones choisies.
 * Garantit au moins un défaut par zone sélectionnée si disponible dans l'IA.
 */
function filterDefauts(defauts, zones) {
  if (!zones || !zones.selected || zones.selected.length === 0) return defauts
  if (zones.selected.includes('all')) return defauts

  const selected = zones.selected // ['jaw', 'eyes', 'nose', ...]
  const otherText = (zones.otherText || '').toLowerCase()

  // Score de pertinence pour chaque défaut
  const score = (d) => {
    const zone = d.zone.toLowerCase()
    const prob = d.probleme.toLowerCase()
    const text = zone + ' ' + prob

    // Cas "other" : match sur le texte libre saisi par l'utilisatrice
    if (selected.includes('other') && otherText) {
      const words = otherText.split(/\s+/).filter(w => w.length > 2)
      if (words.some(w => text.includes(w))) return 3
    }

    // Match sur les zones sélectionnées
    for (const zoneId of selected) {
      const keywords = ZONE_KEYWORDS[zoneId] || []
      if (keywords.some(kw => text.includes(kw))) return 2
    }

    return 0
  }

  // Tri : défauts pertinents d'abord, puis les autres
  const sorted = [...defauts].sort((a, b) => score(b) - score(a))

  // On s'assure d'avoir au moins un match par zone sélectionnée
  // Si aucun défaut IA ne matche une zone → on garde quand même tous les défauts
  // (l'IA a peut-être trouvé la même chose sous un autre nom)
  return sorted
}

// ── Icônes par zone ──────────────────────────────────────────────────────
const ZONE_ICONS = {
  nez:        { icon: '👃', color: '#e8608a' },
  nasal:      { icon: '👃', color: '#e8608a' },
  sourcil:    { icon: '〰️', color: '#b57cff' },
  yeux:       { icon: '👁️', color: '#5cc8ff' },
  regard:     { icon: '👁️', color: '#5cc8ff' },
  joue:       { icon: '◉',  color: '#f472b6' },
  mâchoire:   { icon: '⬟',  color: '#fb923c' },
  structure:  { icon: '⬟',  color: '#fb923c' },
  pommette:   { icon: '◈',  color: '#a78bfa' },
  peau:       { icon: '✦',  color: '#34d399' },
  front:      { icon: '▱',  color: '#60a5fa' },
  lèvres:     { icon: '◡',  color: '#f87171' },
  menton:     { icon: '◇',  color: '#fbbf24' },
  symétrie:   { icon: '⟺', color: '#cc3c69' },
  proportion: { icon: '⬡',  color: '#818cf8' },
}

function getZoneStyle(zone) {
  const z = zone.toLowerCase()
  for (const [key, val] of Object.entries(ZONE_ICONS)) {
    if (z.includes(key)) return val
  }
  return { icon: '◆', color: PINK }
}

// ── Indicateur d'impact visuel ────────────────────────────────────────────
function ImpactBar({ index, labels }) {
  const level = Math.max(1, 3 - Math.floor(index / 2))
  const colors = ['#ef4444', '#f97316', '#eab308']
  const color  = colors[3 - level] || colors[2]
  const label  = (labels ?? ['Impact fort', 'Impact moyen', 'À corriger'])[3 - level] ?? labels?.[2]
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map(i => (
        <div key={i} className="w-4 h-1 rounded-full"
          style={{ background: i <= level ? color : 'rgba(255,255,255,0.1)' }} />
      ))}
      <span className="text-[9px] font-bold uppercase tracking-wider ml-0.5"
        style={{ color }}>
        {label}
      </span>
    </div>
  )
}

export default function Step9Reveal({ onNext, pseudo = '', faceScores = null, zones = null }) {
  const t = useT()
  const rawDefauts = (faceScores?.defauts && faceScores.defauts.length > 0)
    ? faceScores.defauts
    : DEFAULT_DEFAUTS

  const defauts        = filterDefauts(rawDefauts, zones)
  const totalCount     = rawDefauts.length          // total réel (ex: 8)
  const visibleDefauts = defauts.slice(0, 5)        // on n'affiche que les 5 premiers
  const hiddenCount    = Math.max(0, defauts.length - 5) // ex: 3 cachés
  const count          = visibleDefauts.length

  // Texte de contexte selon les zones choisies
  const hasOther    = zones?.selected?.includes('other') && zones?.otherText?.trim()
  const zonesLabels = {
    jaw:    'ta mâchoire', cheeks: 'tes pommettes',
    eyes:   'tes yeux',   nose:   'ton nez', all: 'tout ton visage',
  }
  const selectedLabels = (zones?.selected || [])
    .filter(z => z !== 'all' && z !== 'other')
    .map(z => zonesLabels[z])
    .filter(Boolean)

  const contextHint = hasOther
    ? `concernant ${zones.otherText}`
    : selectedLabels.length > 0
    ? `sur ${selectedLabels.slice(0, 2).join(' et ')}`
    : 'sur ton visage'

  return (
    <div className="flex flex-col items-center"
      style={{ background: '#000', minHeight: '100%', paddingBottom: 100, position: 'relative' }}>

      {/* ── Ambient background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 400,
          background: `radial-gradient(ellipse, ${PINK_A(0.08)}, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: -100,
          width: 300, height: 300,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.04), transparent 70%)',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto px-5 pt-8">

        {/* ── Hero header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center">

          {/* Badge animé */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: PINK_A(0.12),
              border: `1px solid ${PINK_A(0.35)}`,
              backdropFilter: 'blur(8px)',
            }}>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
              🔍
            </motion.span>
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#ff4d88' }}>
              {t.step9Reveal.badge}
            </span>
          </motion.div>

          {/* Titre principal */}
          <h1 className="font-black text-white leading-tight mb-2"
            style={{ fontSize: 'clamp(1.7rem, 6vw, 2.2rem)' }}>
            +{count} {t.step9Reveal.improvementsDetected}<br />
            <span style={{ color: '#ff4d88' }}>{t.step9Reveal.detected}</span>{' '}
            <span className="text-white/40 font-medium text-xl">{contextHint}</span>
          </h1>

          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {t.step9Reveal.aiAnalyzed}<br />
            {t.step9Reveal.locked}
          </p>
        </motion.div>

        {/* ── Cartes défauts (5 premiers visibles) ── */}
        <div className="space-y-3 mb-4">
          {visibleDefauts.map((defaut, i) => {
            const style = getZoneStyle(defaut.zone)
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.09, type: 'spring', stiffness: 160, damping: 20 }}
                className="relative overflow-hidden rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                }}>

                {/* Glow latéral gauche coloré */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{ background: style.color, opacity: 0.7 }} />

                <div className="pl-4 pr-4 pt-3.5 pb-3">

                  {/* Ligne 1 : badge zone + impact */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{style.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: `${style.color}22`, color: style.color, border: `1px solid ${style.color}44` }}>
                        {defaut.zone}
                      </span>
                    </div>
                    <ImpactBar index={i} labels={[t.step9Reveal.impact.high, t.step9Reveal.impact.medium, t.step9Reveal.impact.low]} />
                  </div>

                  {/* Ligne 2 : problème détecté */}
                  <p className="text-sm font-semibold leading-snug mb-3"
                    style={{ color: 'rgba(255,255,255,0.88)' }}>
                    {defaut.probleme}
                  </p>

                  {/* Ligne 3 : conseil partiellement visible */}
                  <div className="rounded-xl px-3 pt-2.5 pb-2 relative overflow-hidden"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>

                    {/* Texte du conseil — début visible, fin floutée */}
                    <p className="text-[11px] leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.75)', userSelect: 'none', pointerEvents: 'none' }}>
                      {defaut.conseil.slice(0, 72)}{defaut.conseil.length > 72 ? '…' : ''}
                    </p>

                    {/* Lignes fantômes simulant la suite */}
                    <div className="mt-1.5 space-y-1.5" style={{ userSelect: 'none', pointerEvents: 'none' }}>
                      <div className="h-2 rounded-full" style={{ width: '90%', background: 'rgba(255,255,255,0.07)', filter: 'blur(1.5px)' }} />
                      <div className="h-2 rounded-full" style={{ width: '65%', background: 'rgba(255,255,255,0.05)', filter: 'blur(1.5px)' }} />
                    </div>

                    {/* Fondu vertical vers le bas */}
                    <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                      style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.85))' }} />

                    {/* Badge PRO + cadenas */}
                    <div className="absolute bottom-2 right-3 flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke={PINK_A(0.7)} strokeWidth="2.5" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${PINK}, #e8608a)`,
                          color: '#fff',
                          boxShadow: `0 0 8px ${PINK_A(0.4)}`,
                        }}>
                        PRO
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Carte "et encore plus..." ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + count * 0.09 + 0.1 }}
          className="relative overflow-hidden rounded-2xl mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>

          {/* Barre gauche dégradée */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: 'linear-gradient(180deg, #cc3c69, #a855f7, #3b82f6)' }} />

          <div className="pl-4 pr-4 pt-3.5 pb-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">✦</span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {t.step9Reveal.moreImprovements}
              </span>
            </div>

            {/* Lignes fantômes simulant d'autres défauts cachés */}
            <div className="space-y-2 mb-3">
              {[80, 60, 70].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <div className="h-2.5 rounded-full"
                    style={{ width: `${w}%`, background: 'rgba(255,255,255,0.05)', filter: 'blur(1px)' }} />
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold leading-snug"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              {t.step9Reveal.aiDetected}{' '}
              <span className="font-black" style={{ color: '#ff4d88' }}>
                {totalCount}{t.step9Reveal.totalLabel}
              </span>{' '}
              {t.step9Reveal.onlyVisible} {count} {t.step9Reveal.areVisible}
              {t.step9Reveal.unlockFull}
            </p>
          </div>
        </motion.div>

        {/* ── Bloc FOMO ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + count * 0.09 + 0.2 }}
          className="rounded-2xl px-4 py-4 mb-2 text-center"
          style={{
            background: PINK_A(0.06),
            border: `1px solid ${PINK_A(0.2)}`,
            backdropFilter: 'blur(8px)',
          }}>
          <p className="text-sm font-black text-white mb-1">
            {t.step9Reveal.fomoTitle(pseudo)}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t.step9Reveal.fomoSub1}<br />
            {t.step9Reveal.fomoSub2}
          </p>
        </motion.div>

      </div>

      {/* ── Bouton CTA fixé en bas ── */}
      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 180 }}
        whileTap={{ scale: 0.97 }}
        className="py-4 rounded-2xl font-black text-base text-white overflow-hidden relative"
        style={{
          position: 'fixed',
          bottom: 24, left: 20, right: 20, zIndex: 200,
          background: 'linear-gradient(135deg, #cc3c69, #e8608a)',
          boxShadow: '0 0 32px rgba(204,60,105,0.5), 0 8px 24px rgba(0,0,0,0.4)',
        }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', width: '60%' }}
        />
        <span className="relative z-10">{t.step9Reveal.cta}</span>
      </motion.button>
    </div>
  )
}

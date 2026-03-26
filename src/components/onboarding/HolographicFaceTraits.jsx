import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import HolographicHead3D from './HolographicHead3D'

const PINK   = '#cc3c69'
const PINK_B = '#ff4d88'
const PINK_A = (a) => `rgba(204,60,105,${a})`

/**
 * Landmarks MediaPipe pour chaque zone.
 * Photo capturée mirrorée → position X dans photo = (1 - lm.x) * 100 %
 * Position Y dans photo  = lm.y * 100 %
 *
 * La photo est affichée SANS object-cover (width:100%, height:auto) donc
 * les % landmarks correspondent 1:1 aux pixels de la photo. Aucune correction.
 *
 * Convention miroir :
 *  lm.x petit (orig gauche) → DROITE dans la photo
 *  lm.x grand  (orig droit) → GAUCHE dans la photo
 *
 * lm[10]  front centre           (x≈0.50 → 50% photo)
 * lm[473] iris droit orig        (x≈0.65 → 35% photo, œil GAUCHE visible)
 * lm[116] pommette gauche orig   (x≈0.28 → 72% photo, pommette DROITE)
 * lm[345] pommette droite orig   (x≈0.72 → 28% photo, joue GAUCHE)
 * lm[4]   pointe nez             (x≈0.50 → 50% photo)
 * lm[13]  lèvre sup centre       (x≈0.50 → 50% photo)
 * lm[365] angle mâchoire droit   (x≈0.73 → 27% photo, mâchoire GAUCHE)
 */
const LM_IDX = {
  skin:   10,
  eyes:   473,
  cheeks: 116,
  joue:   345,
  nose:   4,
  mouth:  13,
  jaw:    365,
}

// Fallback uniquement si landmarks absents (situation d'erreur)
const LM_FALLBACK = {
  skin:   { px: 50, py: 22 },
  eyes:   { px: 35, py: 40 },
  cheeks: { px: 70, py: 52 },
  joue:   { px: 30, py: 54 },
  nose:   { px: 50, py: 56 },
  mouth:  { px: 50, py: 66 },
  jaw:    { px: 29, py: 75 },
}

/**
 * Convertit un landmark en % de la photo.
 * Photo mirrorée horizontalement : x affiché = (1 - lm.x) * 100
 * Pas de correction object-cover : la photo est affichée à taille naturelle.
 */
function lmPct(lm) {
  if (!lm) return null
  return { px: (1 - lm.x) * 100, py: lm.y * 100 }
}

function buildZones(scores, lms) {
  const s  = (k, fb) => Math.round(Number(scores?.[k]) || fb)
  const pos = (id) => lmPct(lms?.[LM_IDX[id]]) ?? LM_FALLBACK[id]

  return [
    {
      id: 'skin',   label: 'Peau',      short: 'Texture & éclat',
      color: PINK_B, icon: '✦',
      score: s('skin', 80),
      ...pos('skin'),
      hint: 'Uniformité, pores et réflexion de la lumière : une base saine amplifie tous les autres atouts du visage.',
    },
    {
      id: 'eyes',   label: 'Yeux',      short: 'Regard & ouverture',
      color: PINK_B, icon: '◎',
      score: s('regard', 78),
      ...pos('eyes'),
      hint: 'Tilt canthal, symétrie des paupières et expressivité — facteurs clés de l\'harmonie du regard.',
    },
    {
      id: 'cheeks', label: 'Pommettes', short: 'Volume & lumière',
      color: PINK_B, icon: '◈',
      score: s('structure', 76),
      ...pos('cheeks'),
      hint: 'Saillie des pommettes et jeu de lumière sur les joues : pilier du V-taper féminin et de la photogénie.',
    },
    {
      id: 'joue',   label: 'Joue',      short: 'Galbe & symétrie',
      color: PINK_B, icon: '◉',
      score: Math.max(50, s('structure', 76) - 3),
      ...pos('joue'),
      hint: 'Volume et galbe de la joue : la symétrie des deux côtés et le ratio de remplissage influencent la jeunesse et la photogénie.',
    },
    {
      id: 'nose',   label: 'Nez',       short: 'Profil & proportions',
      color: PINK_B, icon: '◇',
      score: s('proportions', 74),
      ...pos('nose'),
      hint: 'Largeur relative, hauteur du dorsum et rapport avec la bouche : tout influence l\'équilibre global.',
    },
    {
      id: 'mouth',  label: 'Bouche',    short: 'Lèvres & sourire',
      color: PINK_B, icon: '◡',
      score: Math.min(99, s('proportions', 74) + 1),
      ...pos('mouth'),
      hint: 'Volume des lèvres, courbe du Cupidon et alignement avec le menton pour un sourire équilibré.',
    },
    {
      id: 'jaw',    label: 'Mâchoire',  short: 'Ligne & définition',
      color: PINK_B, icon: '⬟',
      score: Math.max(48, s('structure', 76) - 2),
      ...pos('jaw'),
      hint: 'Angle mandibulaire et finesse sous l\'oreille : structure qui cadre le visage et renforce la féminité.',
    },
  ]
}

// ── Marqueur individuel — point seul, sans label ─────────────────────────────
function ZoneMarker({ z, active, onSelect }) {
  const leftPct = z.px
  const topPct  = z.py

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${leftPct}%`,
        top:  `${topPct}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: active ? 20 : 10,
      }}
    >
      {/* Zone de tap large (52×52) */}
      <button
        type="button"
        aria-label={z.label}
        onClick={() => onSelect(active ? null : z.id)}
        className="relative flex items-center justify-center"
        style={{ width: 52, height: 52 }}
      >
        {/* Halo pulsant externe */}
        <motion.span
          className="absolute rounded-full pointer-events-none"
          animate={active
            ? { scale: [1, 1.7, 1], opacity: [0.8, 1, 0.8] }
            : { scale: [1, 1.35, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: active ? 1.0 : 2.4, repeat: Infinity }}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `1.5px solid ${PINK_B}`,
            boxShadow: active ? `0 0 16px ${PINK_A(0.75)}` : 'none',
          }}
        />
        {/* Anneau intermédiaire (actif seulement) */}
        {active && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 20, height: 20, borderRadius: '50%',
              border: `1px solid ${PINK_A(0.5)}`,
            }}
          />
        )}
        {/* Point central */}
        <motion.span
          animate={{ scale: active ? 1.35 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="relative rounded-full"
          style={{
            width: active ? 13 : 9,
            height: active ? 13 : 9,
            background: active
              ? `radial-gradient(circle, #ff82b0, ${PINK})`
              : PINK,
            boxShadow: active
              ? `0 0 20px ${PINK_A(0.95)}, 0 0 6px #fff`
              : `0 0 8px ${PINK_A(0.65)}`,
            transition: 'width 0.18s, height 0.18s',
          }}
        />
      </button>
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function HolographicFaceTraits({ faceScores = {}, photoUrl = null, photoLandmarks = null, unlocked = false }) {
  const [openId, setOpenId] = useState(null)
  const usePhoto = !!photoUrl

  const zones      = buildZones(faceScores, photoLandmarks)
  const activeZone = zones.find(z => z.id === openId)

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-center leading-relaxed px-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
        {usePhoto
          ? 'Touche les points sur ton visage pour voir l\'analyse par zone'
          : 'Scan holographique — touche les points lumineux pour voir ton potentiel par zone'}
      </p>

      {/* ── Zone image ── */}
      <div
        className="rounded-2xl overflow-hidden mx-auto"
        style={{
          border: `1px solid ${usePhoto ? PINK_A(0.4) : 'rgba(204,60,105,0.22)'}`,
          boxShadow: `0 0 28px ${PINK_A(0.12)}`,
          background: '#060608',
        }}
      >
        {usePhoto ? (
          /*
           * Photo affichée en taille NATURELLE (width:100%, height:auto).
           * Aucun object-cover → aucun crop → les % landmarks correspondent
           * exactement aux pixels de la photo.
           */
          <div className="relative w-full">
            <img
              src={photoUrl}
              alt="Ton visage"
              style={{ width: '100%', height: 'auto', display: 'block',
                filter: 'brightness(0.9) contrast(1.05)' }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.45) 100%)' }} />
            {/* Marqueurs positionnés par landmarks */}
            <div className="absolute inset-0 pointer-events-none">
              {zones.map((z) => (
                <ZoneMarker key={z.id} z={z} active={openId === z.id} onSelect={setOpenId} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 px-2">
            <div className="relative mx-auto w-full aspect-[3/4] max-w-[300px]">
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(204,60,105,0.15) 0%, transparent 55%)' }}>
                <HolographicHead3D />
              </div>
              {/* Marqueurs holographiques (fallback sans photo) */}
              <div className="absolute inset-0 pointer-events-none">
                {zones.map((z) => (
                  <ZoneMarker key={z.id} z={z} active={openId === z.id} onSelect={setOpenId} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Panel zone active ── */}
      <AnimatePresence mode="wait">
        {activeZone && (
          <motion.div
            key={activeZone.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0,  y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl overflow-hidden mx-1"
            style={{
              background: `linear-gradient(135deg, ${activeZone.color}12, rgba(0,0,0,0.4))`,
              border: `1px solid ${activeZone.color}40`,
            }}
          >
            <div className="px-4 py-3.5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                    style={{ background: `${activeZone.color}20`, border: `1px solid ${activeZone.color}40` }}>
                    {activeZone.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-none">{activeZone.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{activeZone.short}</p>
                  </div>
                </div>
                {/* Score — flouté si locked, visible si unlocked */}
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
                  style={{ background: `${activeZone.color}18`, border: `1px solid ${activeZone.color}35` }}>
                  <span className="font-black tabular-nums"
                    style={{ fontSize: 18, color: activeZone.color,
                      filter: unlocked ? 'none' : 'blur(6px)', opacity: 0.9 }}>
                    {activeZone.score}
                  </span>
                  <span className="text-xs font-bold" style={{ color: `${activeZone.color}80` }}>/100</span>
                </div>
              </div>

              {/* Description — floutée si locked, lisible si unlocked */}
              <div className="rounded-xl px-3 py-2.5 relative overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs leading-relaxed"
                  style={{ color: unlocked ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.7)',
                    filter: unlocked ? 'none' : 'blur(4px)', pointerEvents: unlocked ? 'auto' : 'none' }}>
                  {activeZone.hint}
                  {!unlocked && ' Débloque l\'analyse complète pour accéder aux recommandations personnalisées et routines adaptées.'}
                </p>
                {!unlocked && (
                  <div className="absolute bottom-0 inset-x-0 h-8 flex items-end justify-end px-2 pb-1.5 pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))` }}>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${PINK}, #e8608a)`, color: '#fff',
                        boxShadow: `0 0 8px ${PINK_A(0.5)}` }}>
                      PRO
                    </span>
                  </div>
                )}
              </div>

              <button onClick={() => setOpenId(null)}
                className="mt-2 w-full text-[10px] font-semibold text-center py-1"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                Fermer ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accordéons liste ── */}
      {!activeZone && (
        <div className="space-y-2">
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setOpenId(z.id)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${z.color}30`,
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0"
                style={{ background: z.color, boxShadow: `0 0 6px ${z.color}` }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{z.label}</p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{z.short}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs font-black tabular-nums px-2 py-0.5 rounded-md"
                  style={{ color: z.color, background: `${z.color}18` }}>
                  <span style={{ filter: unlocked ? 'none' : 'blur(5px)', opacity: 0.92 }}>{z.score}</span>
                  <span>/100</span>
                </span>
                <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import HolographicHead3D from './HolographicHead3D'

const PINK = '#ff4d88'

/**
 * Zones : coordonnées cx/cy dans le viewBox 200×260 (identique au SVG HolographicHead3D).
 * Ordre d’affichage des pastilles : peau → yeux → pommettes / mâchoire → nez → bouche (voir map order si besoin).
 */
function buildZones(scores) {
  const s = (k, fb) => Math.round(Number(scores?.[k]) || fb)
  return [
    {
      id: 'skin',
      label: 'Peau',
      short: 'Texture & éclat',
      scoreKey: 'skin',
      score: s('skin', 80),
      /** Front (larges plats du front, sous la ligne des cheveux) */
      cx: 100,
      cy: 56,
      hint: 'Uniformité, pores et réflexion de la lumière : une base saine amplifie tous les autres atouts du visage.',
    },
    {
      id: 'eyes',
      label: 'Yeux',
      short: 'Regard & ouverture',
      scoreKey: 'regard',
      score: s('regard', 78),
      /** Entre les deux yeux, hauteur des pupilles */
      cx: 100,
      cy: 100,
      hint: 'Tilt canthal, symétrie des paupières et expressivité — facteurs clés de l’harmonie du regard en photo et en réel.',
    },
    {
      id: 'cheeks',
      label: 'Pommettes',
      short: 'Volume & lumière',
      scoreKey: 'structure',
      score: s('structure', 76),
      /** Pommette gauche (côté cœur du visage) */
      cx: 56,
      cy: 118,
      hint: 'Saillie des pommettes et jeu de lumière sur les joues : pilier du V-taper féminin et de la photogénie.',
    },
    {
      id: 'jaw',
      label: 'Mâchoire',
      short: 'Ligne & définition',
      scoreKey: 'structure',
      score: Math.max(48, s('structure', 76) - 2),
      /** Angle mandibulaire droit (côté regard) */
      cx: 140,
      cy: 200,
      hint: 'Angle mandibulaire et finesse sous l’oreille : structure qui cadre le visage et renforce la féminité du profil.',
    },
    {
      id: 'nose',
      label: 'Nez',
      short: 'Profil & proportions',
      scoreKey: 'proportions',
      score: s('proportions', 74),
      /** Pointe / base du nez */
      cx: 100,
      cy: 152,
      hint: 'Largeur relative, hauteur du dorsum et rapport avec la bouche : tout influence l’équilibre global du tiers moyen.',
    },
    {
      id: 'mouth',
      label: 'Bouche',
      short: 'Lèvres & sourire',
      scoreKey: 'proportions',
      score: Math.min(99, s('proportions', 74) + 1),
      /** Centre de la bouche fermée */
      cx: 100,
      cy: 174,
      hint: 'Volume des lèvres, courbe du Cupidon et alignement avec le menton pour un sourire équilibré.',
    },
  ]
}

/** Repères 2D alignés sur le SVG hologramme (viewBox 200×260) */
function ZoneMarkersOverlay({ zones, activeId, onSelect }) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {zones.map((z) => {
        const active = activeId === z.id
        const leftPct = (z.cx / 200) * 100
        const topPct = (z.cy / 260) * 100
        return (
          <div
            key={z.id}
            className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          >
            <button
              type="button"
              aria-label={z.label}
              onClick={() => onSelect(active ? null : z.id)}
              className="relative flex items-center justify-center w-11 h-11 rounded-full"
            >
              {active && (
                <motion.span
                  className="absolute rounded-full border-2 border-[#ff4d88]"
                  style={{ width: 28, height: 28, marginLeft: -14, marginTop: -14, left: '50%', top: '50%' }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0.35, 0.85, 0.35], scale: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <span
                className="relative rounded-full shrink-0"
                style={{
                  width: active ? 12 : 9,
                  height: active ? 12 : 9,
                  background: active ? PINK : 'rgba(255,77,136,0.4)',
                  border: active ? 'none' : `1px solid ${PINK}`,
                  boxShadow: active ? '0 0 12px rgba(255,77,136,0.95)' : 'none',
                }}
              />
            </button>
            {(z.id === 'cheeks' || z.id === 'jaw') && (
              <span
                className="absolute top-1/2 -translate-y-1/2 w-3 h-px rounded"
                style={{
                  [z.id === 'cheeks' ? 'right' : 'left']: '100%',
                  marginRight: z.id === 'cheeks' ? 2 : undefined,
                  marginLeft: z.id === 'jaw' ? 2 : undefined,
                  background: PINK,
                  opacity: active ? 1 : 0.45,
                  boxShadow: `0 0 6px ${PINK}`,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function HolographicFaceTraits({ faceScores = {} }) {
  const zones = buildZones(faceScores)
  const [openId, setOpenId] = useState(null)

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-center leading-relaxed px-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
        Scan holographique — touche les points lumineux pour voir ton potentiel par zone
      </p>

      <div
        className="relative rounded-2xl overflow-hidden mx-auto"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(204,60,105,0.15) 0%, transparent 55%), #060608',
          border: '1px solid rgba(204,60,105,0.22)',
          boxShadow: 'inset 0 0 40px rgba(204,60,105,0.06), 0 0 24px rgba(204,60,105,0.12)',
        }}
      >
        <div className="py-4 px-2">
          <div className="relative mx-auto w-full max-w-[300px] aspect-[200/260]">
            <div className="absolute inset-0">
              <HolographicHead3D />
            </div>
            <ZoneMarkersOverlay zones={zones} activeId={openId} onSelect={setOpenId} />
          </div>
        </div>
      </div>

      {/* Accordéons : potentiel clair + texte flouté (aperçu premium) */}
      <div className="space-y-2">
        {zones.map((z) => {
          const open = openId === z.id
          return (
            <div
              key={z.id}
              className="rounded-xl overflow-hidden transition-colors"
              style={{
                background: open ? 'rgba(204,60,105,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${open ? 'rgba(204,60,105,0.35)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : z.id)}
                className="w-full flex items-center gap-3 px-3 py-3 text-left"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: PINK,
                    boxShadow: open ? `0 0 10px ${PINK}` : 'none',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white">{z.label}</p>
                  <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {z.short}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className="text-xs font-black tabular-nums px-2 py-0.5 rounded-md inline-flex items-baseline gap-0"
                    style={{
                      color: PINK,
                      background: 'rgba(204,60,105,0.15)',
                    }}
                  >
                    <span
                      className="select-none pointer-events-none"
                      style={{ filter: 'blur(5px)', opacity: 0.92 }}
                      aria-hidden
                    >
                      {z.score}
                    </span>
                    <span>/100</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className="transition-transform shrink-0"
                    style={{
                      color: 'rgba(255,255,255,0.35)',
                      transform: open ? 'rotate(180deg)' : 'none',
                    }}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-0 space-y-2 border-t border-white/5">
                      <div className="pt-2 flex items-baseline justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          Potentiel
                        </span>
                        <span
                          className="text-lg font-black tabular-nums inline-flex items-baseline gap-0"
                          style={{ color: PINK, textShadow: '0 0 16px rgba(255,77,136,0.4)' }}
                        >
                          <span
                            className="select-none pointer-events-none"
                            style={{ filter: 'blur(6px)', opacity: 0.92 }}
                            aria-hidden
                          >
                            {z.score}
                          </span>
                          <span>/100</span>
                        </span>
                      </div>
                      <p
                        className="text-xs leading-relaxed rounded-lg px-2 py-2"
                        style={{
                          color: 'rgba(255,255,255,0.55)',
                          filter: 'blur(5px)',
                          userSelect: 'none',
                          background: 'rgba(0,0,0,0.25)',
                        }}
                      >
                        {z.hint} Débloque l’analyse complète pour lire les recommandations détaillées, routines sur mesure et suivi
                        Shemaxx sur cette zone.
                      </p>
                      <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        🔒 Contenu détaillé réservé aux abonnées
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

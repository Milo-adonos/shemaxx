import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

const DEFAULT_SCORES = {
  symmetry: 87, proportions: 84, regard: 89, structure: 85, skin: 80, photogenie: 88,
  total: 86, ranking: 'Top 20 %', beautyScore: '8.6', rank: 'B+',
  defauts: [
    { zone: 'Sourcils', probleme: 'Légère asymétrie — le gauche est plus haut', conseil: 'Technique de mapping sourcils en 3 points pour rééquilibrer' },
    { zone: 'Structure', probleme: 'Manque de définition de la mâchoire', conseil: 'Exercices de Mewing + routine de contouring ciblée' },
    { zone: 'Peau', probleme: 'Quelques irrégularités de texture visibles', conseil: 'Protocole de soin exfoliant personnalisé + sérum vitamine C' },
  ],
}

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

const ZONE_ICONS = {
  nez: '👃', sourcils: '〰️', yeux: '👁️', joues: '◉', mâchoire: '⬟',
  lèvres: '◡', peau: '✦', front: '▱', pommettes: '◈', structure: '⬟',
  regard: '◎', visage: '◇', symétrie: '◈', proportions: '⬡',
}

function getZoneIcon(zone) {
  const z = zone.toLowerCase()
  for (const [key, icon] of Object.entries(ZONE_ICONS)) {
    if (z.includes(key)) return icon
  }
  return '◆'
}

export default function Step9Reveal({ onNext, pseudo = '', faceScores = null }) {
  const scores  = faceScores ?? DEFAULT_SCORES
  const defauts = Array.isArray(scores.defauts) && scores.defauts.length > 0
    ? scores.defauts
    : DEFAULT_SCORES.defauts

  const [userPhoto, setUserPhoto] = useState(null)
  const fileInputRef = useRef(null)

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setUserPhoto(url)
  }

  return (
    <div className="flex flex-col px-5 pt-6 items-center"
      style={{ background: '#000', position: 'relative', minHeight: '100%', paddingBottom: 96 }}>

      {/* Ambient glow */}
      <div className="absolute pointer-events-none"
        style={{
          top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 320, height: 320,
          background: `radial-gradient(circle, ${PINK_A(0.12)}, transparent 70%)`,
        }}
      />

      <div className="w-full" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header page ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'rgba(204,60,105,0.7)' }}>
            Résultats de ton analyse
          </p>
          <h1 className="text-2xl font-black text-white leading-tight">
            On a détecté des{' '}
            <span style={{ color: '#ff4d88' }}>points à améliorer</span>
          </h1>
        </motion.div>

        {/* ── CARTE RÉSULTATS ── */}
        <motion.div className="w-full max-w-sm mx-auto relative"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 140, damping: 18 }}
          style={{
            background: 'linear-gradient(160deg, #16121a 0%, #110e16 100%)',
            borderRadius: 28,
            overflow: 'hidden',
            border: '1px solid rgba(205,55,103,0.18)',
            boxShadow: '0 0 50px rgba(205,55,103,0.12), 0 20px 60px rgba(0,0,0,0.7)',
          }}>

          {/* Top glow */}
          <div className="absolute top-0 inset-x-0 h-40 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(205,55,103,0.2) 0%, transparent 65%)' }} />

          <div className="relative z-10 px-5 pt-5 pb-6">

            {/* 1. Branding header */}
            <div className="flex items-center justify-center mb-5">
              <span className="text-base font-black tracking-tight">
                <span style={{ color: '#cc3c69' }}>She</span>
                <span className="text-white">maxx</span>
              </span>
            </div>

            {/* 2. Profile row */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative shrink-0">
                <motion.div className="absolute rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ inset: -4, border: '2px solid rgba(205,55,103,0.7)', borderRadius: '50%',
                    boxShadow: '0 0 16px rgba(205,55,103,0.5)' }} />
                {/* Input fichier caché */}
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }} />

                {/* Bouton avatar cliquable */}
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center relative group"
                  style={{ background: 'linear-gradient(135deg, #1d1424, #231929)', border: '2px solid #cc3c69' }}>
                  {userPhoto ? (
                    <img src={userPhoto} alt="photo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="flex flex-col items-center gap-0.5">
                      {/* Icône galerie N&B */}
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="m21 15-5-5L5 21"/>
                      </svg>
                      {/* Badge "+" */}
                      <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: '#cc3c69', border: '2px solid #000', boxShadow: '0 0 8px rgba(204,60,105,0.6)' }}>
                        <span className="text-white font-black" style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                      </div>
                    </div>
                  )}
                  {/* Overlay hover si photo déjà chargée */}
                  {userPhoto && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <span style={{ fontSize: 16 }}>✎</span>
                    </div>
                  )}
                </button>
              </div>

              <div className="flex-1 min-w-0 ml-3">
                <p className="text-xl font-black text-white leading-tight truncate">
                  {pseudo || 'Mon analyse'}
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="shrink-0 rounded-2xl px-4 py-3 text-center relative overflow-hidden"
                style={{ background: 'rgba(205,55,103,0.1)', border: '1px solid rgba(205,55,103,0.3)',
                  backdropFilter: 'blur(8px)', minWidth: 80 }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 50% 100%, rgba(205,55,103,0.2), transparent 70%)' }} />
                <p className="text-[9px] uppercase tracking-widest font-bold relative z-10"
                  style={{ color: 'rgba(205,55,103,0.7)' }}>Total</p>
                <p className="text-3xl font-black leading-tight relative z-10"
                  style={{ color: '#ff4d88', textShadow: '0 0 20px rgba(255,77,136,0.5)' }}>{scores.total}</p>
              </div>
            </div>

            {/* 3. Classement */}
            <motion.div
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between rounded-2xl px-4 py-3 mb-4"
              style={{ background: 'rgba(205,55,103,0.07)', border: '1px solid rgba(205,55,103,0.18)',
                backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: 'rgba(205,55,103,0.2)' }}>🏆</div>
                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Classement global
                </span>
              </div>
              <span className="text-lg font-black" style={{ color: '#ff4d88' }}>{scores.ranking}</span>
            </motion.div>

            {/* 4. Grille 2×3 métriques */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Symétrie',           icon: '◈', key: 'symmetry'    },
                { label: 'Proportions',         icon: '⬡', key: 'proportions' },
                { label: 'Impact du regard',    icon: '◎', key: 'regard'      },
                { label: 'Structure du visage', icon: '⬟', key: 'structure'   },
                { label: 'Qualité de peau',     icon: '✦', key: 'skin'        },
                { label: 'Photogénie',          icon: '◇', key: 'photogenie'  },
              ].map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(6px)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span style={{ color: 'rgba(205,55,103,0.6)', fontSize: 11, flexShrink: 0 }}>{m.icon}</span>
                    <span className="text-xs font-semibold leading-tight"
                      style={{ color: 'rgba(255,255,255,0.5)' }}>{m.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <span className="text-xl font-black tabular-nums"
                      style={{ color: '#ff4d88', filter: 'blur(8px)', userSelect: 'none' }}>{scores[m.key]}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 5. Footer */}
            <motion.div className="flex items-center gap-3 mt-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <span className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.2)' }}>Analyse IA</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Défauts détectés par l'IA (verrouillés) ── */}
        <motion.div className="w-full max-w-sm mx-auto mt-4 mb-2"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{ background: 'rgba(205,55,103,0.15)', border: '1px solid rgba(205,55,103,0.3)' }}>
              🔍
            </div>
            <p className="text-sm font-bold text-white leading-tight">
              <span style={{ color: '#ff4d88' }}>+ de {defauts.length} défauts identifiés</span>
              {' '}— conseils verrouillés
            </p>
          </div>

          {/* Liste des défauts */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
            {defauts.map((defaut, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.08 }}
                style={{ borderBottom: i < defauts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>

                {/* Zone + problème */}
                <div className="flex items-start gap-3 px-4 pt-3 pb-1">
                  <span className="shrink-0 mt-0.5" style={{ color: PINK, fontSize: 12 }}>
                    {getZoneIcon(defaut.zone)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'rgba(205,55,103,0.7)' }}>{defaut.zone}</span>
                    <p className="text-xs font-semibold leading-snug mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.75)' }}>{defaut.probleme}</p>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 mt-1">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>

                {/* Conseil flou */}
                <div className="px-4 pb-3 pt-1 flex items-center gap-2">
                  <div className="h-px w-4 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <p className="text-[11px] leading-snug flex-1"
                    style={{
                      color: 'rgba(255,255,255,0.35)',
                      filter: 'blur(4px)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}>
                    {defaut.conseil}
                  </p>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: PINK }}>
                    Pro
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="text-xs text-center mt-3 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Débloque les conseils personnalisés pour corriger chaque défaut
          </motion.p>
        </motion.div>
      </div>

      {/* ── Bouton CTA fixé en bas ── */}
      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 180 }}
        whileTap={{ scale: 0.97 }}
        className="py-4 rounded-2xl font-black text-base text-white overflow-hidden"
        style={{
          position: 'fixed',
          bottom: 24, left: 20, right: 20, zIndex: 200,
          background: 'linear-gradient(135deg, #cc3c69, #e8608a)',
          boxShadow: '0 0 28px rgba(204,60,105,0.45), 0 8px 24px rgba(0,0,0,0.4)',
        }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', width: '60%' }}
        />
        <span className="relative z-10">Débloque avec Shemaxx Pro →</span>
      </motion.button>
    </div>
  )
}

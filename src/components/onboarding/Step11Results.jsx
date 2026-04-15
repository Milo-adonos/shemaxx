import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HolographicFaceTraits from './HolographicFaceTraits'
import { useAuth } from '../../contexts/AuthContext'
import { saveScans, loadScans, upsertProfile, startOneTimePayment } from '../../lib/supabase'
import { track } from '../../lib/posthog.js'
import { useT } from '../../contexts/LangContext'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

const METRICS = [
  { label: 'Symétrie',           icon: '◈', key: 'symmetry'    },
  { label: 'Proportions',        icon: '⬡', key: 'proportions' },
  { label: 'Impact du regard',   icon: '◎', key: 'regard'      },
  { label: 'Structure du visage',icon: '⬟', key: 'structure'   },
  { label: 'Qualité de peau',    icon: '✦', key: 'skin'        },
  { label: 'Photogénie',         icon: '◇', key: 'photogenie'  },
]

const DEFAULT_SCORES = {
  symmetry: 72, proportions: 68, regard: 75, structure: 70, skin: 65, photogenie: 78,
  total: 71, ranking: 'Top 50 %', beautyScore: '7.1',
  defauts: [
    { zone: 'Sourcils', probleme: 'Légère asymétrie — le gauche est plus haut', conseil: 'Pratique l\'exercice "brow lift exercise" chaque matin : pose deux doigts sous tes sourcils, appuie légèrement vers le haut puis essaie d\'abaisser tes sourcils contre la résistance. 3 séries de 10 contractions de 3 secondes. Applique de l\'huile de ricin sur les sourcils chaque soir pour favoriser une croissance symétrique. Résultats visibles en 4–8 semaines. Cherche "brow lift exercise" sur YouTube pour voir la technique exacte.' },
    { zone: 'Mâchoire', probleme: 'Manque de définition latérale — contour peu marqué', conseil: 'Le mewing strict repositionne progressivement la structure osseuse du visage. Place toute la langue à plat contre le palais supérieur, molaires légèrement en contact, lèvres fermées, respiration uniquement par le nez — pratique constante 24h/24. Ajoute 30 min de chewing gum dur (Falim ou Mastic de Chios, disponibles sur Amazon) par jour en alternant les deux côtés pour développer les masseters. Résultats sur la définition de mâchoire visibles en 6–18 mois. Cherche "mewing tutorial" sur YouTube ou TikTok.' },
    { zone: 'Peau',     probleme: 'Irrégularités de texture et éclat atténué', conseil: 'La niacinamide 10% (The Ordinary, disponible sur Amazon) réduit les pores visibles, unifie le teint et réduit les irrégularités en profondeur — applique matin et soir. Ajoute un exfoliant AHA/BHA (The Ordinary AHA 30% + BHA 2%) 2×/semaine le soir pour lisser la texture. Un SPF50+ chaque matin est obligatoire pour stopper la dégradation photo-induite. Résultats visibles en 3 semaines. Cherche "niacinamide routine" sur YouTube.' },
  ],
}

function scoreColor(s) {
  if (s >= 87) return '#10b981'
  if (s >= 72) return '#3b82f6'
  if (s >= 65) return '#f59e0b'
  return '#ef4444'
}
function scoreLabel(s) {
  if (s >= 87) return 'Excellent'
  if (s >= 72) return 'Bien'
  if (s >= 65) return 'Moyen'
  return 'À améliorer'
}

const ZONE_MAP = {
  nez:      { icon: '👃', color: '#e8608a' }, nasal:    { icon: '👃', color: '#e8608a' },
  sourcil:  { icon: '〰️', color: '#b57cff' }, yeux:     { icon: '👁️', color: '#5cc8ff' },
  regard:   { icon: '👁️', color: '#5cc8ff' }, joue:     { icon: '◉',  color: '#f472b6' },
  mâchoire: { icon: '⬟',  color: '#fb923c' }, structure:{ icon: '⬟',  color: '#fb923c' },
  pommette: { icon: '◈',  color: '#a78bfa' }, peau:     { icon: '✦',  color: '#34d399' },
  lèvres:   { icon: '◡',  color: '#f87171' }, front:    { icon: '▱',  color: '#60a5fa' },
}
function zoneStyle(zone) {
  const z = (zone || '').toLowerCase()
  for (const [k, v] of Object.entries(ZONE_MAP)) { if (z.includes(k)) return v }
  return { icon: '◆', color: PINK }
}

// ── Compteur animé ────────────────────────────────────────────────────────
function useCounter(target, duration = 1400, delayMs = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf
    const t = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delayMs)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [target, duration, delayMs])
  return val
}

// ── Barre de remplissage animée ───────────────────────────────────────────
function FillBar({ value, color, delayMs = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    let raf
    const t = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / 1100, 1)
        setW((1 - Math.pow(1 - p, 3)) * value)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delayMs)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [value, delayMs])
  return <div className="h-full rounded-full" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 6px ${color}55` }} />
}

// ── Amazon : URL adaptée à la région de l'utilisatrice ───────────────────────
function getAmazonDomain() {
  const lang = (navigator.language || navigator.languages?.[0] || 'fr').toLowerCase()
  if (lang.startsWith('en-us') || lang.startsWith('en-ca')) return 'amazon.com'
  if (lang.startsWith('en-gb') || lang.startsWith('en-au')) return 'amazon.co.uk'
  if (lang.startsWith('de')) return 'amazon.de'
  if (lang.startsWith('es')) return 'amazon.es'
  if (lang.startsWith('it')) return 'amazon.it'
  if (lang.startsWith('nl')) return 'amazon.nl'
  if (lang.startsWith('pl')) return 'amazon.pl'
  if (lang.startsWith('se') || lang.startsWith('sv')) return 'amazon.se'
  return 'amazon.fr'
}
function amazonUrl(query) {
  return `https://www.${getAmazonDomain()}/s?k=${encodeURIComponent(query)}`
}

// ── Produits Amazon ───────────────────────────────────────────────────────────
const AMAZON_PRODUCTS = [
  { keywords: ['gua sha', 'guasha'],                              name: 'Gua Sha',           desc: 'Drainage & sculpture du visage', emoji: '🪨', color: '#a78bfa', query: 'gua sha facial massage' },
  { keywords: ['falim', 'chewing-gum dur', 'chewing gum dur'],   name: 'Falim Gum',          desc: 'Mâchoire & masseters',           emoji: '🍬', color: '#fb923c', query: 'falim chewing gum hard' },
  { keywords: ['mastic de chios', 'mastic gum'],                 name: 'Mastic de Chios',    desc: 'Résine naturelle pour mâchoire', emoji: '🌿', color: '#34d399', query: 'mastic gum chios natural' },
  { keywords: ['derma roller', 'microneedling', 'dermastamp'],   name: 'Derma Roller 0.5mm', desc: 'Collagène & texture de peau',    emoji: '⚙️', color: '#60a5fa', query: 'derma roller 0.5mm face' },
  { keywords: ['rétinol', 'retinol', 'tretinoin', 'trétinoïne'],name: 'Rétinol Sérum',      desc: 'Renouvellement cellulaire',      emoji: '✨', color: '#fbbf24', query: 'retinol serum face anti aging' },
  { keywords: ['vitamine c', 'vitamin c', 'ce ferulic'],         name: 'Vitamine C Sérum',   desc: 'Éclat & synthèse du collagène',  emoji: '💛', color: '#facc15', query: 'vitamin c serum 15 percent face' },
  { keywords: ['niacinamide'],                                    name: 'Niacinamide 10%',    desc: 'Pores réduits, teint unifié',    emoji: '💧', color: '#38bdf8', query: 'niacinamide 10 percent serum ordinary' },
  { keywords: ['aha', 'bha', 'glycolique', 'glycolic', 'exfoliant acide'], name: 'AHA/BHA Exfoliant', desc: 'Lisse la texture en profondeur', emoji: '⚗️', color: '#f472b6', query: 'aha bha exfoliant peeling face ordinary' },
  { keywords: ['jade roller', 'rouleau de jade', 'face roller'], name: 'Jade Roller',         desc: 'Drainage lymphatique facial',    emoji: '💚', color: '#4ade80', query: 'jade roller face massage' },
  { keywords: ['peptide', 'peptides', 'copper peptide'],         name: 'Sérum Peptides',      desc: 'Fermeté & régénération',         emoji: '🔬', color: '#c084fc', query: 'copper peptide serum face firming' },
  { keywords: ['led', 'led rouge', 'omnilux'],                   name: 'Masque LED Rouge',    desc: 'Stimule le collagène',           emoji: '🔴', color: '#ef4444', query: 'led red light therapy mask face' },
  { keywords: ['spf', 'spf 50', 'protection solaire'],           name: 'SPF 50+ Visage',      desc: 'Protection UV quotidienne',      emoji: '☀️', color: '#fb923c', query: 'spf 50 face sunscreen daily' },
  { keywords: ['huile de ricin', 'castor oil'],                  name: 'Huile de Ricin',      desc: 'Croissance sourcils & cils',     emoji: '🌾', color: '#84cc16', query: 'castor oil eyebrow growth serum' },
  { keywords: ['acide hyaluronique', 'hyaluronic acid'],         name: 'Acide Hyaluronique',  desc: 'Hydratation intense',            emoji: '🫧', color: '#67e8f9', query: 'hyaluronic acid serum face hydration' },
]

function findProducts(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  return AMAZON_PRODUCTS.filter(p => p.keywords.some(kw => lower.includes(kw)))
}

// ── Parsing du conseil en étapes numérotées ───────────────────────────────────
function parseConseilSteps(text) {
  if (!text) return []
  // Cherche pattern "1. ... 2. ..."
  const parts = text.split(/(?=\d+\.\s)/).map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) {
    return parts.map(p => p.replace(/^\d+\.\s*/, '').trim())
  }
  // Cherche séparation par ". " avec majuscule après
  const sentences = text.match(/[^.!?]+[.!?]+/g)
  if (sentences && sentences.length >= 3) {
    const mid = Math.ceil(sentences.length / 2)
    return [
      sentences.slice(0, mid).join(' ').trim(),
      sentences.slice(mid).join(' ').trim(),
    ].filter(Boolean)
  }
  return [text]
}

// Extrait l'horizon de résultats du texte
function extractTimeline(text) {
  if (!text) return null
  const m = text.match(/(?:résultats?|visible[s]?|amélioration)[^.]*en\s+([\d–\-àà]+\s+(?:semaines?|mois|jours?))/i)
    || text.match(/en\s+([\d–\-à]+\s+(?:semaines?|mois|jours?))/i)
    || text.match(/([\d–\-]+\s+(?:semaines?|mois|jours?)\s+de\s+(?:pratique|résultat))/i)
  return m ? m[1] : null
}

// ── Chip produit Amazon (nouveau design) ─────────────────────────────────────
function ProductChip({ product }) {
  const url = amazonUrl(product.query)
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{ textDecoration: 'none' }}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all active:scale-[0.98]"
      style={{
        background: `linear-gradient(135deg, ${product.color}12, ${product.color}06)`,
        border: `1px solid ${product.color}30`,
        textDecoration: 'none',
      }}>
      {/* Emoji dans un cercle coloré */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
        style={{ background: `${product.color}18`, border: `1px solid ${product.color}25` }}>
        {product.emoji}
      </div>
      {/* Infos produit */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold leading-tight" style={{ color: '#fff' }}>{product.name}</p>
        <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.38)' }}>{product.desc}</p>
      </div>
      {/* Bouton Amazon */}
      <div className="shrink-0 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
        style={{ background: 'rgba(255,153,0,0.15)', border: '1px solid rgba(255,153,0,0.35)' }}>
        <svg width="12" height="12" viewBox="0 0 50 50" fill="#ff9900">
          <path d="M25 5C14 5 5 14 5 25s9 20 20 20 20-9 20-20S36 5 25 5zm9.5 27.5c-4.5 3-10.5 4.5-15.5 2.5-.5-.2-.1-.6.4-.4 4.5 1.5 9.5.5 13.5-2 .4-.3.8.1.4.4l-.8-.5zM36 31c-.5-.7-3.5-.3-4.8-.2-.4 0-.5-.3-.1-.5 2.3-1.7 6.1-1.2 6.5-.6.5.6-.1 4.5-2.3 6.4-.3.3-.7.1-.5-.2.5-1.3 1.6-4.1 1.2-4.9z"/>
        </svg>
        <span className="text-[10px] font-black" style={{ color: '#ff9900' }}>Amazon</span>
      </div>
    </a>
  )
}

// ── Carte conseil redessinée ──────────────────────────────────────────────────
function ConseilCard({ defaut, index }) {
  const [open, setOpen] = useState(index === 0)
  const zs       = zoneStyle(defaut.zone)
  const steps    = parseConseilSteps(defaut.conseil)
  const timeline = extractTimeline(defaut.conseil)
  const products = findProducts(defaut.conseil)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 160, damping: 20 }}
      className="relative overflow-hidden rounded-2xl cursor-pointer"
      onClick={() => setOpen(o => !o)}
      style={{
        background: open
          ? `linear-gradient(160deg, ${zs.color}12 0%, rgba(10,8,14,0.98) 100%)`
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${open ? zs.color + '45' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.3s ease',
      }}>

      {/* Barre latérale colorée */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: `linear-gradient(to bottom, ${zs.color}, ${zs.color}55)`, opacity: open ? 1 : 0.45, transition: 'opacity 0.3s' }} />

      {/* Header */}
      <div className="pl-5 pr-4 pt-3.5 pb-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icône zone dans un badge */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${zs.color}18`, border: `1px solid ${zs.color}30` }}>
              <span style={{ fontSize: 15 }}>{zs.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md"
                  style={{ background: `${zs.color}18`, color: zs.color }}>
                  {defaut.zone}
                </span>
                {!open && timeline && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                    ⏱ {timeline}
                  </span>
                )}
              </div>
              <p className="text-[13px] font-bold leading-snug mt-1" style={{ color: 'rgba(255,255,255,0.92)' }}>
                {defaut.probleme}
              </p>
            </div>
          </div>
          {/* Chevron */}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: open ? `${zs.color}22` : 'rgba(255,255,255,0.05)', border: `1px solid ${open ? zs.color + '35' : 'rgba(255,255,255,0.08)'}` }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke={open ? zs.color : 'rgba(255,255,255,0.35)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>

        {/* Contenu dépliable */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden">

              {/* Timeline badge */}
              {timeline && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ background: `${zs.color}15`, border: `1px solid ${zs.color}30` }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={zs.color} strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    <span className="text-[10px] font-bold" style={{ color: zs.color }}>
                      Résultats visibles en {timeline}
                    </span>
                  </div>
                </div>
              )}

              {/* Étapes numérotées */}
              <div className="mt-3 space-y-2.5">
                {steps.map((step, si) => (
                  <div key={si} className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: `${zs.color}08`, border: `1px solid ${zs.color}18` }}>
                    {steps.length > 1 && (
                      <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: `${zs.color}25`, border: `1px solid ${zs.color}40` }}>
                        <span className="text-[9px] font-black" style={{ color: zs.color }}>{si + 1}</span>
                      </div>
                    )}
                    {steps.length === 1 && (
                      <span style={{ color: zs.color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>✦</span>
                    )}
                    <p className="text-[12px] leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.82)' }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Produits Amazon */}
              {products.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em]"
                      style={{ color: 'rgba(255,255,255,0.22)' }}>
                      Produits recommandés
                    </span>
                    <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    {products.map((p, pi) => (
                      <ProductChip key={pi} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// ONGLET 1 — RÉSULTATS
// ── Picker de recadrage ───────────────────────────────────────────────────────
const CIRCLE = 220   // diamètre du cercle de preview (px)

function PhotoCropPicker({ src, onConfirm, onCancel }) {
  const [natSize, setNatSize] = useState(null)   // { w, h } taille naturelle
  const [zoom, setZoom]       = useState(1)      // 1 = photo entière visible, >1 = zoommé
  const [offset, setOffset]   = useState({ x: 0, y: 0 })

  const dragging   = useRef(false)
  const lastPt     = useRef(null)
  const lastDist   = useRef(null)
  const zoomRef    = useRef(1)       // version ref du zoom pour les handlers
  const natRef     = useRef(null)    // version ref de natSize

  const onImgLoad = (e) => {
    const ns = { w: e.target.naturalWidth, h: e.target.naturalHeight }
    setNatSize(ns)
    natRef.current = ns
  }

  // Scale qui fait tenir toute la photo dans le cercle (contain)
  const fitScale = natSize ? Math.min(CIRCLE / natSize.w, CIRCLE / natSize.h) : 1
  const totalScale = fitScale * zoom

  // Clamp : empêche de dépasser les bords de l'image
  const clampOff = (ox, oy, z, ns) => {
    if (!ns) return { x: 0, y: 0 }
    const fs = Math.min(CIRCLE / ns.w, CIRCLE / ns.h)
    const rw = ns.w * fs * z
    const rh = ns.h * fs * z
    return {
      x: Math.max(-(Math.max(0, rw - CIRCLE) / 2), Math.min(Math.max(0, rw - CIRCLE) / 2, ox)),
      y: Math.max(-(Math.max(0, rh - CIRCLE) / 2), Math.min(Math.max(0, rh - CIRCLE) / 2, oy)),
    }
  }

  const applyZoom = (newZ) => {
    const clamped = Math.max(1, Math.min(6, newZ))
    zoomRef.current = clamped
    setZoom(clamped)
    setOffset(o => clampOff(o.x, o.y, clamped, natRef.current))
  }

  const move = (dx, dy) => {
    setOffset(o => clampOff(o.x + dx, o.y + dy, zoomRef.current, natRef.current))
  }

  /* ── Souris ── */
  const onMouseDown = (e) => {
    dragging.current = true
    lastPt.current   = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }
  const onMouseMove = (e) => {
    if (!dragging.current || !lastPt.current) return
    move(e.clientX - lastPt.current.x, e.clientY - lastPt.current.y)
    lastPt.current = { x: e.clientX, y: e.clientY }
  }
  const onMouseUp = () => { dragging.current = false; lastPt.current = null }

  /* ── Touch ── */
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      dragging.current = true
      lastPt.current   = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastDist.current = Math.hypot(dx, dy)
    }
  }
  const onTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragging.current && lastPt.current) {
      move(e.touches[0].clientX - lastPt.current.x, e.touches[0].clientY - lastPt.current.y)
      lastPt.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2 && lastDist.current != null) {
      const dx   = e.touches[0].clientX - e.touches[1].clientX
      const dy   = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      applyZoom(zoomRef.current * dist / lastDist.current)
      lastDist.current = dist
    }
  }
  const onTouchEnd = () => { dragging.current = false; lastPt.current = null; lastDist.current = null }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(16px)' }}>

      <p className="text-white font-black text-lg mb-1">Recadre ta photo</p>
      <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Glisse · Zoom avec le curseur ou deux doigts
      </p>

      {/* Cercle interactif */}
      <div
        style={{
          width: CIRCLE, height: CIRCLE,
          borderRadius: '50%', overflow: 'hidden',
          position: 'relative',
          border: '3px solid #cc3c69',
          boxShadow: '0 0 40px rgba(204,60,105,0.5)',
          cursor: dragging.current ? 'grabbing' : 'grab',
          touchAction: 'none',
          background: '#0b0b0f',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Image à sa taille naturelle, scalée par totalScale */}
        <img
          src={src}
          onLoad={onImgLoad}
          alt=""
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width:  natSize?.w ?? 'auto',
            height: natSize?.h ?? 'auto',
            maxWidth: 'none', maxHeight: 'none',
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${totalScale})`,
            transformOrigin: 'center center',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Slider de zoom (desktop-friendly) */}
      <div className="flex items-center gap-3 mt-5 w-full">
        <span className="text-lg font-bold select-none" style={{ color: 'rgba(255,255,255,0.35)' }}>−</span>
        <input
          type="range" min={100} max={600} step={5}
          value={Math.round(zoom * 100)}
          onChange={(e) => applyZoom(Number(e.target.value) / 100)}
          style={{ flex: 1, accentColor: '#cc3c69', cursor: 'pointer', height: 4 }}
        />
        <span className="text-lg font-bold select-none" style={{ color: 'rgba(255,255,255,0.35)' }}>+</span>
      </div>
      <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Zoom {Math.round(zoom * 100)}%
      </p>

      <div className="flex gap-3 mt-6 w-full">
        <button onClick={onCancel}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
          Annuler
        </button>
        <button
          onClick={() => onConfirm({
            src,
            naturalW: natSize?.w ?? CIRCLE,
            naturalH: natSize?.h ?? CIRCLE,
            zoom,
            offsetX: offset.x,
            offsetY: offset.y,
          })}
          className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #cc3c69, #e8608a)', boxShadow: '0 0 20px rgba(204,60,105,0.45)' }}>
          Confirmer ✓
        </button>
      </div>
    </motion.div>
  )
}

// ── Slide 1 : carte résultats ─────────────────────────────────────────────────
function ResultsCard({ scores, pseudo, cardRef }) {
  const t = useT()
  const total        = scores.total ?? 71
  const displayTotal = useCounter(total, 1300, 200)
  const [pendingSrc, setPendingSrc] = useState(null)   // photo en attente de recadrage
  const [userPhoto,  setUserPhoto]  = useState(null)   // { src, posX, posY, scale }
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setPendingSrc(URL.createObjectURL(file))
    e.target.value = ''   // permet de re-sélectionner la même image
  }

  const handleCropConfirm = (photo) => {
    setUserPhoto(photo)
    setPendingSrc(null)
  }

  return (
    <>
    {/* ── Picker de recadrage (portal-like, par-dessus tout) ── */}
    <AnimatePresence>
      {pendingSrc && (
        <PhotoCropPicker
          src={pendingSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setPendingSrc(null)}
        />
      )}
    </AnimatePresence>

    <div ref={cardRef} className="relative overflow-hidden rounded-[28px]"
      style={{ background: 'linear-gradient(160deg, #16121a 0%, #110e16 100%)',
        border: '1px solid rgba(205,55,103,0.22)',
        boxShadow: '0 0 48px rgba(205,55,103,0.12), 0 20px 48px rgba(0,0,0,0.65)' }}>

      {/* Glow haut */}
      <div className="absolute top-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(205,55,103,0.2) 0%, transparent 65%)' }} />

      <div className="relative z-10 px-5 pt-5 pb-6">

        {/* ── Header : Shemaxx centré + TOTAL ── */}
        <div className="flex flex-col items-center mb-4 gap-1">
          <span className="text-base font-black tracking-tight">
            <span style={{ color: '#cc3c69' }}>She</span><span className="text-white">maxx</span>
          </span>
          <div className="rounded-2xl px-5 py-1.5 text-center relative overflow-hidden"
            style={{ background: 'rgba(205,55,103,0.12)', border: '1px solid rgba(205,55,103,0.35)', backdropFilter: 'blur(8px)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 110%, rgba(205,55,103,0.25), transparent 65%)' }} />
            <p className="text-[8px] uppercase tracking-widest font-bold relative z-10"
              style={{ color: 'rgba(205,55,103,0.8)' }}>Total</p>
            <p className="text-[32px] font-black leading-none relative z-10"
              style={{ color: '#ff4d88', textShadow: '0 0 20px rgba(255,77,136,0.55)' }}>{displayTotal}</p>
          </div>
        </div>

        {/* ── Photo seule, centrée ── */}
        <div className="flex justify-center mb-3" style={{ overflow: 'hidden' }}>
          <div className="relative">
            <motion.div className="absolute rounded-full pointer-events-none"
              animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.2, repeat: Infinity }}
              style={{ inset: -5, border: '2px solid rgba(205,55,103,0.75)', borderRadius: '50%' }} />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()}
              className="w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, #1d1424, #231929)', border: '2px solid #cc3c69' }}>
              {userPhoto ? (
                <img src={userPhoto.src} alt="photo"
                  style={(() => {
                    const CARD = 100
                    const fitS = Math.min(CARD / userPhoto.naturalW, CARD / userPhoto.naturalH)
                    const totalS = fitS * userPhoto.zoom
                    const ratio = CARD / CIRCLE
                    return {
                      position: 'absolute', top: '50%', left: '50%',
                      width: userPhoto.naturalW, height: userPhoto.naturalH,
                      maxWidth: 'none', maxHeight: 'none',
                      transform: `translate(calc(-50% + ${userPhoto.offsetX * ratio}px), calc(-50% + ${userPhoto.offsetY * ratio}px)) scale(${totalS})`,
                      transformOrigin: 'center center',
                      userSelect: 'none', pointerEvents: 'none',
                    }
                  })()}
                />
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                  <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#cc3c69', border: '2px solid #0d0d14', boxShadow: '0 0 8px rgba(204,60,105,0.6)' }}>
                    <span className="text-white font-black" style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Classement global — compact ── */}
        <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3"
          style={{ background: 'rgba(205,55,103,0.08)', border: '1px solid rgba(205,55,103,0.2)' }}>
          <div className="flex items-center gap-2 min-w-0 shrink">
            <span style={{ fontSize: 13, flexShrink: 0 }}>🏆</span>
            <span className="text-[12px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.results.card.globalRanking}</span>
          </div>
          <span className="text-[14px] font-black shrink-0 ml-2" style={{ color: '#ff4d88', whiteSpace: 'nowrap' }}>{scores.ranking}</span>
        </div>

        {/* ── Grille métriques 2×3 — cases compactes ── */}
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((m, i) => {
            const val = scores[m.key] ?? 70
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="rounded-xl px-3 pt-2 pb-2.5 flex flex-col"
                style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 80 }}>
                <div className="flex items-center gap-1 mb-1" style={{ overflow: 'hidden' }}>
                  <span style={{ color: 'rgba(205,55,103,0.65)', fontSize: 10, flexShrink: 0 }}>{m.icon}</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</span>
                </div>
                <span className="text-[26px] font-black tabular-nums leading-none mt-auto"
                  style={{ color: '#ff4d88', textShadow: '0 0 14px rgba(255,77,136,0.4)' }}>{val}</span>
                <div className="h-1 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <FillBar value={val} color="#ff4d88" delayMs={300 + i * 80} />
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </div>
    </>
  )
}

// ── Slide 2 : photo avec points débloqués ────────────────────────────────────
function FaceAnalysisSlide({ scores }) {
  const t = useT()
  return (
    <div className="pb-2">
      <div className="mb-3 text-center">
        <p className="text-base font-black text-white">{t.results.detail.zoneAnalysis}</p>
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Touche un point pour voir ta note
        </p>
      </div>
      <HolographicFaceTraits
        faceScores={scores}
        photoUrl={scores.photoUrl ?? null}
        photoLandmarks={scores.photoLandmarks ?? null}
        unlocked={true}
      />
    </div>
  )
}

// ── Grille d'analyse animée — uniquement sur le visage (ellipse) ─────────────
function FaceAnalysisGrid() {
  const COLS = 8, ROWS = 10
  // Pré-calcul des cellules avec leurs délais aléatoires (stable entre renders)
  const cells = useRef(
    Array.from({ length: ROWS * COLS }, (_, i) => ({
      key: i,
      delay: (i * 0.07 + Math.sin(i * 1.3) * 0.8 + 1) % 2.8,
      dur:   1.1 + ((i * 0.13) % 1.2),
    }))
  ).current

  return (
    /*
      Zone positionnée sur le visage de la femme dans l'image :
      - horizontalement : 20 %→80 % de la carte
      - verticalement   : 3 %→68 % de la carte
      L'ellipse clip-path délimite exactement la forme ovale du visage.
    */
    <div
      className="absolute pointer-events-none"
      style={{
        left:   '20%',
        right:  '20%',
        top:    '3%',
        bottom: '32%',
        zIndex: 2,
        /* Masque ovale qui épouse le visage */
        clipPath: 'ellipse(50% 50% at 50% 46%)',
        WebkitClipPath: 'ellipse(50% 50% at 50% 46%)',
      }}
    >
      {/* Grille de carrés */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows:    `repeat(${ROWS}, 1fr)`,
        gap: 2,
      }}>
        {cells.map(({ key, delay, dur }) => (
          <motion.div
            key={key}
            animate={{ opacity: [0, 0.75, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
            style={{
              border:       '1px solid rgba(255,77,136,0.85)',
              borderRadius: 1,
              background:   'rgba(204,60,105,0.06)',
            }}
          />
        ))}
      </div>

      {/* Ligne de scan horizontale */}
      <motion.div
        animate={{ top: ['2%', '96%', '2%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position:   'absolute',
          left: 0, right: 0,
          height:     2,
          background: 'linear-gradient(90deg, transparent 0%, #ff4d88 30%, #ff4d88 70%, transparent 100%)',
          boxShadow:  '0 0 10px #ff4d88, 0 0 24px rgba(255,77,136,0.55)',
          zIndex:     3,
        }}
      />
    </div>
  )
}

// ── Carte CTA fixe (toujours à gauche) ───────────────────────────────────────
function CtaScanCard({ onRefaire, currentScores }) {
  const t = useT()
  const { user, subscription } = useAuth()
  const [invites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(INVITE_KEY) || '0') } catch { return 0 }
  })
  const [payLoading, setPayLoading] = useState(false)
  const [payErr,     setPayErr]     = useState(null)

  // Vérifie si l'analyse hebdo gratuite est déjà utilisée
  const hasBonus = invites >= 5
  const weeklyFreeUsed = (() => {
    if (hasBonus) return false // bonus disponible → toujours gratuit
    try {
      const periodStart = subscription?.current_period_start
        ? new Date(subscription.current_period_start)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      return history.some(s => s.date && new Date(s.date) >= periodStart)
    } catch { return false }
  })()

  const needsPayment = weeklyFreeUsed && !hasBonus

  const handleClick = async () => {
    if (needsPayment) {
      setPayErr(null)
      setPayLoading(true)
      track('rescan_checkout_started', { reason: 'weekly_limit_reached' })
      try {
        await startOneTimePayment('rescan', currentScores)
      } catch (e) {
        setPayErr(e.message || 'Erreur paiement')
        setPayLoading(false)
      }
      return
    }
    track('rescan_started', { reason: hasBonus ? 'bonus_invite' : 'free_weekly' })
    if (hasBonus) {
      try { localStorage.setItem(INVITE_KEY, JSON.stringify(0)) } catch { /* ignore */ }
    }
    onRefaire()
  }

  return (
    <div className="relative rounded-[28px] overflow-hidden w-full select-none"
      style={{ minHeight: 'calc(100svh - 210px)', background: '#0d0d1a' }}>
      <img src="/woman-scan-placeholder.png" alt="scan"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 15%' }} />
      <FaceAnalysisGrid />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 45%, transparent 68%)', zIndex: 4 }} />

      {/* Badge analyse gratuite (bonus parrainage) */}
      {hasBonus && (
        <div className="absolute top-4 left-4 right-4 flex justify-center" style={{ zIndex: 6 }}>
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
            style={{ background: 'linear-gradient(135deg,#10b981,#34d399)',
              boxShadow: '0 4px 16px rgba(16,185,129,0.45)', color: '#fff' }}>
            🎁 {t.results.scan.freeAvailable}
          </motion.div>
        </div>
      )}

      {/* Bandeau quota épuisé */}
      {needsPayment && (
        <div className="absolute top-4 left-4 right-4 flex justify-center" style={{ zIndex: 6 }}>
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
            ⚡ {t.results.scan.freeScanUsed}
          </motion.div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 flex flex-col gap-2" style={{ zIndex: 5 }}>
        {payErr && (
          <p className="text-center text-xs font-semibold" style={{ color: '#f87171' }}>{payErr}</p>
        )}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleClick} disabled={payLoading}
          className="w-full py-3.5 rounded-full font-black text-base text-white flex items-center justify-center gap-2"
          style={{ background: hasBonus
            ? 'linear-gradient(135deg,#10b981,#34d399)'
            : needsPayment
              ? 'linear-gradient(135deg,#f59e0b,#fbbf24)'
              : 'linear-gradient(135deg,#cc3c69,#e8608a)',
            boxShadow: hasBonus
              ? '0 8px 32px rgba(16,185,129,0.5)'
              : needsPayment
                ? '0 8px 32px rgba(245,158,11,0.45)'
                : '0 8px 32px rgba(204,60,105,0.55)',
            opacity: payLoading ? 0.7 : 1 }}>
          {payLoading ? (
            <>⏳ Redirection Stripe…</>
          ) : hasBonus ? (
            <>🎁 {t.results.scan.scanAgain}</>
          ) : needsPayment ? (
            <>⚡ {t.results.scan.payScan}</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              {t.results.scan.rescan}
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

// ── Carte d'un scan historique ────────────────────────────────────────────────
function ScanCard({ scan, onShowDetail, onDelete }) {
  const t = useT()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dateStr = new Date(scan.date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Récupère la photo : depuis l'objet ou depuis la clé séparée (fallback quota)
  const photoUrl = scan.photoUrl || loadPhotoSeparately(scan.id)

  return (
    <div className="relative rounded-[28px] overflow-hidden w-full select-none"
      style={{ minHeight: 'calc(100svh - 210px)', background: '#0d0d1a' }}>

      {/* Photo ou placeholder animé */}
      {photoUrl ? (
        <img src={photoUrl} alt="scan"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0d1a 0%, #1a0a12 50%, #0d1018 100%)' }}>
          {[0,1,2,3].map(i => (
            <motion.div key={i}
              animate={{ scale: [1, 1.06+i*0.03, 1], opacity: [0.2-i*0.03, 0.45-i*0.07, 0.2-i*0.03] }}
              transition={{ duration: 2.2+i*0.6, repeat: Infinity, delay: i*0.35 }}
              className="absolute rounded-full"
              style={{ width: 70+i*55, height: 70+i*55, border: `1.5px solid ${PINK_A(0.5-i*0.1)}` }}
            />
          ))}
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: PINK_A(0.12), border: `2px solid ${PINK_A(0.5)}`, boxShadow: `0 0 32px ${PINK_A(0.3)}` }}>
            <span className="text-3xl">✦</span>
          </motion.div>
        </div>
      )}

      {/* Dégradé bas */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, transparent 68%)', zIndex: 4 }} />

      {/* Badge score */}
      {scan.total != null && (
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-baseline gap-1"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: `1px solid ${PINK_A(0.45)}`, zIndex: 5 }}>
          <span className="text-sm font-black" style={{ color: '#ff4d88' }}>{scan.total}</span>
          <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>/100</span>
        </div>
      )}

      {/* Bouton supprimer */}
      <div className="absolute top-4 left-4" style={{ zIndex: 5 }}>
        <AnimatePresence mode="wait">
          {!confirmDelete ? (
            <motion.button key="trash"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </motion.button>
          ) : (
            <motion.div key="confirm"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-1.5 rounded-full px-2 py-1"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <button onClick={(e) => { e.stopPropagation(); onDelete(scan.id) }}
                className="px-2.5 py-1 rounded-full text-[11px] font-black"
                style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}>
                Supprimer
              </button>
              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
                className="px-2 py-1 rounded-full text-[11px] font-semibold"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                Annuler
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contenu bas */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6" style={{ zIndex: 5 }}>
        <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.results.history.scanDate}</p>
        <p className="text-xl font-black text-white mb-4">{dateStr}</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onShowDetail}
          className="w-full py-3.5 rounded-full font-black text-base text-white flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}>
          {t.results.history.scanDate} →
        </motion.button>
      </div>
    </div>
  )
}

// ── Slide photo scan (slide 2 du carousel Scan) — KEPT for internal use ──────
function ScanPhotoCard({ scores, pseudo, onViewResults }) {
  const t = useT()
  const photoUrl = scores?.photoUrl ?? null
  const dateStr  = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="relative rounded-[28px] overflow-hidden w-full"
      style={{ minHeight: 'calc(100svh - 210px)', background: '#0d0d1a' }}>

      {/* Photo ou visuel abstrait */}
      {photoUrl ? (
        <img src={photoUrl} alt="scan"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0d1a 0%, #1a0a12 100%)' }}>
          {/* Anneaux radar animés */}
          {[0, 1, 2, 3].map(i => (
            <motion.div key={i}
              animate={{ scale: [1, 1.06 + i * 0.03, 1], opacity: [0.25 - i * 0.04, 0.5 - i * 0.08, 0.25 - i * 0.04] }}
              transition={{ duration: 2.2 + i * 0.6, repeat: Infinity, delay: i * 0.35 }}
              className="absolute rounded-full"
              style={{ width: 70 + i * 55, height: 70 + i * 55, border: `1.5px solid ${PINK_A(0.55 - i * 0.1)}` }}
            />
          ))}
          {/* Scan line tournant */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute"
            style={{ width: 230, height: 230, borderRadius: '50%',
              background: `conic-gradient(from 0deg, transparent 65%, ${PINK_A(0.35)} 88%, transparent 100%)` }}
          />
          {/* Icône centrale */}
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: PINK_A(0.12), border: `2px solid ${PINK_A(0.5)}`,
              boxShadow: `0 0 32px ${PINK_A(0.3)}` }}>
            <span className="text-3xl">✦</span>
          </motion.div>
          {/* Points cardinaux */}
          {[0, 1, 2, 3].map(i => {
            const a = (i / 4) * 2 * Math.PI - Math.PI / 2
            return (
              <motion.div key={i}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.45 }}
                style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%',
                  background: PINK, boxShadow: `0 0 8px ${PINK}`,
                  left: `calc(50% + ${Math.cos(a) * 95}px - 3.5px)`,
                  top:  `calc(50% + ${Math.sin(a) * 95}px - 3.5px)` }}
              />
            )
          })}
        </div>
      )}

      {/* Overlay dégradé bas */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 45%, transparent 75%)' }} />

      {/* Badge score en haut */}
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
          border: `1px solid ${PINK_A(0.4)}` }}>
        <span className="text-sm font-black" style={{ color: '#ff4d88' }}>{scores?.total ?? '—'}</span>
        <span className="text-[10px] font-bold text-white/40"> /100</span>
      </div>

      {/* Contenu bas */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {pseudo ? `Scan de ${pseudo}` : t.results.history.noHistory}
        </p>
        <p className="text-xl font-black text-white mb-4">{dateStr}</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onViewResults}
          className="w-full py-3.5 rounded-full font-black text-base text-white"
          style={{ background: 'linear-gradient(135deg, #cc3c69, #e8608a)',
            boxShadow: '0 8px 32px rgba(204,60,105,0.55)' }}>
          {t.results.detail.personalizedAdvice} →
        </motion.button>
      </div>
    </div>
  )
}

// ── Onglet Scan : carousel historique avec effet peek ────────────────────────
const HISTORY_KEY   = 'shemaxx_scan_history'
const PHOTO_PREFIX  = 'shemaxx_scan_photo_'

function savePhotoSeparately(scanId, photoUrl) {
  if (!scanId || !photoUrl) return
  try { localStorage.setItem(PHOTO_PREFIX + scanId, photoUrl) } catch { /* quota */ }
}

function loadPhotoSeparately(scanId) {
  if (!scanId) return null
  try { return localStorage.getItem(PHOTO_PREFIX + scanId) } catch { return null }
}
const DELETED_KEY   = 'shemaxx_scan_deleted'   // liste noire des IDs supprimés

// Empreinte de session stockée dans sessionStorage :
// survit aux hot-reloads Vite mais s'efface à la fermeture de l'onglet.
const SESSION_FP_KEY = 'shemaxx_session_fp'
function getSessionFP()        { try { return sessionStorage.getItem(SESSION_FP_KEY) } catch { return null } }
function setSessionFP(fp)      { try { sessionStorage.setItem(SESSION_FP_KEY, fp)   } catch { /* ignore */ } }

// ── Rendu Canvas de la carte résultats (pour export/partage) ─────────────────
async function buildResultsCanvas(scores) {
  // Charge Inter (même police que l'app) avant de dessiner
  await document.fonts.load('900 32px Inter')
  await document.fonts.load('700 12px Inter')
  await document.fonts.ready

  const DPR = 2
  const W = 390, H = 540
  const canvas = document.createElement('canvas')
  canvas.width  = W * DPR
  canvas.height = H * DPR
  const c = canvas.getContext('2d')
  c.scale(DPR, DPR)

  const PINK      = '#cc3c69'
  const PINK_TEXT = '#ff4d88'
  const PAD       = 18
  const FONT      = 'Inter, system-ui, -apple-system, sans-serif'

  function rrect(x, y, w, h, r) {
    c.beginPath()
    c.moveTo(x + r, y)
    c.lineTo(x + w - r, y)
    c.arcTo(x + w, y, x + w, y + r, r)
    c.lineTo(x + w, y + h - r)
    c.arcTo(x + w, y + h, x + w - r, y + h, r)
    c.lineTo(x + r, y + h)
    c.arcTo(x, y + h, x, y + h - r, r)
    c.lineTo(x, y + r)
    c.arcTo(x, y, x + r, y, r)
    c.closePath()
  }

  // ── Fond carte ──
  c.fillStyle = '#0f0c14'
  rrect(0, 0, W, H, 28); c.fill()

  // Glow rose en haut
  const glow = c.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.65)
  glow.addColorStop(0, 'rgba(205,55,103,0.32)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  c.fillStyle = glow
  rrect(0, 0, W, 180, 28); c.fill()

  // Bordure rose
  c.strokeStyle = 'rgba(205,55,103,0.4)'
  c.lineWidth = 1.5
  rrect(0.75, 0.75, W - 1.5, H - 1.5, 28); c.stroke()

  c.textBaseline = 'middle'
  let y = PAD + 14

  // ── Logo Shemaxx ──
  c.font = `900 22px ${FONT}`
  const sheW   = c.measureText('She').width
  const maxxW  = c.measureText('maxx').width
  const logoW  = sheW + maxxW
  c.textAlign  = 'left'
  c.fillStyle  = PINK_TEXT
  c.fillText('She', W / 2 - logoW / 2, y + 11)
  c.fillStyle = 'white'
  c.fillText('maxx', W / 2 - logoW / 2 + sheW, y + 11)
  y += 34

  // ── Badge TOTAL ──
  const bW = 112, bH = 60, bX = (W - bW) / 2
  c.fillStyle = 'rgba(204,60,105,0.14)'
  rrect(bX, y, bW, bH, 16); c.fill()
  c.strokeStyle = 'rgba(204,60,105,0.45)'
  c.lineWidth = 1
  rrect(bX + 0.5, y + 0.5, bW - 1, bH - 1, 16); c.stroke()

  c.textAlign = 'center'
  c.font = `700 9px ${FONT}`
  c.letterSpacing = '0.12em'
  c.fillStyle = 'rgba(204,60,105,0.9)'
  c.fillText(t.results.card.total, W / 2, y + 14)
  c.letterSpacing = '0'

  c.font = `900 34px ${FONT}`
  c.fillStyle = PINK_TEXT
  c.fillText(String(scores.total ?? 71), W / 2, y + 43)
  y += bH + 14

  // ── Score beauté ──
  c.font = `600 13px ${FONT}`
  c.textAlign = 'center'
  c.fillStyle = 'rgba(255,255,255,0.38)'
  c.fillText(`Score beauté : ${scores.beautyScore ?? '7.1'} / 10`, W / 2, y)
  y += 22

  // ── Classement global ──
  const rH = 40
  c.fillStyle = 'rgba(205,55,103,0.09)'
  rrect(PAD, y, W - PAD * 2, rH, 12); c.fill()
  c.strokeStyle = 'rgba(205,55,103,0.25)'; c.lineWidth = 1
  rrect(PAD + 0.5, y + 0.5, W - PAD * 2 - 1, rH - 1, 12); c.stroke()

  c.font = `600 12px ${FONT}`
  c.textAlign = 'left'; c.fillStyle = 'rgba(255,255,255,0.6)'
  c.fillText('🏆  Classement global', PAD + 12, y + rH / 2)
  c.font = `800 13px ${FONT}`
  c.textAlign = 'right'; c.fillStyle = PINK_TEXT
  c.fillText(scores.ranking || 'Top 50 %', W - PAD - 12, y + rH / 2)
  y += rH + 12

  // ── Grille métriques 2×3 ──
  const MKEYS = [
    { label: 'Symétrie',            key: 'symmetry'    },
    { label: 'Proportions',         key: 'proportions' },
    { label: 'Impact du regard',    key: 'regard'      },
    { label: 'Structure du visage', key: 'structure'   },
    { label: 'Qualité de peau',     key: 'skin'        },
    { label: 'Photogénie',          key: 'photogenie'  },
  ]
  const GAP = 8
  const cW  = (W - PAD * 2 - GAP) / 2
  const cH  = 70

  MKEYS.forEach((m, i) => {
    const col = i % 2, row = Math.floor(i / 2)
    const cx = PAD + col * (cW + GAP), cy = y + row * (cH + GAP)
    const val = scores[m.key] ?? 70

    c.fillStyle = 'rgba(255,255,255,0.04)'
    rrect(cx, cy, cW, cH, 14); c.fill()
    c.strokeStyle = 'rgba(255,255,255,0.1)'; c.lineWidth = 1
    rrect(cx + 0.5, cy + 0.5, cW - 1, cH - 1, 14); c.stroke()

    c.font = `600 11px ${FONT}`
    c.textAlign = 'left'; c.fillStyle = 'rgba(255,255,255,0.5)'
    c.fillText(m.label, cx + 12, cy + 20)

    c.font = `900 30px ${FONT}`
    c.fillStyle = PINK_TEXT
    c.fillText(String(val), cx + 12, cy + 50)

    // Barre de progression
    const barW = cW - 24, barH = 3, barY = cy + cH - 10
    c.fillStyle = 'rgba(204,60,105,0.15)'
    rrect(cx + 12, barY, barW, barH, 2); c.fill()
    c.fillStyle = PINK
    rrect(cx + 12, barY, barW * (val / 100), barH, 2); c.fill()
  })

  y += 3 * (cH + GAP) + 14

  // ── Watermark Shemaxx en bas ──
  c.font = `700 10px ${FONT}`
  c.textAlign = 'center'
  c.fillStyle = 'rgba(204,60,105,0.4)'
  c.fillText('shemaxx.com', W / 2, y)

  return canvas
}

// ── Modal détail d'un scan historique ────────────────────────────────────────
function ScanDetailModal({ scan, pseudo, onClose, currentScores = null }) {
  const t = useT()
  const [slideIdx,  setSlideIdx]  = useState(0)
  const carouselRef               = useRef(null)
  const cardRef                   = useRef(null)
  const [saving,    setSaving]    = useState(false)
  const [sharing,   setSharing]   = useState(false)

  const dateStr = new Date(scan.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const sc = scan.scores
    ? { ...scan.scores, photoUrl: scan.photoUrl, photoLandmarks: scan.photoLandmarks }
    : { total: scan.total, ranking: scan.ranking }

  // Capture le composant React exact tel qu'il est affiché → image pixel-perfect
  const captureCard = async () => {
    const { toBlob } = await import('html-to-image')
    const el = cardRef.current
    if (!el) throw new Error('Carte introuvable')
    const blob = await toBlob(el, { pixelRatio: 3, cacheBust: true })
    if (!blob) throw new Error('Capture échouée')
    return blob
  }

  const shareBlob = async (blob, title, text) => {
    const file = new File([blob], 'shemaxx-analyse.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text })
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'shemaxx-analyse.png'; a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    track('card_saved', { total: sc.total, ranking: sc.ranking })
    try {
      const blob = await captureCard()
      await shareBlob(blob, t.results.shareTitle, t.results.shareMsg(sc.total))
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const handleShare = async () => {
    setSharing(true)
    track('card_shared', { total: sc.total, ranking: sc.ranking })
    try {
      const blob = await captureCard()
      await shareBlob(blob, t.results.shareTitle2, t.results.shareMsg2(sc.total))
    } catch (e) { console.error(e) }
    setSharing(false)
  }

  const defauts  = currentScores?.defauts?.length > 0
    ? currentScores.defauts
    : (sc?.defauts?.length > 0 ? sc.defauts : DEFAULT_SCORES.defauts)
  const hasPhoto = !!(scan.photoUrl || scan.photoLandmarks)
  const slides   = hasPhoto ? ['carte', 'visage', 'conseils'] : ['carte', 'conseils']

  /* Suivi de l'index via scroll */
  const handleCarouselScroll = () => {
    const el = carouselRef.current
    if (!el || slides.length <= 1) return
    const max = el.scrollWidth - el.clientWidth
    const idx = max > 0 ? Math.round((el.scrollLeft / max) * (slides.length - 1)) : 0
    setSlideIdx(Math.max(0, Math.min(idx, slides.length - 1)))
  }

  const scrollToSlide = (i) => {
    const el = carouselRef.current
    if (!el) return
    /* largeur slide = 100% du carousel - paddingLeft(20) - paddingRight(20) + gap(12)
       Chaque slide fait calc(100%-40px) + 12px de gap entre elles */
    el.scrollTo({ left: i * (el.clientWidth - 40 + 12), behavior: 'smooth' })
    setSlideIdx(i)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#050508' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.35)' }}>{t.results.history.scanDate}</p>
          <p className="text-sm font-black text-white capitalize">{dateStr}</p>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)"
            strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* ── Carousel + dots (prend tout l'espace restant) ── */}
      <div className="flex-1 min-h-0 flex flex-col" style={{ overflow: 'hidden' }}>

        {/* Carousel horizontal — chaque slide scroll verticalement de façon indépendante */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex-1 min-h-0 flex"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollPaddingLeft: '20px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: 20,
            paddingRight: 20,
            gap: 12,
          }}>

          {/* Slide 1 — Carte résultats */}
          <div className="overflow-y-auto no-scrollbar"
            style={{ flex: '0 0 calc(100% - 40px)', scrollSnapAlign: 'start', minWidth: 0,
              paddingTop: 16, paddingBottom: 24 }}>
            <ResultsCard scores={sc} pseudo={pseudo} cardRef={cardRef} />
            {/* Boutons Enregistrer / Partager */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-sm transition-opacity active:opacity-70"
                style={{ background: 'rgba(204,60,105,0.12)', border: '1px solid rgba(204,60,105,0.35)', color: '#ff4d88' }}>
                {saving ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                )}
                {saving ? t.results.detail.saving : t.results.detail.save}
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-sm transition-opacity active:opacity-70"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                {sharing ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                )}
                {sharing ? t.results.detail.sharing : t.results.detail.share}
              </button>
            </div>
          </div>

          {/* Slide 2 — Photo avec points (si disponible) */}
          {hasPhoto && (
            <div className="overflow-y-auto no-scrollbar"
              style={{ flex: '0 0 calc(100% - 40px)', scrollSnapAlign: 'start', minWidth: 0,
                paddingTop: 16, paddingBottom: 16 }}>
              <div className="rounded-[24px]" style={{ background: '#0d0d1a' }}>
                <HolographicFaceTraits
                  faceScores={sc}
                  photoUrl={scan.photoUrl}
                  photoLandmarks={scan.photoLandmarks}
                  unlocked={true}
                />
              </div>
            </div>
          )}

          {/* Slide 3 — Conseils personnalisés */}
          <div className="overflow-y-auto no-scrollbar"
            style={{ flex: '0 0 calc(100% - 40px)', scrollSnapAlign: 'start', minWidth: 0,
              paddingTop: 16, paddingLeft: 4, paddingRight: 4, paddingBottom: 24 }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-1"
              style={{ color: 'rgba(255,255,255,0.3)' }}>{t.results.detail.personalizedAdvice}</p>
            <div className="flex flex-col gap-3 px-1">
              {defauts.map((d, i) => (
                <ConseilCard key={i} defaut={d} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Dots navigation */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-1.5 py-3 shrink-0">
            {slides.map((_, i) => (
              <button key={i} onClick={() => scrollToSlide(i)}
                style={{
                  height: 4, borderRadius: 9999, border: 'none', cursor: 'pointer',
                  background: slideIdx === i ? '#cc3c69' : 'rgba(255,255,255,0.18)',
                  width: slideIdx === i ? 18 : 4, transition: 'all 0.22s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Onglet Scan : carousel historique avec effet peek ────────────────────────
function TabScan({ scores, pseudo, onRescan, onShowDetail }) {
  const t = useT()
  const [scans,     setScans]     = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const scrollRef                 = useRef(null)
  const { user, refreshScans }    = useAuth()

  /* ── Sauvegarde + chargement de l'historique ── */
  useEffect(() => {
    // Empreinte : scanId unique généré à chaque analyse (ou total+ranking en fallback)
    const scanId      = scores?.scanId
    const fingerprint = scanId ? String(scanId) : `${scores?.total ?? ''}-${scores?.ranking ?? ''}`

    try {
      const stored  = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]')

      // Retire les scans supprimés
      const clean = stored.filter(s => !deleted.includes(s.id))

      // Même scan déjà sauvegardé dans cette session → charge + répare les defauts si manquants
      if (getSessionFP() === fingerprint) {
        // Si le scan en localStorage n'a pas de vrais defauts, on les injecte
        const repaired = clean.map(s => {
          const isMatch = (scanId && s.scanId === scanId) ||
            (scores?.total != null &&
              String(s.total) === String(scores?.total) &&
              String(s.ranking ?? '') === String(scores?.ranking ?? ''))
          // Réparer si : c'est le bon scan ET les nouvelles données ont de vrais defauts
          // ET les données stockées sont vides ou génériques (comparaison de contenu)
          const storedHasRealDefauts = s.scores?.defauts?.some(
            d => d?.probleme && !DEFAULT_SCORES.defauts.some(def => def.probleme === d.probleme)
          )
          const needsRepair = isMatch && scores?.defauts?.length > 0 && !storedHasRealDefauts
          if (!needsRepair) return s
          return {
            ...s,
            scores: s.scores
              ? { ...s.scores, defauts: scores.defauts }
              : { defauts: scores.defauts },
          }
        })
        const wasRepaired = repaired.some((s, i) => s !== clean[i])
        if (wasRepaired) {
          try { localStorage.setItem(HISTORY_KEY, JSON.stringify(repaired)) } catch { /* ignore */ }
        }
        setScans(repaired)
        return
      }

      // Vérifie si ce scanId (ou scores identiques récents) existe déjà dans l'historique
      const alreadyStored = clean.some(s => {
        // Si le nouveau scan a un scanId : comparaison stricte par ID uniquement
        if (scanId) return s.scanId === scanId
        // Fallback score+heure pour les très anciens scans sans scanId
        return (
          String(s.total) === String(scores?.total) &&
          String(s.ranking) === String(scores?.ranking) &&
          Math.abs(new Date(s.date) - Date.now()) < 60 * 60 * 1000
        )
      })
      if (alreadyStored) {
        setSessionFP(fingerprint)
        // Réparer les defauts génériques même pour un scan déjà connu
        const repaired = clean.map(s => {
          const isMatch = (scanId && s.scanId === scanId) ||
            (scores?.total != null &&
              String(s.total) === String(scores?.total) &&
              String(s.ranking ?? '') === String(scores?.ranking ?? ''))
          if (!isMatch || !scores?.defauts?.length) return s
          const storedHasRealDefauts = s.scores?.defauts?.some(
            d => d?.probleme && !DEFAULT_SCORES.defauts.some(def => def.probleme === d.probleme)
          )
          if (storedHasRealDefauts) return s
          return {
            ...s,
            scores: s.scores
              ? { ...s.scores, defauts: scores.defauts }
              : { defauts: scores.defauts },
          }
        })
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(repaired)) } catch { /* ignore */ }
        setScans(repaired)
        return
      }

      // Nouvelle analyse → sauvegarde
      setSessionFP(fingerprint)
      const newId = scanId ?? Date.now()
      // Sauvegarder la photo dans une clé séparée pour éviter les quotas
      if (scores?.photoUrl) savePhotoSeparately(newId, scores.photoUrl)

      const current = {
        id:             newId,
        scanId:         scanId ?? null,
        date:           new Date().toISOString(),
        createdAt:      new Date().toISOString(),
        photoUrl:       scores?.photoUrl       ?? null,
        photoLandmarks: scores?.photoLandmarks ?? null,
        total:          scores?.total          ?? null,
        ranking:        scores?.ranking        ?? null,
        scores: scores ? {
          symmetry:    scores.symmetry,
          proportions: scores.proportions,
          regard:      scores.regard,
          structure:   scores.structure,
          skin:        scores.skin,
          photogenie:  scores.photogenie,
          total:       scores.total,
          ranking:     scores.ranking,
          beautyScore: scores.beautyScore,
          defauts:     scores.defauts,
        } : null,
      }
      const updated = [current, ...clean].slice(0, 8)

      // Sync vers Supabase si connecté
      if (user) {
        saveScans(user.id, updated.map(s => ({
          ...s.scores,
          scanId:    s.scanId ?? String(s.id),
          createdAt: s.date ?? s.createdAt,
        }))).then(refreshScans).catch(() => { /* silencieux */ })
      }

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      } catch {
        // Retry sans photos
        const noPhotos = updated.map(s => ({ ...s, photoUrl: null, photoLandmarks: null }))
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(noPhotos))
        } catch {
          // Retry avec conseils tronqués (max 400 chars par conseil)
          const slim = noPhotos.map(s => ({
            ...s,
            scores: s.scores ? {
              ...s.scores,
              defauts: (s.scores.defauts || []).map(d => ({
                ...d,
                conseil: d.conseil ? d.conseil.slice(0, 400) : d.conseil,
              })),
            } : null,
          }))
          try { localStorage.setItem(HISTORY_KEY, JSON.stringify(slim)) } catch { /* ignore */ }
        }
      }
      setScans(updated)
    } catch {
      setScans([])
    }
  }, [])

  /* ── Suppression définitive d'un scan ── */
  const handleDelete = (id) => {
    // 1. Retire du state
    const updated = scans.filter(s => s.id !== id)
    setScans(updated)
    // 2. Retire de l'historique en localStorage
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
    // 3. Ajoute à la liste noire → ce scan ne pourra jamais revenir
    try {
      const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]')
      const newDeleted = [...new Set([...deleted, id])].slice(-50) // garde 50 entrées max
      localStorage.setItem(DELETED_KEY, JSON.stringify(newDeleted))
    } catch { /* ignore */ }
    // 4. Ajuste l'index actif si nécessaire
    const newTotal = 1 + updated.length
    if (activeIdx >= newTotal) setActiveIdx(Math.max(0, newTotal - 1))
  }

  // Historique : du plus ancien (gauche) au plus récent (droite)
  const historyScans = [...scans].reverse()
  // Total slides = 1 (CTA fixe) + scans
  const totalSlides  = 1 + historyScans.length

  /* ── Suivi de l'index actif ── */
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || totalSlides <= 1) return
    const max = el.scrollWidth - el.clientWidth
    const idx = max > 0 ? Math.round((el.scrollLeft / max) * (totalSlides - 1)) : 0
    setActiveIdx(Math.max(0, Math.min(idx, totalSlides - 1)))
  }

  const scrollToIdx = (i) => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    el.scrollTo({ left: i * ((el.clientWidth - 52) + 12), behavior: 'smooth' })
    setActiveIdx(i)
  }

  return (
    <div className="pt-3 pb-8 flex flex-col gap-4">

      {/* ── Carousel avec effet peek ── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex"
        style={{
          overflowX: 'auto', scrollSnapType: 'x mandatory', scrollPaddingLeft: '20px',
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
          paddingLeft: 20, paddingRight: 20, gap: 12,
        }}>

        {/* Carte CTA — toujours en premier à gauche */}
        <div style={{ flex: '0 0 calc(100% - 52px)', scrollSnapAlign: 'start', minWidth: 0 }}>
          <CtaScanCard onRefaire={onRescan} currentScores={scores} />
        </div>

        {/* Analyses historiques — du plus ancien au plus récent */}
        {historyScans.map((scan) => (
          <div key={scan.id}
            style={{ flex: '0 0 calc(100% - 52px)', scrollSnapAlign: 'start', minWidth: 0 }}>
            <ScanCard
              scan={scan}
              onShowDetail={() => onShowDetail?.(scan)}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {/* ── Dots ── */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button key={i} onClick={() => scrollToIdx(i)}
              style={{
                height: 4, borderRadius: 9999, border: 'none', cursor: 'pointer',
                background: activeIdx === i ? '#cc3c69' : 'rgba(255,255,255,0.18)',
                width: activeIdx === i ? 18 : 4, transition: 'all 0.22s ease',
              }}
            />
          ))}
        </div>
      )}

    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// ONGLET 2 — CONSEILS
// ════════════════════════════════════════════════════════════════════════
function TabConseils({ defauts }) {
  const t = useT()
  return (
    <div className="px-4 pt-4 pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-5">
        <h2 className="text-xl font-black text-white mb-1">Tes conseils personnalisés</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Basés sur ton analyse réelle. Appuie pour lire chaque conseil.
        </p>
      </motion.div>

      <div className="space-y-3">
        {defauts.map((d, i) => <ConseilCard key={i} defaut={d} index={i} />)}
      </div>

      {/* Bloc progression */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5 rounded-2xl px-4 py-4"
        style={{ background: 'linear-gradient(135deg, rgba(204,60,105,0.08), rgba(139,92,246,0.06))',
          border: '1px solid rgba(204,60,105,0.18)' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <p className="text-sm font-black text-white mb-1">Plan sur 7 jours</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Applique ces conseils chaque jour cette semaine. Dans 7 jours, refais une analyse pour voir ta progression — la plupart des utilisatrices voient déjà une différence en une semaine !
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// ONGLET 3 — EXTRAS
// ════════════════════════════════════════════════════════════════════════
// ── Helpers IA pour Extras ───────────────────────────────────────────────────

// Appelle la Edge Function Supabase sécurisée — la clé OpenAI n'est jamais exposée côté client
async function callExtrasAI(payload) {
  const url     = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extras-ai`
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const resp = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        anonKey,
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await resp.json()
  if (!resp.ok) throw new Error(data?.error || `Erreur serveur ${resp.status}`)
  return data
}

async function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1])
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

// Retourne la data URI complète (data:image/...;base64,...) pour Fal.ai
async function toDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

// Compresse l'image en JPEG max 800px via Canvas
async function compressToJpeg(file, maxPx = 800, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const blobUrl = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const cv = document.createElement('canvas')
      cv.width = w; cv.height = h
      cv.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(blobUrl)
      cv.toBlob(blob => blob
        ? resolve(new File([blob], 'face.jpg', { type: 'image/jpeg' }))
        : reject(new Error('Compression échouée')),
        'image/jpeg', quality)
    }
    img.onerror = () => reject(new Error('Lecture image échouée'))
    img.src = blobUrl
  })
}

// Transformation de style via Edge Function → GPT-image-1 (image edit)
async function transformStyleWithOpenAI(file, stylePrompt) {
  const compressed   = await compressToJpeg(file, 1024, 0.92)
  const imageBase64  = await toBase64(compressed)
  const data = await callExtrasAI({ type: 'style_transform', imageBase64, prompt: stylePrompt })
  if (!data.b64_json) throw new Error('Réponse inattendue du serveur')
  return `data:image/png;base64,${data.b64_json}`
}

async function describePersonWithGPT(base64) {
  const data = await callExtrasAI({ type: 'describe_person', imageBase64: base64 })
  return data.description ?? 'a young woman with natural features'
}

async function generateWithDALLE(prompt) {
  const data = await callExtrasAI({ type: 'generate_image', prompt })
  if (data.error) throw new Error(data.error)
  return data.url ?? null
}

// ── Outil 1 : Qui est la plus belle ? ────────────────────────────────────────

// Découpe un visage via Canvas — centré sur le milieu du bbox, taille = max(w,h) × 1.35
async function cropFaceToDataUrl(imgSrc, bbox, outputSize = 180) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const W = img.naturalWidth
      const H = img.naturalHeight
      // Centre exact du visage selon le bbox
      const faceCx = (bbox.x + bbox.w / 2) * W
      const faceCy = (bbox.y + bbox.h / 2) * H
      // Côté = plus grande dimension du visage × 1.35 (assez pour voir le visage complet)
      const faceW  = bbox.w * W
      const faceH  = bbox.h * H
      const side   = Math.max(faceW, faceH) * 1.35
      // Coin supérieur gauche du crop, centré sur le visage
      const fsx = Math.max(0, Math.min(W - side, faceCx - side / 2))
      const fsy = Math.max(0, Math.min(H - side, faceCy - side / 2))
      const canvas = document.createElement('canvas')
      canvas.width  = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, fsx, fsy, side, side, 0, 0, outputSize, outputSize)
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => resolve(null)
    img.src = imgSrc
  })
}

function FaceAvatar({ src, size = 52, rank = 0, glow = false }) {
  const rankColors = ['#ff4d88', '#f59e0b', '#a3a3a3']
  const borderColor = glow ? (rankColors[rank] ?? '#ff4d88') : 'rgba(255,255,255,0.12)'
  const shadow = glow ? `0 0 18px ${rankColors[rank] ?? '#ff4d88'}66` : 'none'
  return src ? (
    <img src={src} alt="" className="rounded-full shrink-0 object-cover"
      style={{ width: size, height: size, border: `2.5px solid ${borderColor}`, boxShadow: shadow }} />
  ) : (
    <div className="rounded-full shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, background: 'rgba(255,255,255,0.07)',
        border: `2px solid ${borderColor}`, boxShadow: shadow }}>
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </div>
  )
}

function ExtrasGroupRanking({ onBack }) {
  const t = useT()
  const [phase, setPhase]       = useState('upload') // upload | loading | result
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)  // { girls, winner_id, winner_reason }
  const [faceCrops, setFaceCrops] = useState({})  // { id: dataUrl }
  const [error, setError]       = useState(null)
  const inputRef = useRef()

  const handleFile = (f) => { setFile(f); setPreview(URL.createObjectURL(f)); setError(null) }

  const analyze = async () => {
    setPhase('loading'); setError(null)
    try {
      const b64 = await toBase64(file)
      const raw = await callExtrasAI({ type: 'group_ranking', imageBase64: b64 })
      if (!raw.girls?.length) throw new Error(t.results.extras.groupRanking.noFace)
      const expected = raw.total_faces ?? raw.girls.length
      console.log(`[Looksmaxxing] ${raw.girls.length}/${expected} visages détectés`)

      // Génère les crops canvas pour chaque visage
      const crops = {}
      await Promise.all(raw.girls.map(async (g) => {
        if (g.bbox) {
          crops[g.id] = await cropFaceToDataUrl(preview, g.bbox, 140)
        }
      }))

      setFaceCrops(crops)
      setResult(raw)
      setPhase('result')
    } catch (e) {
      setError(e.message || 'Erreur lors de l\'analyse.')
      setPhase('upload')
    }
  }

  const reset = () => { setPhase('upload'); setFile(null); setPreview(null); setResult(null); setFaceCrops({}); setError(null) }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 className="text-base font-black text-white">{t.results.extras.groupRanking.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">

        {/* ── Upload ── */}
        {phase === 'upload' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <button onClick={() => inputRef.current?.click()}
              className="w-full rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ minHeight: 220, background: 'rgba(255,255,255,0.04)',
                border: `2px dashed ${preview ? PINK_A(0.5) : 'rgba(255,255,255,0.12)'}` }}>
              {preview
                ? <img src={preview} alt="" className="w-full object-cover rounded-2xl" style={{ maxHeight: 320 }} />
                : <div className="flex flex-col items-center gap-3 py-12">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>{t.results.extras.groupRanking.import}</span>
                  </div>
              }
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {preview && (
              <button onClick={() => inputRef.current?.click()} className="text-xs font-bold text-center"
                style={{ color: 'rgba(255,255,255,0.3)' }}>Changer la photo</button>
            )}
            {error && (
              <div className="rounded-xl px-4 py-3 text-xs text-center"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
            {file && (
              <>
                <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }} onClick={analyze}
                  className="w-full py-4 rounded-2xl font-black text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)', boxShadow: '0 6px 24px rgba(204,60,105,0.4)' }}>
                  {t.results.extras.groupRanking.analyze}
                </motion.button>
                <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Paiement sécurisé — résultats immédiats
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* ── Loading ── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#ff4d88', borderRightColor: PINK_A(0.3) }} />
            <p className="text-sm font-bold text-white">{t.results.extras.groupRanking.analyzing}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.results.extras.groupRanking.analyzing2}</p>
          </div>
        )}

        {/* ── Résultats ── */}
        {phase === 'result' && result && (() => {
          const sorted = [...result.girls].sort((a, b) => b.score - a.score)
          const winner = sorted[0]
          const RANK_LABELS = ['La plus hot 🔥', '2e place', '3e place']

          return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header photo originale */}
              <div className="rounded-2xl overflow-hidden mb-4" style={{ maxHeight: 180 }}>
                <img src={preview} alt="" className="w-full object-cover object-top" style={{ maxHeight: 180 }} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t.results.extras.groupRanking.ranking}
              </p>

              <div className="space-y-2.5">
                {sorted.map((g, i) => {
                  const isFirst   = i === 0
                  const cropUrl   = faceCrops[g.id] ?? null
                  const rankLabel = RANK_LABELS[i] ?? `${i + 1}e place`
                  const bgColor   = isFirst
                    ? 'linear-gradient(135deg,rgba(204,60,105,0.22),rgba(204,60,105,0.06))'
                    : i === 1 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)'
                  const borderColor = isFirst ? PINK_A(0.45) : i === 1 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)'

                  return (
                    <motion.div key={g.id}
                      initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3"
                      style={{ background: bgColor, border: `1px solid ${borderColor}` }}>

                      {/* Rang */}
                      <span className="text-sm font-black w-5 text-center shrink-0"
                        style={{ color: isFirst ? '#ff4d88' : i === 1 ? '#f59e0b' : 'rgba(255,255,255,0.22)' }}>
                        {i + 1}
                      </span>

                      {/* Photo de tête cropée au canvas */}
                      <FaceAvatar src={cropUrl} size={isFirst ? 72 : 58} rank={i} glow={i < 3} />

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wide"
                          style={{ color: isFirst ? '#ff4d88' : i === 1 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>
                          {rankLabel}
                        </p>
                        <p className="text-xs font-semibold leading-tight" style={{ color: isFirst ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                          {g.traits}
                        </p>
                        {isFirst && result.winner_reason && (
                          <p className="text-[10px] mt-0.5 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {result.winner_reason}
                          </p>
                        )}
                      </div>

                      {/* Score */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-lg font-black leading-none"
                          style={{ color: isFirst ? '#ff4d88' : i === 1 ? '#f59e0b' : 'rgba(255,255,255,0.35)' }}>
                          {g.score}
                        </span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>/10</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <button onClick={reset}
                className="w-full mt-5 py-3 rounded-2xl text-xs font-black"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>
                {t.results.extras.groupRanking.restart}
              </button>
            </motion.div>
          )
        })()}
      </div>
    </div>
  )
}

// ── Outil 2 : Transformation de style ────────────────────────────────────────
const STYLES = [
  {
    id: 'athlete',
    label: 'Athlète',
    emoji: '🏋️',
    desc: 'Gym & sport',
    preview: 'https://images.pexels.com/photos/4943917/pexels-photo-4943917.jpeg?auto=compress&cs=tinysrgb&w=400',
    prompt: 'Transform this woman into an athletic fitness model. Preserve her exact face, skin tone, and facial features perfectly unchanged. Dress her in stylish athletic wear: sports bra and high-waisted leggings. Place her in a modern gym with soft lighting. Photorealistic high-quality portrait.',
  },
  {
    id: 'oldmoney',
    label: 'Old Money',
    emoji: '💎',
    desc: 'Élégance discrète',
    preview: 'https://images.pexels.com/photos/3369569/pexels-photo-3369569.jpeg?auto=compress&cs=tinysrgb&w=400',
    prompt: 'Transform this woman into an old money elegance style. Preserve her exact face, skin tone, and facial features perfectly unchanged. Dress her in understated luxury fashion: cashmere sweater, tailored blazer, pearl necklace. Place her in a refined interior with warm lighting. Photorealistic high-quality portrait.',
  },
  {
    id: 'farmer',
    label: 'Fermière chic',
    emoji: '🌾',
    desc: 'Campagne & nature',
    preview: 'https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg?auto=compress&cs=tinysrgb&w=400',
    prompt: 'Transform this woman into a chic farmcore aesthetic. Preserve her exact face, skin tone, and facial features perfectly unchanged. Dress her in fashionable country clothes: linen dress, denim jacket, ankle boots. Place her in a beautiful countryside with lavender fields in the background. Photorealistic portrait.',
  },
  {
    id: 'beach',
    label: 'Style plage',
    emoji: '🏖️',
    desc: 'Summer vibes',
    preview: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400',
    prompt: 'Transform this woman into a beach summer style. Preserve her exact face, skin tone, and facial features perfectly unchanged. Dress her in a stylish bikini with a flowy sarong. Place her on a stunning tropical beach with crystal blue water and white sand, golden hour lighting. Photorealistic portrait.',
  },
  {
    id: 'goth',
    label: 'Gothique',
    emoji: '🦇',
    desc: 'Dark & mystérieux',
    preview: 'https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=400',
    prompt: 'Transform this woman into a gothic dark aesthetic style. Preserve her exact face, skin tone, and facial features perfectly unchanged. Dress her in elegant gothic fashion: black lace dress, dark velvet. Place her in a moody atmospheric dark setting with dramatic lighting. Photorealistic portrait.',
  },
  {
    id: 'streetwear',
    label: 'Streetwear',
    emoji: '🧢',
    desc: 'Urban & stylé',
    preview: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
    prompt: 'Transform this woman into an urban streetwear style. Preserve her exact face, skin tone, and facial features perfectly unchanged. Dress her in trendy streetwear: oversized graphic hoodie, cargo pants, fresh sneakers, cap. Place her on a stylish urban city street at dusk. Photorealistic portrait.',
  },
]

function ExtrasStyleTransform({ onBack }) {
  const t = useT()
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [loadStep, setLoadStep] = useState('')
  const inputRef = useRef()

  const handleFile = (f) => { setFile(f); setPreview(URL.createObjectURL(f)) }

  const generate = async () => {
    if (!file || !selectedStyle) return
    setLoading(true); setError(null); setLoadStep('Analyse du visage...')
    try {
      const style = STYLES.find(s => s.id === selectedStyle)
      setLoadStep('Génération en cours (30-60 sec)...')
      const resultUrl = await transformStyleWithOpenAI(file, style.prompt)
      setResult(resultUrl)
    } catch (e) {
      console.error('[StyleTransform] Erreur :', e)
      setError(e.message || String(e) || 'Erreur inconnue.')
    }
    setLoading(false); setLoadStep('')
  }

  const style = STYLES.find(s => s.id === selectedStyle)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 className="text-base font-black text-white">{t.results.extras.styleTransform.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        {!result ? (
          <>
            {/* Upload photo */}
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Ta photo
              </p>
              <button onClick={() => inputRef.current?.click()}
                className="w-full rounded-2xl flex items-center justify-center overflow-hidden relative"
                style={{ height: 160, background: 'rgba(255,255,255,0.04)', border: `2px dashed ${preview ? PINK_A(0.5) : 'rgba(255,255,255,0.12)'}` }}>
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>Ajoute ta photo (visage de face)</span>
                    </div>
                }
                {preview && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-[10px] font-black"
                    style={{ background: PINK_A(0.9), color: '#fff' }}>
                    Changer
                  </div>
                )}
              </button>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            {/* Style grid — avec aperçu du template */}
            <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {t.results.extras.styleTransform.chooseStyle}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {STYLES.map(s => {
                const active = selectedStyle === s.id
                return (
                  <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                    className="relative rounded-2xl overflow-hidden transition-all"
                    style={{ height: 140,
                      border: `2px solid ${active ? '#ff4d88' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: active ? `0 0 20px ${PINK_A(0.4)}` : 'none' }}>
                    {/* Photo template en fond */}
                    <img src={s.preview} alt={s.label}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: active ? 'brightness(0.55)' : 'brightness(0.35)' }}
                      loading="lazy" />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                    {/* Texte */}
                    <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
                      <p className="text-xs font-black text-white">{s.label}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.desc}</p>
                    </div>
                    {/* Checkmark si actif */}
                    {active && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#ff4d88' }}>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Aperçu du style sélectionné */}
            {style && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 mb-4"
                style={{ background: PINK_A(0.08), border: `1px solid ${PINK_A(0.2)}` }}>
                <img src={style.preview} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                <div>
                  <p className="text-xs font-black text-white">{style.label} sélectionné</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Ton visage sera intégré dans cette photo</p>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="rounded-xl px-4 py-3 text-xs text-center mb-3"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <motion.button whileTap={{ scale: 0.97 }}
              onClick={generate}
              disabled={!file || !selectedStyle || loading}
              className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
              style={{ background: file && selectedStyle && !loading
                ? 'linear-gradient(135deg,#cc3c69,#e8608a)'
                : 'rgba(255,255,255,0.07)',
                color: file && selectedStyle && !loading ? '#fff' : 'rgba(255,255,255,0.25)',
                boxShadow: file && selectedStyle && !loading ? '0 6px 24px rgba(204,60,105,0.4)' : 'none' }}>
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-transparent"
                    style={{ borderTopColor: '#fff', borderRightColor: 'rgba(255,255,255,0.3)' }} />
                  {loadStep || t.results.extras.styleTransform.generating}
                </>
              ) : t.results.extras.styleTransform.generate}
            </motion.button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            {/* Avant / Après */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={preview} alt="avant" className="w-full aspect-square object-cover" />
                <p className="text-center text-[10px] font-black py-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.results.extras.styleTransform.before}</p>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${PINK_A(0.4)}`, boxShadow: `0 0 20px ${PINK_A(0.2)}` }}>
                <img src={result} alt="après" className="w-full aspect-square object-cover" />
                <p className="text-center text-[10px] font-black py-1.5" style={{ color: '#ff4d88' }}>{t.results.extras.styleTransform.after}</p>
              </div>
            </div>

            {/* Image plein format */}
            <div className="w-full rounded-2xl overflow-hidden" style={{ border: `2px solid ${PINK_A(0.4)}`, boxShadow: `0 0 40px ${PINK_A(0.25)}` }}>
              <img src={result} alt="transformation" className="w-full" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setResult(null); setError(null) }}
                className="flex-1 py-3 rounded-2xl text-xs font-black"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                Recommencer
              </button>
              <a href={result} download="shemaxx-style.jpg" target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3 rounded-2xl text-xs font-black text-white text-center flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)' }}>
                Enregistrer ↓
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ── Outil 3 : Transformation 10/10 ───────────────────────────────────────────
function ExtrasTenOutOfTen({ onBack }) {
  const t = useT()
  const [file, setFile]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const inputRef = useRef()

  const handleFile = (f) => { setFile(f); setPreview(URL.createObjectURL(f)) }

  const generate = async () => {
    if (!file) return
    setLoading(true); setError(null)
    try {
      const prompt = `Subtly enhance this woman's facial features to their maximum natural potential while keeping her exact identity perfectly preserved. Her face shape, skin tone, hair color and style, eye color, and overall appearance must remain identical — this must look like the SAME real person. Only improve: sharpen and define the jawline slightly, lift and accentuate the cheekbones, make the eyes more symmetric and intense, refine the nose bridge, perfect the skin texture and natural radiance. The result must look like a real photorealistic portrait of the same person on her absolute best day — not a different person, not CGI, not overly filtered or retouched. Natural editorial lighting, ultra-realistic skin texture.`
      const url = await transformStyleWithOpenAI(file, prompt)
      setResult(url)
    } catch (e) {
      setError(e.message || 'Erreur lors de la génération.')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 className="text-base font-black text-white">{t.results.extras.tenOutOfTen.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        {!result ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Zone d'import */}
            <button onClick={() => inputRef.current?.click()}
              className="w-full rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ minHeight: 220, background: 'rgba(255,255,255,0.04)',
                border: `2px dashed ${preview ? PINK_A(0.5) : 'rgba(255,255,255,0.12)'}` }}>
              {preview
                ? <img src={preview} alt="" className="w-full object-cover" style={{ maxHeight: 320 }} />
                : <div className="flex flex-col items-center gap-3 py-10">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Importer ta photo</span>
                  </div>
              }
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {preview && (
              <button onClick={() => inputRef.current?.click()} className="text-xs font-bold text-center"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Changer la photo
              </button>
            )}
            {error && (
              <div className="rounded-xl px-4 py-3 text-xs text-center"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
            {file && (
              <>
                <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }} onClick={generate} disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)', boxShadow: '0 6px 24px rgba(204,60,105,0.4)' }}>
                  {loading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 rounded-full border-2 border-transparent"
                        style={{ borderTopColor: '#fff', borderRightColor: 'rgba(255,255,255,0.3)' }} />
                      {t.results.extras.tenOutOfTen.generating}
                    </>
                  ) : t.results.extras.tenOutOfTen.generate}
                </motion.button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
            {/* Before / After */}
            {preview && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <div>
                  <p className="text-[11px] font-black mb-1.5 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.results.extras.tenOutOfTen.before}</p>
                  <img src={preview} alt="avant" className="w-full rounded-2xl object-cover" style={{ aspectRatio: '1' }} />
                </div>
                <div>
                  <p className="text-[11px] font-black mb-1.5 text-center" style={{ color: '#ff4d88' }}>{t.results.extras.tenOutOfTen.after}</p>
                  <img src={result} alt="après" className="w-full rounded-2xl object-cover"
                    style={{ aspectRatio: '1', border: `2px solid ${PINK_A(0.5)}`, boxShadow: `0 0 32px ${PINK_A(0.3)}` }} />
                </div>
              </div>
            )}
            <div className="w-full rounded-2xl p-3 text-center"
              style={{ background: PINK_A(0.1), border: `1px solid ${PINK_A(0.3)}` }}>
              <p className="text-sm font-black text-white">{t.results.extras.tenOutOfTen.generated}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Symétrie parfaite • Proportions dorées • Éclat maximal
              </p>
            </div>
            <div className="w-full flex gap-3">
              <button onClick={() => { setResult(null); setError(null) }}
                className="flex-1 py-3 rounded-2xl text-xs font-black"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                Recommencer
              </button>
              <a href={result} download="shemaxx-10sur10.jpg" target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3 rounded-2xl text-xs font-black text-white text-center flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)' }}>
                Enregistrer ↓
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ── TabExtras principal ───────────────────────────────────────────────────────
function TabExtras({ scores, pseudo, onClose, pendingPayment }) {
  const t = useT()
  const [activeExtra, setActiveExtra] = useState(null)
  // paywall: id de l'extra en cours de paiement | null
  const [paywallFor,  setPaywallFor]  = useState(null)
  const [payLoading,  setPayLoading]  = useState(false)
  const [payErr,      setPayErr]      = useState(null)

  // Après retour Stripe avec un paiement d'extra → ouvre directement l'extra
  useEffect(() => {
    if (pendingPayment && pendingPayment.startsWith('extra_')) {
      const extraId = pendingPayment.replace('extra_', '')
      setActiveExtra(extraId)
    }
  }, [pendingPayment])

  if (activeExtra === 'group')   return <ExtrasGroupRanking onBack={() => setActiveExtra(null)} />
  if (activeExtra === 'style')   return <ExtrasStyleTransform onBack={() => setActiveExtra(null)} />
  if (activeExtra === 'ten')     return <ExtrasTenOutOfTen onBack={() => setActiveExtra(null)} />

  const TOOLS = [
    {
      id: 'group',
      title: t.results.extras.tools[0].title,
      desc:  t.results.extras.tools[0].desc,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.03))',
      border: 'rgba(245,158,11,0.2)',
    },
    {
      id: 'style',
      title: t.results.extras.tools[1].title,
      desc:  t.results.extras.tools[1].desc,
      color: '#a855f7',
      gradient: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(168,85,247,0.03))',
      border: 'rgba(168,85,247,0.2)',
    },
    {
      id: 'ten',
      title: t.results.extras.tools[2].title,
      desc:  t.results.extras.tools[2].desc,
      color: '#cc3c69',
      gradient: 'linear-gradient(135deg,rgba(204,60,105,0.12),rgba(204,60,105,0.03))',
      border: 'rgba(204,60,105,0.2)',
    },
  ]

  const handleExtraClick = (id) => {
    setPayErr(null)
    setPaywallFor(id)
  }

  const handlePay = async () => {
    if (!paywallFor) return
    setPayLoading(true)
    setPayErr(null)
    try {
      await startOneTimePayment(`extra_${paywallFor}`, scores)
    } catch (e) {
      setPayErr(e.message || 'Erreur paiement')
      setPayLoading(false)
    }
  }

  return (
    <div className="px-4 pt-4 pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h2 className="text-xl font-black text-white mb-1">{t.results.extras.title}</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t.results.extras.subtitle}
        </p>
      </motion.div>

      <div className="space-y-3">
        {TOOLS.map((t, i) => (
          <motion.button key={t.id}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleExtraClick(t.id)}
            className="w-full text-left rounded-2xl p-4"
            style={{ background: t.gradient, border: `1px solid ${t.border}` }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${t.color}15`, border: `1px solid ${t.color}25` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white mb-0.5">{t.title}</p>
                <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.desc}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-xs font-black" style={{ color: t.color }}>3,99€</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeOpacity="0.25" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Modal paywall extra ── */}
      <AnimatePresence>
        {paywallFor && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setPaywallFor(null) }}>
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-w-sm mx-4 mb-8 rounded-3xl p-6"
              style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-center mb-5">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-black text-white mb-1">
                  {TOOLS.find(t => t.id === paywallFor)?.title}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Paiement unique — résultat généré instantanément par l'IA.
                </p>
              </div>

              <div className="rounded-2xl px-4 py-3 mb-5 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-sm text-white/60">Prix par utilisation</span>
                <span className="text-xl font-black text-white">3,99€</span>
              </div>

              {payErr && (
                <p className="text-center text-xs font-semibold mb-3" style={{ color: '#f87171' }}>{payErr}</p>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={handlePay} disabled={payLoading}
                className="w-full py-3.5 rounded-full font-black text-base text-white flex items-center justify-center gap-2 mb-3"
                style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)',
                  boxShadow: '0 8px 32px rgba(204,60,105,0.5)',
                  opacity: payLoading ? 0.7 : 1 }}>
                {payLoading ? '⏳ Redirection Stripe…' : '💳 Payer 3,99€ et utiliser'}
              </motion.button>

              <button onClick={() => setPaywallFor(null)}
                className="w-full py-2.5 rounded-full text-sm font-semibold"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Annuler
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════
// TABS is defined inside the component to use translations
// See Step11Results component for dynamic TABS

// ════════════════════════════════════════════════════════════════════════
// ONGLET 3 — CLASSEMENT
// ════════════════════════════════════════════════════════════════════════
const INVITE_KEY      = 'shemaxx_invites'
const REF_CODE_KEY    = 'shemaxx_ref_code'
const CONFIRMED_KEY   = 'shemaxx_confirmed_refs'  // liste des codes d'amies confirmées

// Génère ou récupère le code de parrainage unique de l'utilisatrice
function getOrCreateRefCode() {
  try {
    let code = localStorage.getItem(REF_CODE_KEY)
    if (!code) {
      code = 'SHX' + Math.random().toString(36).substring(2, 8).toUpperCase()
      localStorage.setItem(REF_CODE_KEY, code)
    }
    return code
  } catch { return 'SHX000000' }
}

// Vérifie si de nouvelles amies ont confirmé leur inscription via le lien
function checkNewConfirmations(myCode) {
  try {
    const confirmed = JSON.parse(localStorage.getItem(CONFIRMED_KEY) || '[]')
    // Filtre les confirmations pour ce code (préfixe myCode_)
    return confirmed.filter(c => c.startsWith(myCode + '_')).length
  } catch { return 0 }
}

function TabClassement({ scores, pseudo }) {
  const t = useT()
  const myScore   = scores?.total ?? 71
  const myName    = pseudo || 'Moi'
  const initials  = myName.charAt(0).toUpperCase()
  const myCode    = getOrCreateRefCode()
  const inviteLink = `${window.location.origin}/?ref=${myCode}`

  const [invites, setInvites] = useState(() => {
    try {
      const stored    = JSON.parse(localStorage.getItem(INVITE_KEY) || '0')
      const confirmed = checkNewConfirmations(myCode)
      const total     = Math.max(stored, confirmed)
      if (confirmed > stored) localStorage.setItem(INVITE_KEY, JSON.stringify(total))
      return total
    } catch { return 0 }
  })
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    const confirmed = checkNewConfirmations(myCode)
    if (confirmed > invites) {
      const next = Math.min(confirmed, 5)
      setInvites(next)
      localStorage.setItem(INVITE_KEY, JSON.stringify(next))
    }
  }, [])

  const inviteMore = Math.max(0, 5 - invites)
  const hasBonus   = invites >= 5

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    } catch { /* ignore */ }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Shemaxx — Analyse faciale IA',
        text: `${myName} t'invite à découvrir ton score beauté avec l'IA ! Clique ici 👇`,
        url: inviteLink,
      })
      setShared(true); setTimeout(() => setShared(false), 3000)
    } catch { handleCopy() }
  }

  return (
    <div className="pb-8">

      {/* ── Banner invite ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 mb-5 rounded-[20px]"
        style={{ background: 'linear-gradient(135deg,rgba(204,60,105,0.18),rgba(204,60,105,0.06))',
          border: '1px solid rgba(204,60,105,0.3)' }}>
        <div className="px-4 pt-4 pb-4">
          <p className="text-base font-black text-white mb-0.5">Compare avec tes amies</p>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Partage ton lien — quand tes amies s'inscrivent avec ton code, ton compteur se met à jour.
          </p>

          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span className="flex-1 text-[11px] font-mono truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
              shemaxx.app/?ref={myCode}
            </span>
            <button onClick={handleCopy}
              className="text-[10px] font-black px-2 py-1 rounded-lg shrink-0 transition-all"
              style={{ background: copied ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.1)',
                color: copied ? '#4ade80' : 'rgba(255,255,255,0.6)' }}>
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {hasBonus ? '🎉 Analyse offerte débloquée !' : `${invites}/5 amies inscrites`}
              </span>
              {!hasBonus && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,77,136,0.15)', color: '#ff4d88' }}>
                  encore {inviteMore} pour 1 analyse gratuite
                </span>
              )}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div animate={{ width: `${Math.min(invites / 5 * 100, 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: hasBonus ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#cc3c69,#ff4d88)' }} />
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
            className="w-full py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2"
            style={{ background: shared ? 'linear-gradient(135deg,#10b981,#34d399)' : 'linear-gradient(135deg,#cc3c69,#e8608a)',
              boxShadow: shared ? '0 6px 24px rgba(16,185,129,0.4)' : '0 6px 24px rgba(204,60,105,0.45)',
              transition: 'background 0.3s' }}>
            {shared ? (
              <>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>
                Lien partagé !
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Inviter mes amies
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Podium solo ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mx-4 mb-5 rounded-[20px] overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-center pt-4 pb-5"
          style={{ color: 'rgba(255,255,255,0.3)' }}>Top du classement</p>

        <div className="flex flex-col items-center pb-5">
          <span className="text-2xl mb-2">🥇</span>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black mb-2"
            style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)',
              border: '3px solid #ff4d88', boxShadow: '0 0 24px rgba(255,77,136,0.5)', color: '#fff' }}>
            {initials}
          </motion.div>
          <p className="text-sm font-black text-white mb-1">{myName}</p>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: PINK_A(0.15), border: `1px solid ${PINK_A(0.35)}` }}>
            <span className="text-base font-black" style={{ color: '#ff4d88' }}>{myScore}</span>
            <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>/100</span>
          </div>
          <div className="mt-4 rounded-t-2xl flex items-center justify-center"
            style={{ width: 80, height: 40,
              background: 'linear-gradient(to top,rgba(204,60,105,0.35),rgba(204,60,105,0.08))',
              border: '1px solid rgba(204,60,105,0.3)', borderBottom: 'none' }}>
            <span className="text-lg font-black" style={{ color: '#ff4d88' }}>1</span>
          </div>
        </div>
      </motion.div>

      {/* ── Ligne utilisatrice ── */}
      <div className="px-4 flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest mb-1"
          style={{ color: 'rgba(255,255,255,0.3)' }}>Ton classement</p>

        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.14 }}
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'linear-gradient(135deg,rgba(204,60,105,0.18),rgba(204,60,105,0.06))',
            border: '1px solid rgba(204,60,105,0.4)', boxShadow: '0 4px 20px rgba(204,60,105,0.15)' }}>
          <span className="text-sm font-black w-6 text-center shrink-0" style={{ color: '#ff4d88' }}>1</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)', color: '#fff' }}>
            {initials}
          </div>
          <p className="flex-1 text-sm font-bold text-white">{myName} (moi)</p>
          <span className="text-sm font-black" style={{ color: '#ff4d88' }}>{myScore}</span>
        </motion.div>

        <p className="text-center text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Invite tes amies pour les voir apparaître ici
        </p>
      </div>

      <p className="text-center text-[10px] mt-4 px-8" style={{ color: 'rgba(255,255,255,0.15)' }}>
        Classement basé sur les analyses Shemaxx Pro.
      </p>
    </div>
  )
}

// ── Panneau Paramètres ────────────────────────────────────────────────────────
// ── Page Paramètres (plein écran, glisse depuis la droite) ───────────────────
function SettingsPage({ pseudo, age, email, onClose, onLogout }) {
  const t = useT()
  const [prenom,        setPrenom]        = useState(pseudo || '')
  const [ageVal,        setAgeVal]        = useState(age ? String(age) : '')
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalErr,     setPortalErr]     = useState(null)

  const handlePortal = async () => {
    setPortalLoading(true); setPortalErr(null)
    try {
      const { supabase } = await import('../../lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Session introuvable')
      const { data, error } = await supabase.functions.invoke('create-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { returnUrl: window.location.origin },
      })
      if (error) throw new Error(error.message || 'Erreur')
      if (!data?.url) throw new Error('URL portail manquante')
      window.location.href = data.url
    } catch (err) { setPortalErr(err.message || 'Erreur'); setPortalLoading(false) }
  }

  const field = { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none' }
  const label = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 6, display: 'block' }

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: '#050508' }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 pt-12 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <p className="text-base font-black text-white">Paramètres</p>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-6">

        {/* Infos */}
        <div>
          <p style={{ ...label }}>Prénom</p>
          <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ton prénom" style={field} />
        </div>
        <div>
          <p style={{ ...label }}>Âge</p>
          <input value={ageVal} onChange={e => setAgeVal(e.target.value)} type="number" min="13" max="99" placeholder="Ton âge" style={field} />
        </div>
        {email && (
          <div>
            <p style={{ ...label }}>Adresse e-mail</p>
            <div style={{ ...field, color: 'rgba(255,255,255,0.4)', cursor: 'default' }}>{email}</div>
          </div>
        )}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

        {/* Abonnement */}
        <div>
          <p style={{ ...label }}>{t.results.settings.subscription}</p>
          <button onClick={handlePortal} disabled={portalLoading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-between px-4"
            style={{ background: 'rgba(204,60,105,0.08)', border: '1px solid rgba(204,60,105,0.25)', color: '#ff4d88', opacity: portalLoading ? 0.6 : 1 }}>
            <div className="flex items-center gap-2.5">
              {portalLoading
                ? <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,77,136,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#ff4d88" strokeWidth="3" strokeLinecap="round"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              }
              <span>{portalLoading ? 'Chargement…' : 'Gérer mon abonnement'}</span>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          {portalErr && <p className="text-xs mt-2 text-center" style={{ color: '#f87171' }}>{portalErr}</p>}
          <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>{t.results.settings.manage}</p>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

        {/* Déconnexion */}
        <button onClick={onLogout}
          className="w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Se déconnecter
        </button>
      </div>
    </motion.div>
  )
}

export default function Step11Results({ faceScores = null, pseudo = '', age = null, onClose, onRescan, pendingPayment = 'none' }) {
  const { user, signOut, refreshScans } = useAuth()
  const t = useT()
  const scores  = faceScores ?? DEFAULT_SCORES
  const defauts = (scores.defauts?.length > 0) ? scores.defauts : DEFAULT_SCORES.defauts

  const TABS = [
    { id: 'resultats',  label: t.results.tabs.results,  icon: '◎' },
    { id: 'extras',     label: t.results.tabs.extras,   icon: '⬡' },
    { id: 'classement', label: t.results.tabs.analysis, icon: '◈' },
  ]

  // Si retour Stripe avec un paiement d'extra → ouvre l'onglet Extras directement
  const [activeTab,     setActiveTab]     = useState(
    pendingPayment?.startsWith('extra_') ? 'extras' : 'resultats'
  )
  const [prevTab,       setPrevTab]       = useState(null)
  const [showSettings,  setShowSettings]  = useState(false)
  const [detailScan,    setDetailScan]    = useState(null)

  // Analytics : résultats débloqués
  useEffect(() => {
    track('results_viewed', {
      total:       scores.total,
      ranking:     scores.ranking,
      beauty_score: scores.beautyScore,
      rank:        scores.rank,
      is_new_scan: !!faceScores,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync profil vers Supabase à l'entrée dans l'app
  useEffect(() => {
    if (user && (pseudo || age)) {
      upsertProfile(user.id, { pseudo, age }).catch(() => { /* silencieux */ })
    }
  }, [user, pseudo, age])

  // Si l'utilisateur est connecté, fusionner ses scans Supabase dans localStorage
  useEffect(() => {
    if (!user) return
    loadScans(user.id).then(remoteScans => {
      if (!remoteScans?.length) return
      try {
        const local   = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
        const localIds = new Set(local.map(s => String(s.scanId ?? s.id)))
        const toAdd = remoteScans
          .filter(s => s?.scanId && !localIds.has(String(s.scanId)))
          .map(s => ({
            id:      s.scanId,
            scanId:  s.scanId,
            date:    s.createdAt ?? new Date().toISOString(),
            total:   s.total   ?? null,
            ranking: s.ranking ?? null,
            scores:  s,
          }))
        if (toAdd.length) {
          const merged = [...local, ...toAdd].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)
          localStorage.setItem(HISTORY_KEY, JSON.stringify(merged))
        }
      } catch { /* ignore */ }
    }).catch(() => { /* silencieux */ })
  }, [user])

  const tabOrder = TABS.map(t => t.id)
  const dir = prevTab ? (tabOrder.indexOf(activeTab) > tabOrder.indexOf(prevTab) ? 1 : -1) : 0

  const goTab = (id) => {
    if (id === activeTab) return
    setPrevTab(activeTab)
    setActiveTab(id)
  }

  const slideVariants = {
    enter:  (d) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit:   (d) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  }

  const handleLogout = async () => {
    const keys = ['shemaxx_scan_history','shemaxx_scan_deleted','shemaxx_invites','shemaxx_ref_code','shemaxx_confirmed_refs']
    keys.forEach(k => { try { localStorage.removeItem(k) } catch { /* ignore */ } })
    try { sessionStorage.removeItem('shemaxx_session_fp') } catch { /* ignore */ }
    if (user) await signOut().catch(() => { /* ignore */ })
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#050508', overflow: 'hidden' }}>

      {/* ── Fond ambiant ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 400, borderRadius: '50%',
          background: `radial-gradient(circle, ${PINK_A(0.07)}, transparent 65%)`, filter: 'blur(50px)' }} />
      </div>

      {/* ── Header app ── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: PINK_A(0.15), border: `1px solid ${PINK_A(0.3)}` }}>
            <span className="text-sm">🔓</span>
          </div>
          <p className="text-sm font-black text-white leading-none">
            <span style={{ color: PINK }}>She</span>maxx Pro
          </p>
        </div>

        {/* Bouton Paramètres */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* ── Panneau paramètres géré depuis Onboarding.jsx ── */}

      {/* ── Zone de contenu scrollable ── */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={activeTab}
            custom={dir}
            variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-y-auto no-scrollbar">
            {activeTab === 'resultats'  && <TabScan key={scores?.scanId ?? 'default'} scores={scores} pseudo={pseudo} onRescan={onRescan ?? onClose} onShowDetail={setDetailScan} />}
            {activeTab === 'extras'     && <TabExtras scores={scores} pseudo={pseudo} onClose={onClose} pendingPayment={pendingPayment} />}
            {activeTab === 'classement' && <TabClassement scores={scores} pseudo={pseudo} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Modal détail scan — rendu hors du motion.div pour éviter le piège de transform CSS ── */}
      <AnimatePresence>
        {detailScan && (
          <ScanDetailModal
            scan={detailScan}
            pseudo={pseudo}
            onClose={() => setDetailScan(null)}
            currentScores={scores}
          />
        )}
      </AnimatePresence>

      {/* ── Tab bar fixée en bas ── */}
      <div className="relative z-20 shrink-0 px-4 pb-6 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-around">
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => goTab(tab.id)}
                className="flex flex-col items-center gap-1 py-1 px-6 rounded-2xl transition-all"
                style={{ background: active ? PINK_A(0.12) : 'transparent',
                  border: `1px solid ${active ? PINK_A(0.3) : 'transparent'}` }}>
                <motion.span animate={{ scale: active ? 1.15 : 1 }} transition={{ duration: 0.2 }}
                  style={{ fontSize: 16, color: active ? '#ff4d88' : 'rgba(255,255,255,0.3)' }}>
                  {tab.icon}
                </motion.span>
                <span className="text-[11px] font-bold transition-colors"
                  style={{ color: active ? '#ff4d88' : 'rgba(255,255,255,0.3)' }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Page Paramètres ── */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPage
            pseudo={pseudo}
            age={age}
            email={user?.email}
            onClose={() => setShowSettings(false)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

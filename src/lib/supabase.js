import { createClient } from '@supabase/supabase-js'

// Compresse photo avant stockage localStorage (~2MB → ~150KB)
async function compressPhotoForStorage(dataUrl, maxW = 500, quality = 0.65) {
  if (!dataUrl) return null
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  Variables Supabase manquantes dans .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)')
}

export const supabase = createClient(
  SUPABASE_URL  || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
)

// ── Profil utilisateur ────────────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertProfile(userId, { pseudo, age }) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, pseudo, age, updated_at: new Date().toISOString() },
             { onConflict: 'user_id' })
  if (error) throw error
}

// ── Scans ─────────────────────────────────────────────────────────────────────
export async function saveScans(userId, scans) {
  if (!scans?.length) return
  const rows = scans.map(s => ({
    user_id:    userId,
    scan_id:    String(s.scanId ?? s.id ?? Date.now()),
    scores:     s,
    created_at: s.createdAt ?? new Date().toISOString(),
  }))
  const { error } = await supabase
    .from('scans')
    .upsert(rows, { onConflict: 'scan_id' })
  if (error) throw error
}

export async function loadScans(userId) {
  const { data, error } = await supabase
    .from('scans')
    .select('scores, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(r => r.scores)
}

// ── Abonnement ────────────────────────────────────────────────────────────────
export async function getSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ── Paiement unique (analyse extra ou extra IA) ───────────────────────────────
// type : 'rescan' | 'extra_style' | 'extra_10' | 'extra_ranking' | 'extra_advice'
export async function startOneTimePayment(type, currentScores) {
  const priceId = import.meta.env.VITE_STRIPE_ONETIME_PRICE_ID
  const origin  = window.location.origin

  // Sauvegarde les scores avant le redirect Stripe (photo compressée)
  if (currentScores) {
    const { photoUrl, photoLandmarks, ...scoresOnly } = currentScores
    try { localStorage.setItem('shemaxx_pending_scores', JSON.stringify(scoresOnly)) } catch { /* ignore */ }
    if (photoUrl) {
      try {
        const compressed = await compressPhotoForStorage(photoUrl)
        localStorage.setItem('shemaxx_pending_photo', compressed)
        sessionStorage.setItem('shemaxx_pending_photo', compressed)
      } catch {
        try {
          const compressed = await compressPhotoForStorage(photoUrl, 400, 0.55)
          sessionStorage.setItem('shemaxx_pending_photo', compressed)
        } catch { /* ignore */ }
      }
    }
    if (photoLandmarks) try { localStorage.setItem('shemaxx_pending_landmarks', JSON.stringify(photoLandmarks)) } catch { /* ignore */ }
  }

  // Récupère le token explicitement pour éviter tout problème de timing
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Session introuvable — reconnecte-toi.')

  const { data, error } = await supabase.functions.invoke('create-payment', {
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: {
      priceId,
      type,
      successUrl: `${origin}/?payment=paid_${type}`,
      cancelUrl:  `${origin}/?payment=cancelled`,
    },
  })
  if (error) {
    let errMsg = error.message || 'Erreur paiement'
    try {
      const body = await error.context?.json?.()
      if (body?.error || body?.message) errMsg = body.error || body.message
    } catch { /* ignore */ }
    throw new Error(errMsg)
  }
  if (!data?.url) throw new Error('URL de paiement manquante')
  window.location.href = data.url
}

export async function isSubscribed(userId) {
  const sub = await getSubscription(userId)
  if (!sub) return false
  if (sub.status === 'active' || sub.status === 'trialing') return true
  if (sub.current_period_end) {
    return new Date(sub.current_period_end) > new Date()
  }
  return false
}

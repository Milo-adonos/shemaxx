import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const PINK = '#cc3c69'

export default function CreateAccountModal({ prefillEmail = '', onSuccess, onClose }) {
  const [email,    setEmail]    = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [linking,  setLinking]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Remplis tous les champs.'); return }
    if (password.length < 6)  { setError('Le mot de passe doit faire au moins 6 caractères.'); return }

    setLoading(true); setError(null)

    try {
      // Crée le compte Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError
      if (!signUpData.session) {
        // Confirmation email requise — on tente une connexion directe
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }

      // Récupère la session après login
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Session introuvable après inscription.')

      // Lie le paiement Stripe au nouveau compte
      setLinking(true)
      const { error: linkError } = await supabase.functions.invoke('link-payment', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (linkError) {
        // Non bloquant — l'abonnement sera lié via webhook dans les secondes suivantes
        console.warn('link-payment non critique :', linkError.message)
      }

      // Nettoie l'email invité
      try { localStorage.removeItem('shemaxx_guest_email') } catch { /* ignore */ }

      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.')
    } finally {
      setLoading(false); setLinking(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="w-full max-w-sm rounded-t-[28px] px-6 pt-3 pb-10"
        style={{ background: '#111116', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Icône succès */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1.5px solid rgba(52,211,153,0.3)' }}>
            ✅
          </div>
        </div>

        <h2 className="text-xl font-black text-white text-center mb-1">Paiement réussi !</h2>
        <p className="text-sm text-center mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Crée ton compte pour accéder à tes résultats débloqués.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Adresse e-mail"
            className="w-full px-4 py-3.5 rounded-2xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Choisis un mot de passe (6 car. min.)"
            className="w-full px-4 py-3.5 rounded-2xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          {error && (
            <p className="text-xs text-center rounded-xl px-3 py-2"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-base text-white"
            style={{
              background: loading ? 'rgba(204,60,105,0.5)' : `linear-gradient(135deg, ${PINK}, #e0557f)`,
              boxShadow: loading ? 'none' : '0 0 28px rgba(204,60,105,0.4)',
            }}
          >
            {loading
              ? linking
                ? 'Activation de ton accès…'
                : 'Création du compte…'
              : 'Accéder à mes résultats →'}
          </button>
        </form>

        <p className="text-[10px] text-center mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          🔒 Tes données sont sécurisées et ne seront jamais partagées.
        </p>
      </motion.div>
    </motion.div>
  )
}

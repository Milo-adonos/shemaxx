import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const PINK   = '#cc3c69'
const PINK_A = (a) => `rgba(204,60,105,${a})`

export default function AuthModal({ mode = 'signup', onSuccess, onClose, title, subtitle }) {
  const { signIn, signUp } = useAuth()
  const [tab,      setTab]      = useState(mode)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const inputStyle = {
    width: '100%', padding: '13px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, color: '#fff', fontSize: 15,
    outline: 'none', transition: 'border-color 0.2s',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true); setError(null)
    try {
      if (tab === 'signup') {
        await signUp(email.trim(), password)
        // Auto-confirmation activée → connexion directe après inscription
        await signIn(email.trim(), password)
        onSuccess?.()
      } else {
        await signIn(email.trim(), password)
        onSuccess?.()
      }
    } catch (err) {
      const msg = err?.message ?? 'Une erreur est survenue.'
      if (msg.includes('Invalid login credentials')) setError('Email ou mot de passe incorrect.')
      else if (msg.includes('User already registered')) setError('Cet email est déjà utilisé. Connecte-toi.')
      else if (msg.includes('Password should be')) setError('Le mot de passe doit contenir au moins 6 caractères.')
      else setError(msg)
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 32, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full rounded-[28px] overflow-hidden flex flex-col mx-4"
        style={{
          maxWidth: 420,
          background: 'linear-gradient(160deg, #13101a 0%, #0e0b14 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${PINK_A(0.2)}, transparent)`, filter: 'blur(24px)', zIndex: 0 }} />

        <div className="relative z-10 px-6 pt-7 pb-8">
          {/* Titre */}
          <div className="mb-6 text-center">
            <span className="text-xl font-black tracking-tight">
              <span style={{ color: PINK }}>She</span><span className="text-white">maxx</span>
            </span>
            {title && <p className="mt-2 text-lg font-black text-white leading-tight">{title}</p>}
            {subtitle && <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>}
          </div>

          {/* Tabs */}
          <div className="flex rounded-2xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['signup', 'signin']).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(null) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
                style={{
                  background: tab === t ? PINK : 'transparent',
                  color: tab === t ? '#fff' : 'rgba(255,255,255,0.35)',
                  boxShadow: tab === t ? `0 0 16px ${PINK_A(0.4)}` : 'none',
                }}>
                {t === 'signup' ? "S'inscrire" : 'Se connecter'}
              </button>
            ))}
          </div>

          <motion.form onSubmit={handleSubmit} className="space-y-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>Email</label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required autoComplete="email"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = PINK}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>Mot de passe</label>
                  <input
                    type="password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = PINK}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-center rounded-xl px-3 py-2"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </motion.p>
                )}

                <button type="submit" disabled={loading || !email || !password}
                  className="w-full py-4 rounded-2xl font-black text-base text-white relative overflow-hidden"
                  style={{
                    background: loading ? 'rgba(204,60,105,0.4)' : `linear-gradient(135deg, ${PINK}, #e0557f)`,
                    boxShadow: loading ? 'none' : `0 0 24px ${PINK_A(0.4)}`,
                    opacity: (!email || !password) ? 0.5 : 1,
                  }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Chargement…
                    </span>
                  ) : tab === 'signup' ? "Créer mon compte" : "Se connecter"}
                </button>

                {tab === 'signin' && (
                  <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Pas encore de compte ?{' '}
                    <button type="button" onClick={() => { setTab('signup'); setError(null) }}
                      className="font-black" style={{ color: PINK }}>
                      S'inscrire
                    </button>
                  </p>
                )}
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  )
}

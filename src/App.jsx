import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { track, identifyUser, resetUser } from './lib/posthog.js'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Reveal from './components/Reveal'
import WhyNow from './components/WhyNow'
import HowItWorks from './components/HowItWorks'
import SocialProof from './components/SocialProof'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import Onboarding from './components/onboarding/Onboarding'
import AuthModal from './components/AuthModal'
import CreateAccountModal from './components/CreateAccountModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LangProvider, useT } from './contexts/LangContext'

const CONFIRMED_KEY = 'shemaxx_confirmed_refs'
const PENDING_REF_KEY = 'shemaxx_pending_ref'

// Étape 1 : l'amie visite le lien → on retient juste son code (pas encore confirmé)
function savePendingRef(refCode) {
  try {
    // Ne surécrit pas si elle a déjà un ref en attente
    if (!localStorage.getItem(PENDING_REF_KEY)) {
      localStorage.setItem(PENDING_REF_KEY, refCode)
    }
  } catch { /* ignore */ }
}

// Étape 2 : l'amie paie → on confirme le ref dans le compteur
function confirmPendingRef() {
  try {
    const refCode = localStorage.getItem(PENDING_REF_KEY)
    if (!refCode || !refCode.startsWith('SHX')) return
    const confirmId   = refCode + '_' + Date.now()
    const existing    = JSON.parse(localStorage.getItem(CONFIRMED_KEY) || '[]')
    const alreadyDone = existing.some(c => c.startsWith(refCode + '_'))
    if (!alreadyDone) {
      existing.push(confirmId)
      localStorage.setItem(CONFIRMED_KEY, JSON.stringify(existing.slice(-50)))
    }
    localStorage.removeItem(PENDING_REF_KEY)
  } catch { /* ignore */ }
}

function AppInner() {
  const { user, subscribed, scans, profile, loading, signOut } = useAuth()
  const t = useT()
  const [onboardingOpen,   setOnboardingOpen]   = useState(false)
  const [authModalOpen,    setAuthModalOpen]    = useState(false)
  const [authMode,         setAuthMode]         = useState('signup')
  const [refBanner,        setRefBanner]        = useState(null)
  const [pendingScores,    setPendingScores]    = useState(null)
  // 'none' | 'subscription' | 'rescan' | 'extra_style' | 'extra_10' | 'extra_ranking' | 'extra_advice'
  const [pendingPayment,   setPendingPayment]   = useState('none')
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [guestEmailForAccount, setGuestEmailForAccount] = useState('')

  // ── Analytics : landing page view ──
  useEffect(() => {
    track('landing_page_viewed')
  }, [])

  // ── Analytics : identification utilisateur connecté ──
  useEffect(() => {
    if (!loading) {
      if (user) {
        identifyUser(user.id, {
          email:      user.email,
          subscribed: subscribed,
          scans_count: scans?.length ?? 0,
        })
      } else {
        resetUser()
      }
    }
  }, [user, loading, subscribed, scans])

  // Détecte retour depuis Stripe — une seule fois au montage
  useEffect(() => {
    const params  = new URLSearchParams(window.location.search)
    const refCode = params.get('ref')
    const payment = params.get('payment')

    if (refCode && refCode.startsWith('SHX')) {
      // Sauvegarde le code en attente — sera confirmé uniquement après paiement
      savePendingRef(refCode)
      setRefBanner(refCode)
    }

    window.history.replaceState({}, '', window.location.pathname)

    if (payment === 'success' || payment?.startsWith('paid_')) {
      // L'amie vient de payer → confirme le ref si elle en avait un en attente
      confirmPendingRef()
      // Restaure les scores sauvegardés avant le redirect Stripe
      try {
        const saved = localStorage.getItem('shemaxx_pending_scores')
        if (saved) {
          const scores = JSON.parse(saved)
          // Cherche dans localStorage d'abord, puis sessionStorage (survit aux redirects)
          const photo = localStorage.getItem('shemaxx_pending_photo')
            || sessionStorage.getItem('shemaxx_pending_photo')
          const rawLandmarks = localStorage.getItem('shemaxx_pending_landmarks')
          if (photo) scores.photoUrl = photo
          if (rawLandmarks) scores.photoLandmarks = JSON.parse(rawLandmarks)
          setPendingScores(scores)
          localStorage.removeItem('shemaxx_pending_scores')
          localStorage.removeItem('shemaxx_pending_photo')
          sessionStorage.removeItem('shemaxx_pending_photo')
          localStorage.removeItem('shemaxx_pending_landmarks')
        }
      } catch { /* ignore */ }
      // 'success' = abonnement, 'paid_rescan' = analyse extra, 'paid_extra_style' etc.
      setPendingPayment(payment === 'success' ? 'subscription' : payment.replace('paid_', ''))
    }
  }, [])

  // Ouvre l'app dès que le paiement est détecté et que le chargement est terminé.
  useEffect(() => {
    if (pendingPayment === 'none' || loading) return
    if (pendingPayment === 'subscription') {
      if (user) {
        // Utilisateur déjà connecté → ouvre l'app directement
        setOnboardingOpen(true)
      } else {
        // Utilisateur invité → lui proposer de créer son compte
        const guestEmail = (() => { try { return localStorage.getItem('shemaxx_guest_email') || '' } catch { return '' } })()
        setGuestEmailForAccount(guestEmail)
        setShowCreateAccount(true)
      }
    } else if (user) {
      setOnboardingOpen(true)
    }
  }, [pendingPayment, loading, user])

  const openOnboarding = (e) => {
    e?.preventDefault()
    track('cta_clicked', { source: 'landing', subscribed, has_account: !!user })
    setOnboardingOpen(true)
  }

  // Bouton "Mon compte" / "Connexion" dans la Navbar
  const handleConnexion = () => {
    if (user && subscribed) {
      track('cta_clicked', { source: 'navbar', action: 'open_app' })
      setOnboardingOpen(true)
    } else if (user && !subscribed) {
      track('cta_clicked', { source: 'navbar', action: 'resume_onboarding' })
      setOnboardingOpen(true)
    } else {
      track('cta_clicked', { source: 'navbar', action: 'signin' })
      setAuthMode('signin')
      setAuthModalOpen(true)
    }
  }

  // Callback après connexion via AuthModal (depuis Navbar)
  const handleAuthSuccess = () => {
    track('user_signed_in')
    setAuthModalOpen(false)
    setOnboardingOpen(true)
  }

  if (loading) return null

  return (
    <div className="bg-[#090909] text-white min-h-screen overflow-x-hidden">
      <Navbar onCta={handleConnexion} onSignOut={signOut} user={user} />

      {/* Banner d'invitation */}
      <AnimatePresence>
        {refBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
            style={{ background: 'linear-gradient(135deg,#cc3c69,#e8608a)', boxShadow: '0 4px 20px rgba(204,60,105,0.5)' }}>
            <div className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <p className="text-sm font-black text-white">{t.app.inviteBanner}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setRefBanner(null); openOnboarding() }}
                className="text-xs font-black px-3 py-1.5 rounded-full bg-white text-pink-600">
                {t.app.inviteAnalyze}
              </button>
              <button onClick={() => setRefBanner(null)} className="text-white/60 text-lg leading-none">×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <Hero onCta={openOnboarding} />
        <Reveal />
        <WhyNow />
        <HowItWorks />
        <SocialProof />
        <FinalCTA onCta={openOnboarding} />
      </main>
      <Footer />

      {/* Onboarding */}
      <AnimatePresence>
        {onboardingOpen && (
          <Onboarding
            onClose={() => { setOnboardingOpen(false); setPendingPayment('none'); window.history.pushState({}, '', '/') }}
            initialUser={user}
            initialSubscribed={subscribed}
            initialScans={scans}
            initialProfile={profile}
            pendingScores={pendingScores}
            pendingPayment={pendingPayment}
          />
        )}
      </AnimatePresence>

      {/* Auth modal (depuis Navbar "Connexion") */}
      <AnimatePresence>
        {authModalOpen && (
          <AuthModal
            mode={authMode}
            onSuccess={handleAuthSuccess}
            onClose={() => setAuthModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Création de compte après paiement invité */}
      <AnimatePresence>
        {showCreateAccount && (
          <CreateAccountModal
            prefillEmail={guestEmailForAccount}
            onSuccess={() => {
              setShowCreateAccount(false)
              setPendingPayment('subscription')
              setOnboardingOpen(true)
            }}
            onClose={() => setShowCreateAccount(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </LangProvider>
  )
}

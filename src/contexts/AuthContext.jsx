import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, getProfile, loadScans, isSubscribed, getSubscription } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(null)
  const [profile,      setProfile]      = useState(null)
  const [scans,        setScans]        = useState([])
  const [subscribed,   setSubscribed]   = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [loading,      setLoading]      = useState(true)

  const loadUserData = useCallback(async (u) => {
    if (!u) {
      setUser(null); setProfile(null); setScans([]); setSubscribed(false); setSubscription(null)
      return
    }
    setUser(u)
    try {
      const [prof, userScans, sub, fullSub] = await Promise.all([
        getProfile(u.id),
        loadScans(u.id),
        isSubscribed(u.id),
        getSubscription(u.id),
      ])
      setProfile(prof ?? null)
      setScans(userScans ?? [])
      setSubscribed(sub)
      setSubscription(fullSub ?? null)
    } catch (err) {
      console.error('Erreur chargement données utilisateur :', err)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserData(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [loadUserData])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await loadUserData(data.user)
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setScans([]); setSubscribed(false); setSubscription(null)
  }

  const refreshSubscription = async () => {
    if (!user) return
    const sub = await isSubscribed(user.id)
    setSubscribed(sub)
  }

  const refreshScans = async () => {
    if (!user) return
    const userScans = await loadScans(user.id)
    setScans(userScans ?? [])
  }

  return (
    <AuthContext.Provider value={{
      user, profile, scans, subscribed, subscription, loading,
      signUp, signIn, signOut,
      refreshSubscription, refreshScans,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

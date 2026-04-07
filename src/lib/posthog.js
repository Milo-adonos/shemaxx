import posthog from 'posthog-js'

const KEY  = import.meta.env.VITE_POSTHOG_KEY  || ''
const HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com'

export function initPostHog() {
  posthog.init(KEY, {
    api_host:         HOST,
    capture_pageview: false,   // géré manuellement
    capture_pageleave: true,
    autocapture:      false,   // events manuels uniquement
    person_profiles:  'always',
  })
}

// Lie un utilisateur Supabase à sa session PostHog
export function identifyUser(userId, properties = {}) {
  if (!userId) return
  posthog.identify(userId, properties)
}

// Déconnexion → réinitialise la session anonyme
export function resetUser() {
  posthog.reset()
}

// Envoi d'un event avec propriétés optionnelles
export function track(event, properties = {}) {
  posthog.capture(event, properties)
}

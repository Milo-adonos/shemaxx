import { createContext, useContext, useMemo } from 'react'
import fr from '../i18n/fr'
import en from '../i18n/en'

// Détecte la langue du navigateur — anglais si "en-*", sinon français par défaut
function detectLang() {
  const nav = (navigator.language || navigator.userLanguage || 'fr').toLowerCase()
  return nav.startsWith('en') ? 'en' : 'fr'
}

export const LANG = detectLang()

const translations = { fr, en }

const LangContext = createContext(fr)

export function LangProvider({ children }) {
  const t = useMemo(() => translations[LANG] ?? fr, [])
  return <LangContext.Provider value={t}>{children}</LangContext.Provider>
}

/** Hook principal — retourne l'objet de traductions complet */
export function useT() {
  return useContext(LangContext)
}

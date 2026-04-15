import { createContext, useContext, useMemo } from 'react'
import fr from '../i18n/fr'
import en from '../i18n/en'

// Détecte la langue du navigateur — français si "fr-*", anglais par défaut pour tout le reste
function detectLang() {
  const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase()
  return nav.startsWith('fr') ? 'fr' : 'en'
}

export const LANG = detectLang()

const translations = { fr, en }

const LangContext = createContext(en)

export function LangProvider({ children }) {
  const t = useMemo(() => translations[LANG] ?? en, [])
  return <LangContext.Provider value={t}>{children}</LangContext.Provider>
}

/** Hook principal — retourne l'objet de traductions complet */
export function useT() {
  return useContext(LangContext)
}

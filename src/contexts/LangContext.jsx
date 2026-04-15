import { createContext, useContext, useMemo } from 'react'
import fr from '../i18n/fr'
import en from '../i18n/en'

export const LANG = 'en'

const translations = { fr, en }

const LangContext = createContext(en)

export function LangProvider({ children }) {
  return <LangContext.Provider value={en}>{children}</LangContext.Provider>
}

/** Hook principal — retourne l'objet de traductions complet */
export function useT() {
  return useContext(LangContext)
}

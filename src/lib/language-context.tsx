'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type Language = 'ja' | 'en'

const LanguageContext = createContext<{
  lang: Language
  setLang: (lang: Language) => void
}>({ lang: 'ja', setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ja')
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export type { Language }

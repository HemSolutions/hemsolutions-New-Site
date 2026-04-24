import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations } from '@/lib/translations';

type Language = 'sv' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (sv: string, en: string) => string;
  translate: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'sv',
  setLanguage: () => {},
  t: (sv: string) => sv,
  translate: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('sv');

  const t = useCallback(
    (sv: string, en: string) => (language === 'en' ? en : sv),
    [language]
  );

  const translate = useCallback(
    (key: string, replacements?: Record<string, string>) => {
      const entry = translations[key];
      let text = entry ? (language === 'en' ? entry.en : entry.sv) : key;
      if (replacements) {
        Object.entries(replacements).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, v);
        });
      }
      return text;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

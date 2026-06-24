import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Language, LANGUAGES } from "./dictionaries";

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  toggle: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "silap.lang";

function readInitial(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (LANGUAGES as readonly string[]).includes(stored)) return stored as Language;
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const initial = readInitial();
    setLangState(initial);
    if (typeof document !== "undefined") document.documentElement.lang = initial;
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(() => setLang(lang === "en" ? "id" : "en"), [lang, setLang]);

  const t = useCallback((key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key, [lang]);

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
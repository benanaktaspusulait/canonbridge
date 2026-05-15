"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Locale, Translations } from "./i18n";
import en from "./i18n";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [t, setT] = useState<Translations>(en);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("cb-locale", l);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("cb-locale") as Locale | null;
    if (saved && ["en", "tr", "de", "es"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    async function loadTranslations() {
      switch (locale) {
        case "tr": {
          const mod = await import("./locales/tr");
          setT(mod.default);
          break;
        }
        case "de": {
          const mod = await import("./locales/de");
          setT(mod.default);
          break;
        }
        case "es": {
          const mod = await import("./locales/es");
          setT(mod.default);
          break;
        }
        default:
          setT(en);
      }
    }
    loadTranslations();
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

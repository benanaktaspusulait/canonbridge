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

const allowedLocales: Locale[] = ["en", "tr", "de", "es"];

function localePath(locale: Locale) {
  return locale === "en" ? "/" : `/${locale}`;
}

function localeFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0] as Locale | undefined;
  return segment && allowedLocales.includes(segment) ? segment : null;
}

function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const routed = localeFromPath(window.location.pathname);
  const requested = new URLSearchParams(window.location.search).get("lang") as Locale | null;
  const saved = localStorage.getItem("cb-locale") as Locale | null;

  if (routed) {
    localStorage.setItem("cb-locale", routed);
    return routed;
  }

  if (requested && allowedLocales.includes(requested)) {
    localStorage.setItem("cb-locale", requested);
    return requested;
  }

  return saved && allowedLocales.includes(saved) ? saved : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale);
  const [t, setT] = useState<Translations>(en);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("cb-locale", l);
      document.documentElement.lang = l;
      const nextPath = localePath(l);
      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, "", `${nextPath}${window.location.hash}`);
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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

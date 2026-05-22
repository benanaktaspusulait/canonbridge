"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Locale, Translations } from "./i18n";
import en from "./i18n";
import tr from "./locales/tr";
import de from "./locales/de";
import es from "./locales/es";

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
const translationsByLocale: Record<Locale, Translations> = { en, tr, de, es };

function localePath(locale: Locale) {
  return locale === "en" ? "/" : `/${locale}`;
}

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const normalizedInitialLocale = allowedLocales.includes(initialLocale) ? initialLocale : "en";
  const [locale, setLocaleState] = useState<Locale>(normalizedInitialLocale);
  const [t, setT] = useState<Translations>(translationsByLocale[normalizedInitialLocale]);
  const router = useRouter();

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    setT(translationsByLocale[l]);
    if (typeof window !== "undefined") {
      document.documentElement.lang = l;
      localStorage.setItem("canonbridge-locale", l);
      const nextPath = localePath(l);
      if (window.location.pathname !== nextPath) {
        router.push(`${nextPath}${window.location.hash}`);
      }
    }
  };

  // On mount: check ?lang= query param or localStorage for locale preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const queryLocale = params.get("lang") as Locale | null;
    const storedLocale = localStorage.getItem("canonbridge-locale") as Locale | null;
    const preferred = queryLocale ?? storedLocale;

    if (preferred && allowedLocales.includes(preferred) && preferred !== locale) {
      setLocaleState(preferred);
      setT(translationsByLocale[preferred]);
      document.documentElement.lang = preferred;
      const nextPath = localePath(preferred);
      if (window.location.pathname !== nextPath) {
        router.replace(`${nextPath}${window.location.hash}`);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.lang = locale;
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

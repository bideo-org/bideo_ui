"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  LocaleCode,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isValidLocale,
} from "@/constants/locales";
import { getTranslation } from "@/constants/translations";

interface LanguageContextType {
  locale: LocaleCode;
  language: LanguageInfo;
  setLocale: (newLocale: LocaleCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ) => string;
  isRTL: boolean;
  supportedLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

function getInitialLocale(): LocaleCode {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  // 1. Check URL query parameters ?hl= or ?lang=
  try {
    const params = new URLSearchParams(window.location.search);
    const hl = params.get("hl") || params.get("lang");
    if (hl && isValidLocale(hl)) {
      return hl;
    }
  } catch {}

  // 2. Check document cookie
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
  );
  if (match && isValidLocale(match[1])) {
    return match[1];
  }

  // 3. Check localStorage
  try {
    const saved = localStorage.getItem(LOCALE_COOKIE_NAME);
    if (saved && isValidLocale(saved)) {
      return saved;
    }
  } catch {}

  // 4. Check browser navigator language
  if (typeof navigator !== "undefined" && navigator.language) {
    const browserCode = navigator.language.split("-")[0]?.toLowerCase();
    if (isValidLocale(browserCode)) {
      return browserCode;
    }
  }

  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  // Sync with saved preference on mount to guarantee SSR hydration match
  useEffect(() => {
    const initial = getInitialLocale();
    if (initial !== DEFAULT_LOCALE) {
      setLocaleState(initial);
    }
  }, []);

  const setLocale = useCallback((newLocale: LocaleCode) => {
    setLocaleState(newLocale);

    // Save in cookie (1 year expiration) and sync URL / DOM
    try {
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem(LOCALE_COOKIE_NAME, newLocale);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";

      // Synchronize ?hl= query param without reloading the page
      if (typeof window !== "undefined" && window.location) {
        const url = new URL(window.location.href);
        if (newLocale === DEFAULT_LOCALE) {
          url.searchParams.delete("hl");
          url.searchParams.delete("lang");
        } else {
          url.searchParams.set("hl", newLocale);
        }
        window.history.replaceState(null, "", url.toString());
      }
    } catch {}
  }, []);

  // Sync html lang and dir attributes whenever locale changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
  }, [locale]);

  const language = useMemo(
    () =>
      SUPPORTED_LANGUAGES.find((lang) => lang.code === locale) ||
      SUPPORTED_LANGUAGES[0],
    [locale]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      try {
        return new Intl.NumberFormat(locale, options).format(value);
      } catch {
        return value.toString();
      }
    },
    [locale]
  );

  const formatDate = useCallback(
    (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions
    ) => {
      try {
        const d = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(locale, options).format(d);
      } catch {
        return String(date);
      }
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      language,
      setLocale,
      t,
      formatNumber,
      formatDate,
      isRTL: locale === "ar",
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [locale, language, setLocale, t, formatNumber, formatDate]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

const defaultLanguageContext: LanguageContextType = {
  locale: DEFAULT_LOCALE,
  language: SUPPORTED_LANGUAGES[0],
  setLocale: () => {},
  t: (key: string, params?: Record<string, string | number>) =>
    getTranslation(DEFAULT_LOCALE, key, params),
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
    try {
      return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(value);
    } catch {
      return String(value);
    }
  },
  formatDate: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(d);
    } catch {
      return String(date);
    }
  },
  isRTL: false,
  supportedLanguages: SUPPORTED_LANGUAGES,
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context || defaultLanguageContext;
}

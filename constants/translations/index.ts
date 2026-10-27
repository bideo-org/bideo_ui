import { en, TranslationDictionary } from "./en";
import { hi } from "./hi";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { ja } from "./ja";
import { ar } from "./ar";
import { ru } from "./ru";
import { pt } from "./pt";
import { bn } from "./bn";
import { te } from "./te";
import { ta } from "./ta";
import { LocaleCode } from "../locales";

export type { TranslationDictionary };

export const TRANSLATIONS: Record<LocaleCode, TranslationDictionary> = {
  en,
  hi,
  es,
  fr,
  de,
  ja,
  ar,
  ru,
  pt,
  bn,
  te,
  ta,
};

/**
 * Safely resolves a nested dot-notation key (e.g. "nav.home")
 * with automatic fallback to English if missing or undefined.
 */
export function getTranslation(
  locale: LocaleCode,
  key: string,
  params?: Record<string, string | number>
): string {
  const currentDict = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const fallbackDict = TRANSLATIONS.en;

  const resolve = (dict: Record<string, unknown>, path: string): unknown => {
    return path.split(".").reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, dict);
  };

  let value = resolve(currentDict as unknown as Record<string, unknown>, key);
  if (typeof value !== "string") {
    value = resolve(fallbackDict as unknown as Record<string, unknown>, key);
  }

  if (typeof value !== "string") {
    return key;
  }

  // Handle interpolation params e.g. {count}
  if (params) {
    return Object.entries(params).reduce(
      (acc, [pKey, pVal]) => acc.replace(new RegExp(`{${pKey}}`, "g"), String(pVal)),
      value as string
    );
  }

  return value;
}

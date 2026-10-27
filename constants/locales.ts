export type LocaleCode =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "ja"
  | "ar"
  | "ru"
  | "pt"
  | "hi"
  | "bn"
  | "te"
  | "ta";

export interface LanguageInfo {
  code: LocaleCode;
  name: string;
  nativeName: string;
  region: "Worldwide" | "India";
  dir: "ltr" | "rtl";
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  // Worldwide Top Languages
  {
    code: "en",
    name: "English",
    nativeName: "English",
    region: "Worldwide",
    dir: "ltr",
    flag: "🌐",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    region: "Worldwide",
    dir: "ltr",
    flag: "🇪🇸",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    region: "Worldwide",
    dir: "ltr",
    flag: "🇫🇷",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    region: "Worldwide",
    dir: "ltr",
    flag: "🇩🇪",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    region: "Worldwide",
    dir: "ltr",
    flag: "🇯🇵",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    region: "Worldwide",
    dir: "rtl",
    flag: "🇸🇦",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    region: "Worldwide",
    dir: "ltr",
    flag: "🇷🇺",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    region: "Worldwide",
    dir: "ltr",
    flag: "🇧🇷",
  },

  // Indian National & Regional Languages
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    region: "India",
    dir: "ltr",
    flag: "🇮🇳",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    region: "India",
    dir: "ltr",
    flag: "🇮🇳",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    region: "India",
    dir: "ltr",
    flag: "🇮🇳",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    region: "India",
    dir: "ltr",
    flag: "🇮🇳",
  },
];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_COOKIE_NAME = "buzzclips_locale";

export function isValidLocale(code: string): code is LocaleCode {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

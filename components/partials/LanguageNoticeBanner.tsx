"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/store/language-context";
import { Globe, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_DISMISSED_KEY = "buzzclips_lang_banner_dismissed";

export function LanguageNoticeBanner() {
  const { locale, language, setLocale } = useLanguage();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Only show if locale is not English and user has not dismissed this session
    if (locale === "en") {
      setDismissed(true);
      return;
    }
    const isDismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    setDismissed(Boolean(isDismissed));
  }, [locale]);

  if (dismissed || locale === "en") {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setDismissed(true);
  };

  const handleSwitchToEnglish = () => {
    setLocale("en");
    setDismissed(true);
  };

  return (
    <aside
      aria-label="Language notice"
      className="w-full bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 border-b border-primary/20 backdrop-blur-md px-4 py-2 text-xs transition-all animate-in slide-in-from-top-2"
    >
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 text-primary shrink-0 animate-pulse" />
          <p className="text-foreground truncate">
            <span>Viewing BuzzClips in </span>
            <strong className="font-semibold text-primary">
              {language.nativeName} ({language.name})
            </strong>
            <span className="hidden sm:inline">. Want to browse in English?</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="default"
            onClick={handleSwitchToEnglish}
            className="h-7 px-2.5 text-xs font-semibold gap-1 rounded-full cursor-pointer shadow-xs"
          >
            <span>Convert to English</span>
            <ArrowRight className="w-3 h-3" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            aria-label="Dismiss language notice"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useLanguage } from "@/store/language-context";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LanguageSwitcherProps {
  variant?: "icon" | "full";
  className?: string;
}

export function LanguageSwitcher({
  variant = "icon",
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, supportedLanguages, language, t } = useLanguage();

  const worldwideLangs = supportedLanguages.filter(
    (l) => l.region === "Worldwide"
  );
  const indianLangs = supportedLanguages.filter((l) => l.region === "India");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="outline"
            size="icon"
            className={className}
            aria-label={t("common.switchLanguage")}
            title={`${t("common.switchLanguage")} (${language.nativeName})`}
          >
            <Globe className="h-[1.15rem] w-[1.15rem] text-muted-foreground hover:text-foreground transition-colors" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 h-9 text-xs font-semibold ${className}`}
            aria-label={t("common.switchLanguage")}
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{language.nativeName}</span>
            <span className="text-[10px] font-mono text-muted-foreground/70 uppercase">
              ({language.code})
            </span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 max-h-[380px] overflow-y-auto scrollbar-thin"
      >
        {/* Worldwide Top Languages */}
        <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
          {t("common.worldwide")}
        </DropdownMenuLabel>
        {worldwideLangs.map((lang) => {
          const isSelected = lang.code === locale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className="flex items-center justify-between cursor-pointer py-1.5 px-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    {lang.nativeName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {lang.name}
                  </span>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {/* Indian National & Regional Languages */}
        <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
          {t("common.indianLanguages")}
        </DropdownMenuLabel>
        {indianLangs.map((lang) => {
          const isSelected = lang.code === locale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className="flex items-center justify-between cursor-pointer py-1.5 px-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    {lang.nativeName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {lang.name}
                  </span>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

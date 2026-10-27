"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * NavigationProgress
 * 
 * Provides an instant top progress bar on route navigations.
 * Solves the Next.js App Router issue where page transitions have no browser feedback,
 * causing the web app to feel "stuck" or frozen when links are clicked.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [, startTransition] = useTransition();

  // Reset/complete progress when pathname or searchParams change
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept click on internal links to immediately trigger progress feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, downloads, new tabs, anchors, tel/mailto
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if target href is the exact same path
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start navigation progress instantly!
      startTransition(() => {
        setIsNavigating(true);
      });
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  return (
    <AnimatePresence>
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-1 overflow-hidden">
          {/* Main animated progress bar */}
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.7)]"
            initial={{ width: "0%", opacity: 1 }}
            animate={{
              width: ["0%", "35%", "75%", "90%"],
              transition: {
                times: [0, 0.2, 0.6, 1],
                duration: 2.5,
                ease: "easeOut",
              },
            }}
            exit={{
              width: "100%",
              opacity: 0,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
          />
          {/* Subtle glowing trailing light */}
          <motion.div
            className="absolute top-0 right-0 w-24 h-full bg-white/40 blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

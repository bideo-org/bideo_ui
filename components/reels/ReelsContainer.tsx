"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { VideoDTO } from "@/types/video";
import { ReelItem } from "./ReelItem";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Film, Play } from "lucide-react";
import Link from "next/link";

interface ReelsContainerProps {
  initialVideos: VideoDTO[];
}

export function ReelsContainer({ initialVideos }: ReelsContainerProps) {
  const [videos] = useState<VideoDTO[]>(initialVideos);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Sync mute state from localStorage after mount to avoid SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("buzzclips_reels_muted");
      if (saved !== null) {
        setIsMuted(saved === "true");
      }
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("buzzclips_reels_muted", String(next));
      } catch {}
      return next;
    });
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Lock body scrolling while on Reels page to prevent window bouncing
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // IntersectionObserver to auto-detect centered active reel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos.length]);

  // Scroll to a specific reel index
  const scrollToIndex = useCallback((index: number) => {
    if (index >= 0 && index < videos.length) {
      itemRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveIndex(index);
    }
  }, [videos.length]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === "m") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, scrollToIndex, toggleMute]);

  if (!videos || videos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[60vh]">
        <div className="w-16 h-16 rounded-3xl bg-muted/60 text-muted-foreground flex items-center justify-center border border-border/50">
          <Film className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">No Reels Available Yet</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Creator clips and shorts will appear here as new videos are uploaded.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="rounded-full text-xs">
            Back to Explore
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center items-center h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom,0px))] md:h-[calc(100vh-5rem)] overflow-hidden">
      {/* Mobile Floating Brand Header (Top Left) */}
      <div className="md:hidden absolute top-3.5 left-4 z-40 flex items-center gap-2 pointer-events-none select-none">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20">
          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
        </div>
        <span className="text-base font-black tracking-tight text-white drop-shadow-md font-logo">buzzclips</span>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-full text-white/90">
          Reels
        </span>
      </div>

      {/* Desktop Frame Shell / Mobile Full Frame */}
      <div className="relative w-full h-full md:max-w-[420px] md:aspect-[9/16] md:max-h-[85vh] md:rounded-3xl overflow-hidden md:border md:border-border/60 md:shadow-2xl md:shadow-black/50 bg-black">
        {/* Snap-Scrolling Vertical Window */}
        <div
          ref={containerRef}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none overscroll-y-contain"
        >
          {videos.map((video, idx) => (
            <div
              key={video.videoId}
              data-index={idx}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className="w-full h-full snap-start snap-always shrink-0 relative"
            >
              <ReelItem
                video={video}
                isActive={activeIndex === idx}
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Side Navigation Buttons (Next / Prev) */}
      <div className="hidden lg:flex flex-col items-center gap-3 absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 z-40">
        <Button
          size="icon"
          variant="outline"
          disabled={activeIndex === 0}
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="w-11 h-11 rounded-full bg-card/80 backdrop-blur-md border-border/60 hover:bg-card shadow-lg disabled:opacity-30"
          title="Previous Reel (ArrowUp / K)"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>

        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
          {activeIndex + 1} / {videos.length}
        </span>

        <Button
          size="icon"
          variant="outline"
          disabled={activeIndex === videos.length - 1}
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="w-11 h-11 rounded-full bg-card/80 backdrop-blur-md border-border/60 hover:bg-card shadow-lg disabled:opacity-30"
          title="Next Reel (ArrowDown / J)"
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

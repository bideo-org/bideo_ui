"use client";

import React from "react";
import { Sparkles, ArrowRight, Music, Sliders, Smartphone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/store/auth-context";

interface ReelsStudioBannerProps {
  onOpenStudio: () => void;
}

export const ReelsStudioBanner: React.FC<ReelsStudioBannerProps> = ({
  onOpenStudio,
}) => {
  const { user } = useAuth();

  // ONLY available for logged in users as specified by requirement
  if (!user) return null;

  return (
    <div className="relative group w-full rounded-2xl overflow-hidden p-[2px] transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 mb-6">
      {/* Radiant Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 via-amber-400 to-cyan-400 rounded-2xl animate-gradient-x opacity-90 group-hover:opacity-100 transition-opacity" />

      {/* Inner Card Container */}
      <div className="relative bg-card/95 dark:bg-card/90 backdrop-blur-xl rounded-[14px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Glow Accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Left Info & Badges */}
        <div className="space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              NEW: Reels Studio ✨
            </span>
            <Badge
              variant="outline"
              className="text-[11px] font-semibold bg-background/60 border-purple-500/30 text-purple-600 dark:text-purple-300"
            >
              Exclusive for Creators
            </Badge>
          </div>

          <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
            Create an Instagram Reel-like Video
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            Trim footage, apply viral filters (Clarendon, Golden Hour, Cyberpunk),
            add draggable text and stickers, mix trending soundtracks, and preview
            in 9:16 vertical before publishing!
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-pink-500" />
              9:16 Vertical
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-500" />
              Filters & Speed
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-amber-500" />
              Soundtracks
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              1-Click Upload
            </span>
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="w-full sm:w-auto z-10 shrink-0">
          <Button
            type="button"
            onClick={onOpenStudio}
            className="w-full sm:w-auto h-11 px-5 rounded-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Open Reels Studio
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

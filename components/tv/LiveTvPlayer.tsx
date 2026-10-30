"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const VideoPlayer = dynamic(
  () => import("@/components/player/VideoPlayer").then((mod) => mod.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video rounded-2xl bg-black/60 flex items-center justify-center border border-white/10 overflow-hidden relative">
        <Skeleton className="w-full h-full bg-muted/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
        </div>
      </div>
    ),
  }
);
import { LiveChannel } from "@/constants/liveChannels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

interface LiveTvPlayerProps {
  channel: LiveChannel;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
}

export function LiveTvPlayer({
  channel,
  onPrevChannel,
  onNextChannel,
}: LiveTvPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Auto-collapse description when switching channels
  useEffect(() => {
    setIsDescExpanded(false);
  }, [channel.id]);

  const handleShare = async () => {
    const url = `${window.location.origin}/tv?channel=${channel.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${channel.name} Live Stream - BuzzClips TV`,
          text: `Watch ${channel.name} (${channel.hindiName || channel.name}) live free on BuzzClips TV!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("Live stream link copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="space-y-4">
      {/* 16:9 Class-Leading Live Player with DVR Time-Shifting */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video ring-1 ring-border/50 shadow-2xl shadow-black/40 group">
        <VideoPlayer
          key={channel.id}
          ref={playerRef}
          src={channel.streamUrl}
          poster={channel.logo}
          isLive={true}
          onPrevChannel={onPrevChannel}
          onNextChannel={onNextChannel}
          channelName={channel.name}
          channelNumber={channel.channelNumber}
          countryFlag={channel.countryFlag}
        />
      </div>

      {/* Channel Metadata Card */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-card/75 border border-border/40 backdrop-blur-sm shadow-sm space-y-2 sm:space-y-2.5">
        {/* Row 1: Channel Title, Hindi/Local Name, Surfing Buttons and Share Action */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl leading-none" title={channel.country}>
                {channel.countryFlag}
              </span>
              <h1 className="text-base sm:text-xl font-bold text-foreground leading-tight">
                {channel.name}
              </h1>
              {channel.hindiName && (
                <span className="text-xs sm:text-sm font-semibold text-primary font-mono shrink-0">
                  ({channel.hindiName})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Channel Surfing buttons */}
            {onPrevChannel && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPrevChannel}
                className="h-7 sm:h-8 px-2 rounded-full bg-muted/40 hover:bg-muted border-border/50 text-xs gap-1 cursor-pointer"
                title="Previous Channel ([)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Button>
            )}

            {onNextChannel && (
              <Button
                size="sm"
                variant="outline"
                onClick={onNextChannel}
                className="h-7 sm:h-8 px-2 rounded-full bg-muted/40 hover:bg-muted border-border/50 text-xs gap-1 cursor-pointer"
                title="Next Channel (])"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="gap-1.5 text-xs h-7 sm:h-8 px-2.5 sm:px-3 rounded-full bg-muted/40 hover:bg-muted border-border/50 shrink-0 cursor-pointer"
              title="Share Live TV Channel"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Row 2: Badges row in a clean horizontal strip */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
            Live DVR
          </span>
          <Badge
            variant="outline"
            className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide bg-primary/10 text-primary border-primary/20 shrink-0"
          >
            {channel.category}
          </Badge>
          <Badge variant="secondary" className="text-[10px] sm:text-[11px] shrink-0">
            {channel.countryFlag} {channel.country}
          </Badge>
          <Badge variant="secondary" className="text-[10px] sm:text-[11px] shrink-0 hidden sm:inline-flex">
            {channel.broadcaster}
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
            CH {channel.channelNumber}
          </span>
          <span className="text-[11px] text-muted-foreground ml-auto hidden md:inline">
            {channel.language.join(", ")}
          </span>
        </div>

        {/* Row 3: Description with View More / Show Less */}
        <div className="pt-0.5">
          <p
            className={clsx(
              "text-xs text-muted-foreground leading-relaxed transition-all",
              !isDescExpanded && "line-clamp-2"
            )}
          >
            {channel.description}
          </p>
          {channel.description && channel.description.length > 80 && (
            <button
              onClick={() => setIsDescExpanded((prev) => !prev)}
              className="text-[11px] font-semibold text-primary hover:text-primary/80 mt-1 inline-flex items-center gap-1 transition-colors cursor-pointer select-none"
              aria-expanded={isDescExpanded}
              aria-label={isDescExpanded ? "Show less description" : "View more description"}
            >
              <span>{isDescExpanded ? "Show less" : "View more"}</span>
              <ChevronDown
                className={clsx(
                  "w-3 h-3 transition-transform duration-200",
                  isDescExpanded && "rotate-180"
                )}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default LiveTvPlayer;

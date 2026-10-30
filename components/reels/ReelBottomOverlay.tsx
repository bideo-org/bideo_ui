"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VideoDTO } from "@/types/video";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/store/language-context";

interface ReelBottomOverlayProps {
  video: VideoDTO;
  progressPercent: number;
}

export function ReelBottomOverlay({ video, progressPercent }: ReelBottomOverlayProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const uploader = video.video_uploader;
  const displayName = uploader?.fullName || uploader?.user_name || "BuzzClips Creator";
  const handle = uploader?.username ? `@${uploader.username}` : `@${uploader?.user_name || "creator"}`;
  const channelHref = uploader?.username
    ? `/channel/@${uploader.username}`
    : uploader?.userId
    ? `/profile/${uploader.userId}`
    : "#";

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pb-4 sm:pb-6 z-20 text-white bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none">
      <div className="space-y-2 max-w-[82%] sm:max-w-[85%] pointer-events-auto">
        {/* Creator Name & Handle */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={channelHref}
            className="font-bold text-sm sm:text-base text-white hover:text-primary transition-colors drop-shadow-md flex items-center gap-1.5"
          >
            <span>{displayName}</span>
            <span className="text-xs text-white/75 font-normal font-mono">{handle}</span>
          </Link>
          {video.category && (
            <Badge variant="outline" className="text-[10px] py-0 px-2 bg-white/10 text-white border-white/20 backdrop-blur-xs">
              {video.category}
            </Badge>
          )}
        </div>

        {/* Video Title / Caption */}
        <div>
          <p
            onClick={() => setIsExpanded(!isExpanded)}
            className={clsx(
              "text-xs sm:text-sm text-white/95 leading-relaxed cursor-pointer drop-shadow-md transition-all",
              !isExpanded && "line-clamp-2"
            )}
          >
            {video.video_title}
            {video.description && isExpanded && (
              <span className="block mt-1 text-xs text-white/80 font-normal">
                {video.description}
              </span>
            )}
          </p>
          {(video.video_title.length > 70 || video.description) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-semibold text-white/70 hover:text-white mt-0.5 inline-block focus:outline-none"
            >
              {isExpanded ? t("watch.showLess") : t("watch.showMore")}
            </button>
          )}
        </div>

        {/* Music / Audio Ticker */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/10 text-xs text-white">
            <Music className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[11px] font-medium truncate max-w-[160px]">
              Original Audio • {displayName}
            </span>
          </div>

          {/* Rotating Vinyl Disc */}
          <div className="w-6 h-6 rounded-full bg-zinc-900 border-2 border-white/30 flex items-center justify-center animate-spin [animation-duration:4s]">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
}

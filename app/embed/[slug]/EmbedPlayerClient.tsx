"use client";

import React, { useRef, useEffect } from "react";
import { VideoDTO } from "@/types/video";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import Link from "next/link";
import { Play, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbedPlayerClientProps {
  video: VideoDTO | null;
  slug: string;
  initialTime?: number;
}

export const EmbedPlayerClient: React.FC<EmbedPlayerClientProps> = ({
  video,
  slug,
  initialTime,
}) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (initialTime && playerRef.current && initialTime > 0) {
      try {
        playerRef.current.currentTime = initialTime;
      } catch {
        // seek on loaded
      }
    }
  }, [initialTime]);

  if (!video || !video.m3u8Url) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-950 text-white text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-zinc-200">Video Unavailable</h3>
          <p className="text-xs text-zinc-500 max-w-xs">
            This video may be private, processing, or removed by its creator.
          </p>
        </div>
        <Link href={`/watch/${slug}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 border-zinc-700">
            Open on BuzzClips
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  const streamSrc = video.m3u8Url;
  const watchUrl = `/watch/${video.slug || video.videoId}`;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black group select-none">
      {/* Video Player */}
      <div className="w-full h-full flex items-center justify-center">
        <VideoPlayer
          ref={playerRef}
          src={streamSrc}
          poster={video.thumbnail_url}
          vttUrl={video.vtt_url}
          storyboardUrl={video.storyboard_url}
        />
      </div>

      {/* Floating Brand Watermark Badge (top-right corner) */}
      <Link
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 transition-all shadow-lg hover:scale-105 active:scale-95 group-hover:opacity-100 opacity-80"
        title="Watch full video on BuzzClips"
      >
        <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
          <Play className="w-2 h-2 text-white fill-white ml-0.2" />
        </span>
        <span className="tracking-tight">buzzclips</span>
        <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
      </Link>
    </div>
  );
};

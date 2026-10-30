"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VideoDTO } from "@/types/video";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";
import { useAuth } from "@/store/auth-context";
import { useLanguage } from "@/store/language-context";
import { api_instance } from "@/global";
import { toast } from "sonner";
import clsx from "clsx";

interface ReelActionRailProps {
  video: VideoDTO;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenComments: () => void;
  onOpenSaveModal: () => void;
}

export function ReelActionRail({
  video,
  isMuted,
  onToggleMute,
  onOpenComments,
  onOpenSaveModal,
}: ReelActionRailProps) {
  const { token } = useAuth();
  const { t, formatNumber } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.video_views ? Math.floor(video.video_views * 0.12) : 24);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const uploader = video.video_uploader;
  const channelHref = uploader?.username
    ? `/channel/@${uploader.username}`
    : uploader?.userId
    ? `/profile/${uploader.userId}`
    : "#";

  const handleLike = async () => {
    if (!token) {
      toast.info("Please sign in to like this clip");
      return;
    }
    const nextState = !liked;
    setLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 600);

    try {
      await fetch(`${api_instance}/vid/${video.videoId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Revert if API fails
      setLiked(!nextState);
      setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/watch/${video.slug || video.videoId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.video_title,
          text: `Watch this reel on BuzzClips!`,
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
      toast.success("Link copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-white z-30 select-none">
      {/* Creator Profile Avatar */}
      <div className="relative group">
        <Link href={channelHref}>
          <Avatar className="w-11 h-11 border-2 border-white shadow-lg group-hover:scale-105 transition-transform">
            <AvatarImage src={uploader?.avatar_url || ""} alt={uploader?.user_name || "Creator"} />
            <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-purple-600 font-bold text-xs text-white">
              {(uploader?.fullName || uploader?.user_name || "C")[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* Like Heart Button */}
      <button
        onClick={handleLike}
        className="flex flex-col items-center gap-1 group focus:outline-none"
        aria-label="Like reel"
      >
        <div
          className={clsx(
            "w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all group-hover:bg-black/60 group-active:scale-90",
            isLikeAnimating && "scale-125"
          )}
        >
          <Heart
            className={clsx(
              "w-6 h-6 transition-colors duration-200",
              liked ? "fill-red-500 text-red-500" : "text-white group-hover:text-red-400"
            )}
          />
        </div>
        <span className="text-[11px] font-bold tracking-tight drop-shadow-md">
          {formatNumber(likeCount)}
        </span>
      </button>

      {/* Comments Button */}
      <button
        onClick={onOpenComments}
        className="flex flex-col items-center gap-1 group focus:outline-none"
        aria-label="View comments"
      >
        <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all group-hover:bg-black/60 group-active:scale-90">
          <MessageCircle className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" />
        </div>
        <span className="text-[11px] font-bold tracking-tight drop-shadow-md">
          {t("reels.comments")}
        </span>
      </button>

      {/* Save to Playlist / Bookmark */}
      <button
        onClick={onOpenSaveModal}
        className="flex flex-col items-center gap-1 group focus:outline-none"
        aria-label="Save to playlist"
      >
        <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all group-hover:bg-black/60 group-active:scale-90">
          <Bookmark className="w-5 h-5 text-white group-hover:text-amber-400 transition-colors" />
        </div>
        <span className="text-[11px] font-bold tracking-tight drop-shadow-md">
          {t("common.save")}
        </span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1 group focus:outline-none"
        aria-label="Share clip"
      >
        <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all group-hover:bg-black/60 group-active:scale-90">
          {isCopied ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <Share2 className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
          )}
        </div>
        <span className="text-[11px] font-bold tracking-tight drop-shadow-md">
          {isCopied ? t("common.copied") : t("common.share")}
        </span>
      </button>

      {/* Mute/Volume Toggle */}
      <button
        onClick={onToggleMute}
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all hover:bg-black/60 active:scale-90 focus:outline-none"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  );
}

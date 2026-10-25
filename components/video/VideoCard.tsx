"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Play, Eye, Clock, Flame } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

import { VideoDTO } from "@/types/video";

type VideoCardProps = {
  video: VideoDTO;
  rank?: number;
};

export default function VideoCard({ video, rank }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoHref = video.slug
    ? `/watch/${video.slug}`
    : `/video/${video.videoId}/view`;

  const timeAgo = formatDistanceToNow(new Date(video.video_uploadDate), {
    addSuffix: true,
  });

  const formattedViews =
    video.video_views > 100000
      ? `${(video.video_views / 100000).toFixed(1)}L`
      : video.video_views > 1000
        ? `${(video.video_views / 1000).toFixed(1)}K`
        : `${video.video_views.toLocaleString()}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const videoUrl = `${window.location.origin}${videoHref}`;
    try {
      await navigator.clipboard.writeText(videoUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error(err);
    }
  };

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play()?.catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const uploader = video.video_uploader;
  const displayName =
    uploader?.fullName || uploader?.full_name || uploader?.user_name || "Creator";
  const handle = uploader?.username
    ? `@${uploader.username}`
    : uploader?.user_name
    ? `@${uploader.user_name}`
    : "";
  const channelHref = uploader?.username
    ? `/channel/@${uploader.username}`
    : uploader?.userId
    ? `/channel/${uploader.userId}`
    : "#";
  const avatarUrl = uploader?.avatar_url || "";
  const duration = video.video_duration || "0:00";

  return (
    <div
      className="group w-full max-w-full sm:max-w-sm flex flex-col transition-transform duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail with hover preview */}
      <Link href={videoHref} className="block">
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/5 dark:bg-white/5 ring-1 ring-border/50 transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/40 group-hover:shadow-xl group-hover:shadow-primary/5">
          {/* Poster/Thumbnail */}
          <video
            ref={videoRef}
            src={video.m3u8Url}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            playsInline
            preload="metadata"
            poster={video.thumbnail_url}
            loop
          />

          {/* Top-Left Badges: Rank & Category (sitting side-by-side without overlapping) */}
          {(typeof rank === "number" || video.category) && (
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap max-w-[85%]">
              {typeof rank === "number" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black tracking-tight shadow-md backdrop-blur-md border border-red-500/40 text-white bg-red-600/90 transition-colors">
                  <Flame className="w-3 h-3 fill-white" />
                  <span>#{rank}</span>
                </span>
              )}

              {video.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-black/70 backdrop-blur-md text-white border border-white/15 shadow-xs">
                  {video.category}
                </span>
              )}
            </div>
          )}

          {/* Hover overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play icon on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md border border-white/10 transition-all duration-300">
            <Clock className="w-3 h-3" />
            {duration}
          </div>

          {/* Share button (appears on hover) */}
          <button
            onClick={handleShare}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 scale-75 group-hover:scale-100 border border-white/10 shadow-md"
            aria-label="Share video"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </Link>

      {/* Video info */}
      <div className="flex items-start gap-3 mt-3 px-0.5">
        <Link href={channelHref} className="shrink-0 mt-0.5">
          <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/40 shadow-xs">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-xs font-bold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={videoHref}>
            <h3 className="text-sm font-semibold line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
              {video.video_title}
            </h3>
          </Link>
          <Link
            href={channelHref}
            className="text-muted-foreground text-xs mt-1 truncate hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
          >
            <span className="truncate">{displayName}</span>
            {handle && (
              <span className="text-[11px] font-mono text-muted-foreground/60 truncate min-w-0">
                {handle}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Eye className="w-3 h-3" />
              {formattedViews} views
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span suppressHydrationWarning>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

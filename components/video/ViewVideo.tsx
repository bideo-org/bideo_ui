"use client";

import VideoPlayer from "@/components/player/VideoPlayer";
import {
  getVideoById,
  getVideoBySlug,
  fetchVideos,
  fetchRelatedVideos,
  recordVideoView,
  VideoDTO,
} from "@/utility/requests";
import { VideoSeoHead } from "./VideoSeoHead";
import EngagementButtons from "./EngagementButtons";
import CommentsSection from "./CommentsSection";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { SaveToPlaylistModal } from "./SaveToPlaylistModal";
import useResumePlayback from "@/utility/useResumePlayback";
import { useAuth } from "@/store/auth-context";
import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Eye,
  Clock,
  Play,
  Sparkles,
  Film,
  AlertCircle,
  ArrowLeft,
  Tag,
  BookmarkPlus,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";

interface ViewVideoProps {
  id?: string;
  slug?: string;
  initialVideo?: VideoDTO;
}

export default function ViewVideo({ id, slug, initialVideo }: ViewVideoProps) {
  const { token } = useAuth();
  const playerRef = useRef<any>(null);
  const [video, setVideo] = useState<VideoDTO | null>(initialVideo || null);
  const [error, setError] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const { onTimeUpdate } = useResumePlayback({
    videoId: video?.videoId,
    playerRef,
    token: token || undefined,
  });

  const handleSeekTo = (seconds: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(seconds, "seconds");
      const mins = Math.floor(seconds / 60);
      const secs = (seconds % 60).toString().padStart(2, "0");
      toast.info(`Jumped to ${mins}:${secs}`);
    }
  };

  // Fetch current video details by slug or id
  useEffect(() => {
    let isMounted = true;
    async function fetchVideo() {
      if (
        initialVideo &&
        ((slug && initialVideo.slug === slug) ||
          (id &&
            (String(initialVideo.videoId) === id ||
              initialVideo.slug === id)))
      ) {
        return;
      }
      try {
        setError(null);
        let data: VideoDTO;
        if (slug) {
          data = await getVideoBySlug(slug);
        } else if (id) {
          // If pure number, use view by id; otherwise treat as slug
          if (/^\d+$/.test(id)) {
            data = await getVideoById(id);
          } else {
            data = await getVideoBySlug(id);
          }
        } else {
          throw new Error("No video identifier provided");
        }
        if (isMounted) setVideo(data);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load video.";
        if (isMounted) setError(errorMsg);
      }
    }

    fetchVideo();
    return () => {
      isMounted = false;
    };
  }, [id, slug, initialVideo]);

  // Record verified view after 5 seconds of playback engagement
  useEffect(() => {
    if (!video?.videoId) return;
    const timer = setTimeout(() => {
      recordVideoView(video.videoId);
    }, 5000);
    return () => clearTimeout(timer);
  }, [video?.videoId]);

  // Fetch smart recommended / related videos for sidebar
  const { data: recsData, isLoading: recsLoading } = useQuery<{
    content: VideoDTO[];
  }>({
    queryKey: ["relatedVideos", video?.videoId],
    queryFn: async () => {
      if (video?.videoId) {
        try {
          const related = await fetchRelatedVideos(video.videoId, 0, 10);
          if (related?.content && related.content.length > 0) {
            return related;
          }
        } catch {
          // Fallback to latest videos
        }
      }
      return fetchVideos(0);
    },
    staleTime: 60 * 1000,
    enabled: Boolean(video?.videoId),
  });

  const recommendations = useMemo(() => {
    if (!recsData?.content) return [];
    return recsData.content
      .filter(
        (v) =>
          v.videoId.toString() !== id &&
          v.slug !== slug &&
          (v.videoStatus === "COMPLETED" || !v.videoStatus)
      )
      .slice(0, 8);
  }, [recsData, id, slug]);

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="border border-border/50 shadow-xl bg-card/85 backdrop-blur-md rounded-2xl max-w-md w-full text-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">
              Unable to load video
            </h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Link href="/" className="block pt-2">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const formattedViews = video
    ? video.video_views > 100000
      ? `${(video.video_views / 100000).toFixed(1)}L`
      : video.video_views > 1000
      ? `${(video.video_views / 1000).toFixed(1)}K`
      : video.video_views.toLocaleString()
    : "0";

  const timeAgo = video?.video_uploadDate
    ? formatDistanceToNow(new Date(video.video_uploadDate), { addSuffix: true })
    : "";

  const formattedDate = video?.video_uploadDate
    ? new Date(video.video_uploadDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Dynamic SEO Meta Tags & Schema.org JSON-LD */}
      {video && <VideoSeoHead video={video} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* === Left: Main Player & Video Details (Col 8) === */}
        <div className="lg:col-span-8 space-y-5">
          {/* Theater Video Player */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video ring-1 ring-border/50 shadow-2xl shadow-black/30">
            {video && video.m3u8Url ? (
              <VideoPlayer
                ref={playerRef}
                src={video.m3u8Url}
                poster={video.thumbnail_url}
                vttUrl={video.vtt_url}
                storyboardUrl={video.storyboard_url}
                onTimeUpdate={onTimeUpdate}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/60">
                <Skeleton className="w-full h-full rounded-2xl" />
              </div>
            )}
          </div>

          {/* Video Metadata Header */}
          {video ? (
            <div className="space-y-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
                {video.video_title}
              </h1>

              {/* Creator & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                {/* Creator Profile & Subscribe */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const uploader = video.video_uploader;
                      const displayName =
                        uploader?.fullName ||
                        uploader?.full_name ||
                        uploader?.user_name ||
                        "Creator";
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

                      return (
                        <>
                          <Link href={channelHref}>
                            <Avatar className="h-11 w-11 ring-2 ring-primary/20 hover:ring-primary/50 transition-all cursor-pointer">
                              <AvatarImage
                                src={uploader?.avatar_url || ""}
                                alt={displayName}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>

                          <div>
                            <Link
                              href={channelHref}
                              className="font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors block leading-tight"
                            >
                              {displayName}
                            </Link>
                            {handle ? (
                              <Link
                                href={channelHref}
                                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {handle}
                              </Link>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Creator
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {video.video_uploader?.userId && (
                    <SubscribeButton
                      channelId={video.video_uploader.userId}
                      size="sm"
                    />
                  )}
                </div>

                {/* Right Actions: Views, Date, Engagement, Save */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/60 border border-border/40 text-foreground shrink-0">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{formattedViews} views</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground bg-muted/40 border border-border/30 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeAgo}</span>
                  </div>

                  <div className="shrink-0">
                    <EngagementButtons videoId={video.videoId} />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSaveModalOpen(true)}
                    className="h-8 gap-1.5 rounded-full text-xs font-semibold bg-muted/40 hover:bg-muted/80 border-border/40 shrink-0"
                    title="Save to playlist or watch later"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
                    <span>Save</span>
                  </Button>
                </div>
              </div>

              {/* Video Details Card */}
              <Card className="border border-border/40 bg-card/75 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                <CardContent className="p-0 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      HLS Adaptive Stream
                    </Badge>

                    {video.category && (
                      <Link href={`/category/${video.category.toLowerCase()}`}>
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold bg-background/50 uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          {video.category}
                        </Badge>
                      </Link>
                    )}

                    {video.visibility && video.visibility !== "PUBLIC" && (
                      <Badge
                        variant="outline"
                        className="text-xs font-medium text-amber-500 border-amber-500/30"
                      >
                        {video.visibility}
                      </Badge>
                    )}

                    <Badge variant="outline" className="text-xs font-medium">
                      HD Quality
                    </Badge>

                    {video.video_duration && (
                      <Badge variant="outline" className="text-xs font-medium">
                        Duration: {video.video_duration}
                      </Badge>
                    )}
                  </div>

                  {/* Video Description with View More / Show Less */}
                  {video.description ? (
                    <div>
                      <div
                        className={clsx(
                          "text-sm text-foreground/90 whitespace-pre-line leading-relaxed pt-1 break-words [overflow-wrap:anywhere] min-w-0 transition-all",
                          !isDescExpanded && "line-clamp-3"
                        )}
                      >
                        {video.description}
                      </div>
                      {video.description.length > 150 && (
                        <button
                          onClick={() => setIsDescExpanded((prev) => !prev)}
                          className="text-xs font-semibold text-primary hover:text-primary/80 mt-2 inline-flex items-center gap-1 transition-colors cursor-pointer select-none"
                          aria-expanded={isDescExpanded}
                          aria-label={isDescExpanded ? "Show less description" : "View more description"}
                        >
                          <span>{isDescExpanded ? "Show less" : "View more"}</span>
                          <ChevronDown
                            className={clsx(
                              "w-3.5 h-3.5 transition-transform duration-200",
                              isDescExpanded && "rotate-180"
                            )}
                          />
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No description provided.
                    </p>
                  )}

                  {/* Programmatic Tag Hub Links */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 min-w-0 max-w-full">
                      {video.tags.map((tag) => {
                        const cleanTag = tag.trim().replace(/^#/, "");
                        return (
                          <Link
                            key={tag}
                            href={`/tag/${encodeURIComponent(cleanTag)}`}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40 font-medium hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            #{cleanTag}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                    Uploaded on{" "}
                    <span suppressHydrationWarning className="font-medium text-foreground">
                      {formattedDate}
                    </span>{" "}
                    • Encoded with adaptive streaming for ultra-low latency and
                    dynamic resolution scaling.
                  </p>
                </CardContent>
              </Card>

              {/* Interactive Comments Section with Timestamp Seeking */}
              <CommentsSection
                videoId={video.videoId}
                videoUploaderId={video.video_uploader?.userId || (video.video_uploader as any)?.id}
                onSeekTo={handleSeekTo}
              />
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <Skeleton className="w-3/4 h-8 rounded-lg" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-20 h-3" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-20 h-8 rounded-full" />
                  <Skeleton className="w-20 h-8 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-full h-24 rounded-xl" />
            </div>
          )}
        </div>

        {/* === Right: Up Next / Recommended Videos (Col 4) === */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <Film className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Up Next
            </h2>
          </div>

          <div className="space-y-3">
            {recsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-36 h-20 rounded-lg shrink-0" />
                  <div className="space-y-2 flex-1 py-1">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-2/3 h-3" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                </div>
              ))
            ) : recommendations.length > 0 ? (
              recommendations.map((item) => {
                const itemTimeAgo = formatDistanceToNow(
                  new Date(item.video_uploadDate),
                  { addSuffix: true }
                );
                const itemViews =
                  item.video_views > 1000
                    ? `${(item.video_views / 1000).toFixed(1)}K`
                    : item.video_views.toString();

                const videoHref = item.slug
                  ? `/watch/${item.slug}`
                  : `/video/${item.videoId}/view`;

                return (
                  <Link
                    key={item.videoId}
                    href={videoHref}
                    className="group flex gap-3 p-1.5 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    {/* Compact Thumbnail */}
                    <div className="relative w-36 h-20 rounded-lg overflow-hidden bg-black/10 shrink-0 group-hover:ring-1 group-hover:ring-primary/30 transition-all">
                      <Image
                        src={item.thumbnail_url || ""}
                        alt={item.video_title}
                        fill
                        sizes="144px"
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                      {/* Duration */}
                      {item.video_duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.2 rounded">
                          {item.video_duration}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1 py-0.5">
                      <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors text-foreground">
                        {item.video_title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1 truncate">
                        {item.video_uploader?.user_name || "Creator"}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                        <span>{itemViews} views</span>
                        <span>•</span>
                        <span suppressHydrationWarning>{itemTimeAgo}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-6 text-center text-muted-foreground text-xs border border-dashed rounded-xl">
                No more videos available.
              </div>
            )}
          </div>
        </div>
      </div>

      {video && (
        <SaveToPlaylistModal
          videoId={video.videoId}
          videoTitle={video.video_title}
          isOpen={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
        />
      )}
    </div>
  );
}

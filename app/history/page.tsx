"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/store/auth-context";
import {
  fetchUserWatchHistory,
  deleteWatchHistoryItem,
  clearAllWatchHistory,
  WatchProgressDTO,
} from "@/utility/requests";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  History,
  Trash2,
  Play,
  ArrowLeft,
  LogIn,
  CheckCircle2,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function WatchHistoryPage() {
  const { token, isAuthenticated } = useAuth();
  const [historyItems, setHistoryItems] = useState<WatchProgressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchUserWatchHistory(0, 50, token)
      .then((res) => {
        if (!isMounted) return;
        setHistoryItems(res.content || []);
      })
      .catch((err) => {
        console.error("Failed to load history", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleRemoveItem = (videoId: number) => {
    if (!token) return;

    // Optimistic remove
    setHistoryItems((prev) => prev.filter((item) => item.videoId !== videoId));

    startTransition(async () => {
      try {
        await deleteWatchHistoryItem(videoId, token);
        toast.success("Removed from watch history");
      } catch {
        toast.error("Failed to remove item. Please refresh.");
      }
    });
  };

  const handleClearAll = () => {
    if (!token || historyItems.length === 0) return;

    const previous = historyItems;
    setHistoryItems([]);

    startTransition(async () => {
      try {
        await clearAllWatchHistory(token);
        toast.success("Watch history cleared");
      } catch {
        setHistoryItems(previous);
        toast.error("Failed to clear watch history");
      }
    });
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="w-full flex justify-center py-12 px-4">
        <Card className="border border-border/50 shadow-xl bg-card/85 backdrop-blur-md rounded-2xl max-w-md w-full text-center p-8 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight">Watch History</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to view videos you&apos;ve watched and resume playback where you left off.
            </p>
          </div>
          <Link href="/auth/login" className="block pt-2">
            <Button className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to View History
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6 sm:py-10 px-4">
      <div className="w-full lg:max-w-[85%] sm:max-w-full space-y-6">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Explore
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Watch History
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {historyItems.length} {historyItems.length === 1 ? "video" : "videos"} watched
                </p>
              </div>
            </div>

            {historyItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={isPending}
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 gap-1.5 self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All History
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl border border-border/40 bg-card/30">
                <Skeleton className="w-full sm:w-60 aspect-video rounded-xl shrink-0" />
                <div className="space-y-2.5 flex-1 py-1">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                  <Skeleton className="h-3 w-1/4 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : historyItems.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-dashed border-border/60">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                Your watch history is clear
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Videos you watch on BuzzClips will automatically appear here with saved playback positions.
              </p>
            </div>
            <Link href="/" className="inline-block pt-2">
              <Button size="sm">Explore Videos</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item) => {
              const progressPct =
                item.durationSeconds && item.durationSeconds > 0
                  ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
                  : item.completed
                  ? 100
                  : 0;

              const timeAgo = item.lastWatchedAt
                ? formatDistanceToNow(new Date(item.lastWatchedAt), { addSuffix: true })
                : "recently";

              const watchUrl = item.slug ? `/watch/${item.slug}` : `/watch/${item.videoId}`;

              return (
                <div
                  key={item.videoId}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-xl bg-card/75 border border-border/40 hover:border-border/80 transition-all group"
                >
                  <Link
                    href={watchUrl}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0"
                  >
                    {/* Thumbnail with progress bar */}
                    <div className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.videoTitle || "Video"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/80 text-muted-foreground">
                          <Play className="w-6 h-6 opacity-40" />
                        </div>
                      )}

                      {/* Hover play icon */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>

                      {/* Progress bar overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                        <div
                          className="h-full bg-red-600 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {item.videoTitle}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {item.channelAvatar ? (
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={item.channelAvatar} />
                            <AvatarFallback>{(item.channelName || "C").slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                        <span className="font-medium text-foreground/80">
                          {item.channelName || "Creator"}
                        </span>
                        {item.channelHandle && (
                          <span className="font-mono text-muted-foreground">
                            {item.channelHandle}
                          </span>
                        )}
                        <span>•</span>
                        <span suppressHydrationWarning>Watched {timeAgo}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {item.completed ? (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </Badge>
                        ) : progressPct > 0 ? (
                          <span className="text-[11px] font-medium text-primary">
                            Resumes at {Math.round(item.progressSeconds)}s ({progressPct}%)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>

                  {/* Delete action */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.videoId)}
                    className="text-muted-foreground hover:text-destructive self-end sm:self-center shrink-0"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

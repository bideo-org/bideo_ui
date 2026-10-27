"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserVideos } from "@/utility/requests";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MESSAGES } from "@/constants/messages";
import { useAuth } from "@/store/auth-context";
import Link from "next/link";
import Image from "next/image";
import DeleteVideoButton from "../video/DeleteVideoButton";
import { EditVideoModal } from "../video/EditVideoModal";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Video as VideoIcon,
  Eye,
  Clock,
  Share2,
  Play,
  Plus,
  Search,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Film,
  Sparkles,
  LogIn,
  X,
} from "lucide-react";

import { VideoDTO, PaginatedVideoResponse } from "@/types/video";

type Video = VideoDTO;

export default function MyVideos() {
  // Helper to normalize video status with fallback to m3u8Url
  const getNormalizedStatus = (v: Video): string => {
    if (v.videoStatus) return v.videoStatus;
    if (v.m3u8Url && v.m3u8Url.trim() !== "") return "COMPLETED";
    return "PENDING";
  };

  const { user, token } = useAuth();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data, isLoading, error } = useQuery<PaginatedVideoResponse, Error>({
    queryKey: ["userVideos", user?.userId ?? "", page],
    enabled: !!user?.userId,
    queryFn: () =>
      fetchUserVideos(page, user?.userId as string, token as string),
    staleTime: 30 * 1000,
    refetchInterval: (query) => {
      const videos = query.state.data?.content ?? [];
      const hasPending = videos.some(
        (v) => getNormalizedStatus(v) === "PROCESSING" || getNormalizedStatus(v) === "PENDING"
      );
      return hasPending ? 5000 : false;
    },
    retry: 1,
  });

  useEffect(() => {
    if (error) toast.error(MESSAGES.EXPLORE_VIDEO_ERROR);
  }, [error]);

  const rawVideoList: Video[] = useMemo(
    () => data?.content ?? [],
    [data?.content]
  );

  // Filter by search query and status filter
  const videoList = useMemo(() => {
    return rawVideoList.filter((v) => {
      const matchesSearch = v.video_title
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchesStatus =
        statusFilter === "ALL" || getNormalizedStatus(v) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rawVideoList, searchQuery, statusFilter]);

  // Quick stats
  const totalViewsOnPage = useMemo(() => {
    return rawVideoList.reduce((acc, curr) => acc + (curr.video_views || 0), 0);
  }, [rawVideoList]);

  const completedCount = useMemo(() => {
    return rawVideoList.filter((v) => getNormalizedStatus(v) === "COMPLETED").length;
  }, [rawVideoList]);

  const processingCount = useMemo(() => {
    return rawVideoList.filter(
      (v) => getNormalizedStatus(v) === "PROCESSING" || getNormalizedStatus(v) === "PENDING"
    ).length;
  }, [rawVideoList]);

  const handleShare = async (videoId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const videoUrl = `${window.location.origin}/video/${videoId}/view`;
    try {
      await navigator.clipboard.writeText(videoUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error(err);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium px-2.5 py-0.5 whitespace-nowrap flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium px-2.5 py-0.5 whitespace-nowrap flex items-center gap-1.5 w-fit">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium px-2.5 py-0.5 whitespace-nowrap flex items-center gap-1.5 w-fit">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border border-border/50 font-medium px-2.5 py-0.5 whitespace-nowrap w-fit">
            {status || "UNKNOWN"}
          </Badge>
        );
    }
  };

  // If user is not logged in
  if (!user && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="border border-border/50 shadow-xl dark:shadow-2xl bg-card/85 backdrop-blur-md rounded-2xl max-w-md w-full text-center p-6 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Film className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight">Creator Studio</h2>
            <p className="text-sm text-muted-foreground">
              Please sign in to your account to view and manage your uploaded
              videos.
            </p>
          </div>
          <Link href="/auth/login" className="block pt-2">
            <Button className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Continue
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6 sm:py-8 px-3 sm:px-6">
      <div className="w-full lg:max-w-[92%] space-y-6">
        {/* === Header & Primary Actions === */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
              <Film className="w-3 h-3" />
              Creator Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Videos
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your video library, monitor processing, and track view counts.
            </p>
          </div>

          <Link href="/video/upload" className="shrink-0 hidden sm:inline-block">
            <Button className="h-10 px-4 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-blue-500/20 transition-all duration-300">
              <Plus className="w-4 h-4 mr-1.5" />
              Upload Video
            </Button>
          </Link>
        </div>

        {/* === Quick Metric Stat Cards === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-border/50 bg-card/70 backdrop-blur-sm shadow-sm rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Videos on Page
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {isLoading ? "-" : rawVideoList.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data?.totalPages ? `Page ${page + 1} of ${data.totalPages}` : "Library overview"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <VideoIcon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/70 backdrop-blur-sm shadow-sm rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Views
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {isLoading ? "-" : totalViewsOnPage.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cumulative watch count
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Eye className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/70 backdrop-blur-sm shadow-sm rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Processing Status
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {isLoading ? "-" : `${completedCount} Ready`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {processingCount > 0
                    ? `${processingCount} processing currently`
                    : "All videos ready"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === Filter & Search Bar === */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search videos by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 bg-card/60 border-muted-foreground/15 rounded-lg text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/40 self-start sm:self-auto">
            {(["ALL", "COMPLETED", "PROCESSING"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                  statusFilter === status
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status === "ALL"
                  ? "All Videos"
                  : status === "COMPLETED"
                  ? "Ready"
                  : "Processing"}
              </button>
            ))}
          </div>
        </div>

        {/* === Videos Table Card === */}
        <Card className="border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/5 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Video
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Upload Date
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Views
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-border/30">
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-24 h-14 rounded-lg shrink-0" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="w-3/4 h-4" />
                            <Skeleton className="w-1/3 h-3" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Skeleton className="w-20 h-4" />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Skeleton className="w-12 h-4" />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Skeleton className="w-16 h-5 rounded-full" />
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right">
                        <Skeleton className="w-16 h-8 rounded ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : videoList.length > 0 ? (
                  videoList.map((video) => {
                    const timeAgo = formatDistanceToNow(
                      new Date(video.video_uploadDate),
                      { addSuffix: true }
                    );
                    const formattedDate = new Date(
                      video.video_uploadDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    const videoHref = video.slug
                      ? `/watch/${video.slug}`
                      : `/video/${video.videoId}/view`;

                    return (
                      <TableRow
                        key={video.videoId}
                        className="group border-b border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        {/* Thumbnail & Title */}
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Link
                              href={videoHref}
                              className="relative w-24 h-14 rounded-lg overflow-hidden bg-black/10 shrink-0 group/thumb ring-1 ring-border/50 block"
                            >
                              {getNormalizedStatus(video) === "PROCESSING" || !video.thumbnail_url ? (
                                <div className="w-full h-full flex items-center justify-center bg-muted/60">
                                  {getNormalizedStatus(video) === "PROCESSING" ? (
                                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                  ) : (
                                    <Film className="w-5 h-5 text-muted-foreground/50" />
                                  )}
                                </div>
                              ) : (
                                <Image
                                  src={video.thumbnail_url}
                                  alt={video.video_title}
                                  fill
                                  sizes="96px"
                                  unoptimized
                                  className="object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                                />
                              )}
                              {/* Hover play icon overlay */}
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-4 h-4 text-white fill-white" />
                              </div>
                              {/* Duration badge */}
                              {video.video_duration && (
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.2 rounded">
                                  {video.video_duration}
                                </span>
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={videoHref}
                                className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors text-foreground"
                                title={video.video_title}
                              >
                                {video.video_title}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  ID: #{video.videoId}
                                </span>
                                {video.category && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                    {video.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Upload Date */}
                        <TableCell className="py-3 px-4">
                          <p suppressHydrationWarning className="text-xs font-medium text-foreground">
                            {timeAgo}
                          </p>
                          <p suppressHydrationWarning className="text-[11px] text-muted-foreground">
                            {formattedDate}
                          </p>
                        </TableCell>

                        {/* Views */}
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            {video.video_views.toLocaleString()}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 px-4">
                          {getStatusBadge(getNormalizedStatus(video))}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={videoHref}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="Watch video"
                                aria-label="Watch video"
                              >
                                <Play className="h-3.5 w-3.5" />
                              </Button>
                            </Link>

                            <EditVideoModal video={video} />

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleShare(video.videoId, e)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Share video"
                              aria-label="Share video"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>

                            <DeleteVideoButton
                              videoId={video.videoId}
                              videoTitle={video.video_title}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/60 border border-border/50">
                          <Film className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground text-sm">
                            {searchQuery || statusFilter !== "ALL"
                              ? "No matching videos found"
                              : "No videos uploaded yet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {searchQuery || statusFilter !== "ALL"
                              ? "Try adjusting your search query or status filter."
                              : "Upload your first video to share it with your community."}
                          </p>
                        </div>
                        {searchQuery || statusFilter !== "ALL" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("ALL");
                            }}
                            className="mt-2 text-xs"
                          >
                            Reset Filters
                          </Button>
                        ) : (
                          <Link href="/video/upload" className="inline-block pt-1">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-xs"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Upload First Video
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* === Pagination Controls Footer === */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page + 1}</span> of{" "}
                <span className="font-semibold text-foreground">{data.totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0 || isLoading}
                  className="h-8 px-3 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((prev) => (data && !data.last ? prev + 1 : prev))
                  }
                  disabled={data?.last || isLoading}
                  className="h-8 px-3 text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

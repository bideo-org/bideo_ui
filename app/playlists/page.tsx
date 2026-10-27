"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth-context";
import {
  fetchMyPlaylists,
  createPlaylist,
  deletePlaylist,
  PlaylistDTO,
} from "@/utility/requests";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ListMusic,
  Plus,
  Trash2,
  Clock,
  ArrowLeft,
  Loader2,
  LogIn,
  Lock,
  Globe,
  Play,
} from "lucide-react";

export default function PlaylistsPage() {
  const { token, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Create playlist modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchMyPlaylists(token)
      .then((data) => {
        if (!isMounted) return;
        setPlaylists(data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch playlists", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !token) return;

    setCreating(true);
    try {
      const created = await createPlaylist(
        {
          title: title.trim(),
          description: desc.trim() || undefined,
          visibility,
        },
        token
      );
      setPlaylists((prev) => [created, ...prev]);
      setTitle("");
      setDesc("");
      setIsCreateOpen(false);
      toast.success(`Created playlist "${created.title}"`);
    } catch {
      toast.error("Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (playlistId: number) => {
    if (!token) return;
    setPlaylists((prev) => prev.filter((p) => p.playlistId !== playlistId));

    startTransition(async () => {
      try {
        await deletePlaylist(playlistId, token);
        toast.success("Playlist deleted");
      } catch {
        toast.error("Failed to delete playlist. Please refresh.");
      }
    });
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="w-full flex justify-center py-12 px-4">
        <Card className="border border-border/50 shadow-xl bg-card/85 backdrop-blur-md rounded-2xl max-w-md w-full text-center p-8 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ListMusic className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight">Your Playlists</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to manage custom playlists, save favorites, and access Watch Later.
            </p>
          </div>
          <Link href="/auth/login" className="block pt-2">
            <Button className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to View Playlists
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
                <ListMusic className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Playlists & Libraries
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"} created
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5 font-semibold self-start sm:self-auto"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              New Playlist
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/40 p-4 space-y-3 bg-card/40">
                <Skeleton className="w-full aspect-video rounded-xl" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-dashed border-border/60">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <ListMusic className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                No playlists found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create custom playlists or use &ldquo;Save to Playlist&rdquo; on any video to organize your favorite content.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Playlist
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {playlists.map((pl) => {
              const isWatchLater = pl.title.toLowerCase().includes("watch later");

              return (
                <Card
                  key={pl.playlistId}
                  className="border border-border/40 hover:border-border/80 transition-all bg-card/75 backdrop-blur-sm overflow-hidden group flex flex-col justify-between"
                >
                  <Link href={`/playlists/${pl.playlistId}`} className="block flex-1">
                    {/* Visual card header */}
                    <div className="relative aspect-video bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 flex items-center justify-center group-hover:scale-102 transition-transform duration-300">
                      {isWatchLater ? (
                        <Clock className="w-10 h-10 text-primary opacity-80" />
                      ) : (
                        <ListMusic className="w-10 h-10 text-primary opacity-80" />
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-bold bg-black/80 text-white">
                        {pl.videoCount ?? 0} {pl.videoCount === 1 ? "video" : "videos"}
                      </span>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                          {pl.title}
                        </h3>
                        {pl.visibility === "PRIVATE" ? (
                          <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 text-muted-foreground">
                            <Lock className="w-2.5 h-2.5" />
                            Private
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 text-muted-foreground">
                            <Globe className="w-2.5 h-2.5" />
                            Public
                          </Badge>
                        )}
                      </div>

                      {pl.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {pl.description}
                        </p>
                      )}
                    </CardContent>
                  </Link>

                  <div className="px-4 pb-3 pt-0 flex justify-end border-t border-border/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pl.playlistId)}
                      disabled={isPending}
                      className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Playlist Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5 text-primary" />
                Create New Playlist
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chill Lo-Fi Beats"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description (Optional)
                </label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What is this playlist about?"
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Privacy
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                  className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm text-foreground"
                >
                  <option value="PUBLIC">Public - Anyone can view</option>
                  <option value="PRIVATE">Private - Only visible to you</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !title.trim()}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Playlist"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

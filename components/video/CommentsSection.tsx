"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Pin,
  Play,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import { CommentDTO } from "@/types/video";
import { api_instance } from "@/global";
import { useAuth } from "@/store/auth-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CommentsSectionProps {
  videoId: number;
  videoUploaderId?: string;
  onSeekTo?: (seconds: number) => void;
}

/**
 * Parses timestamp strings like "01:23" or "10:45" to seconds
 */
function parseTimestamp(timeStr: string): number {
  const parts = timeStr.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  videoId,
  videoUploaderId,
  onSeekTo,
}) => {
  const { token, user, uid } = useAuth();

  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Editing state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Deletion modal state
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reply state
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Threaded child replies state
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});
  const [repliesMap, setRepliesMap] = useState<Record<number, CommentDTO[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<number, boolean>>({});

  const fetchComments = async () => {
    try {
      const res = await fetch(`${api_instance}/vid/${videoId}/comments?sort=newest`);
      if (res.ok) {
        const json = await res.json();
        const items: CommentDTO[] = json.content || (Array.isArray(json) ? json : []);
        // Sort with pinned first, then newest
        items.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
        setComments(items);
      }
    } catch {
      // Fallback gracefully
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to determine authorization
  const isCommentAuthor = (comment: CommentDTO) => {
    if (!token) return false;
    const author = comment.user;
    if (uid && (author?.userId === uid || (author as any)?.id === uid)) return true;
    if (user?.userId && (author?.userId === user.userId || (author as any)?.id === user.userId)) return true;
    if (user?.username && author?.username === user.username) return true;
    if (user?.user_name && (author?.user_name === user.user_name || author?.username === user.user_name)) return true;
    return false;
  };

  const isVideoOwner = Boolean(
    token && videoUploaderId && (uid === videoUploaderId || user?.userId === videoUploaderId)
  );

  // 1. Submit New Top-level Comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) {
      toast.error("Please sign in to post a comment");
      return;
    }

    setLoading(true);
    try {
      const timestampMatch = newComment.match(/\b(\d{1,2}:\d{2})\b/);
      const timestampInSeconds = timestampMatch
        ? parseTimestamp(timestampMatch[1])
        : undefined;

      const res = await fetch(`${api_instance}/vid/${videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          timestampInSeconds,
        }),
      });

      if (res.ok) {
        setNewComment("");
        toast.success("Comment posted!");
        fetchComments();
      } else {
        toast.error("Failed to post comment");
      }
    } catch {
      toast.error("An error occurred while posting comment");
    } finally {
      setLoading(false);
    }
  };

  // 2. Edit Comment (Author only)
  const handleStartEdit = (comment: CommentDTO) => {
    setEditingCommentId(comment.commentId);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async (commentId: number, isReply: boolean = false, parentId?: number) => {
    if (!editingContent.trim()) return;
    if (!token) {
      toast.error("Please sign in to edit comment");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch(`${api_instance}/vid/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editingContent.trim(),
        }),
      });

      if (res.ok) {
        const updated: CommentDTO = await res.json();
        const now = new Date().toISOString();

        if (isReply && parentId) {
          setRepliesMap((prev) => ({
            ...prev,
            [parentId]: (prev[parentId] || []).map((r) =>
              r.commentId === commentId
                ? { ...r, content: updated.content || editingContent.trim(), updatedAt: updated.updatedAt || now }
                : r
            ),
          }));
        } else {
          setComments((prev) =>
            prev.map((c) =>
              c.commentId === commentId
                ? { ...c, content: updated.content || editingContent.trim(), updatedAt: updated.updatedAt || now }
                : c
            )
          );
        }

        setEditingCommentId(null);
        setEditingContent("");
        toast.success("Comment updated!");
      } else {
        toast.error("Failed to update comment");
      }
    } catch {
      toast.error("An error occurred while updating comment");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 3. Delete Comment (Author or Video Owner)
  const handleConfirmDelete = async () => {
    if (!deletingCommentId || !token) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${api_instance}/vid/comments/${deletingCommentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Remove from top-level comments
        setComments((prev) => prev.filter((c) => c.commentId !== deletingCommentId));

        // Also remove if it was a child reply
        setRepliesMap((prev) => {
          const updated: Record<number, CommentDTO[]> = {};
          for (const [key, replies] of Object.entries(prev)) {
            updated[Number(key)] = replies.filter((r) => r.commentId !== deletingCommentId);
          }
          return updated;
        });

        toast.success("Comment deleted successfully");
        setDeletingCommentId(null);
      } else {
        toast.error("Failed to delete comment");
      }
    } catch {
      toast.error("An error occurred while deleting comment");
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. Pin / Unpin Comment (Video Owner only)
  const handleTogglePin = async (commentId: number) => {
    if (!token) return;

    try {
      const res = await fetch(`${api_instance}/vid/comments/${commentId}/pin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setComments((prev) => {
          const target = prev.find((c) => c.commentId === commentId);
          const nextPinnedState = !target?.isPinned;
          toast.success(nextPinnedState ? "Comment pinned to top!" : "Comment unpinned!");

          const updated = prev.map((c) => {
            if (c.commentId === commentId) {
              return { ...c, isPinned: nextPinnedState };
            }
            // If pinning this one, unpin other comments if single-pin behavior
            return nextPinnedState ? { ...c, isPinned: false } : c;
          });

          return updated.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
          });
        });
      } else {
        toast.error("Failed to pin comment");
      }
    } catch {
      toast.error("An error occurred while pinning comment");
    }
  };

  // 5. Fetch & Toggle Threaded Child Replies
  const handleToggleReplies = async (parentCommentId: number) => {
    const isCurrentlyExpanded = expandedReplies[parentCommentId];

    if (!isCurrentlyExpanded && !repliesMap[parentCommentId]) {
      setLoadingReplies((prev) => ({ ...prev, [parentCommentId]: true }));
      try {
        const res = await fetch(`${api_instance}/vid/comments/${parentCommentId}/replies`);
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : json.content || [];
          setRepliesMap((prev) => ({ ...prev, [parentCommentId]: list }));
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoadingReplies((prev) => ({ ...prev, [parentCommentId]: false }));
      }
    }

    setExpandedReplies((prev) => ({
      ...prev,
      [parentCommentId]: !isCurrentlyExpanded,
    }));
  };

  // 6. Submit Reply to Comment
  const handleSubmitReply = async (parentCommentId: number) => {
    if (!replyContent.trim()) return;
    if (!token) {
      toast.error("Please sign in to reply");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const timestampMatch = replyContent.match(/\b(\d{1,2}:\d{2})\b/);
      const timestampInSeconds = timestampMatch
        ? parseTimestamp(timestampMatch[1])
        : undefined;

      let res = await fetch(`${api_instance}/vid/comments/${parentCommentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          timestampInSeconds,
        }),
      });

      if (!res.ok) {
        // Fallback to top-level comments endpoint with parentId
        res = await fetch(`${api_instance}/vid/${videoId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: replyContent.trim(),
            parentCommentId,
            parentId: parentCommentId,
            timestampInSeconds,
          }),
        });
      }

      if (res.ok) {
        const newReply: CommentDTO = await res.json();
        setRepliesMap((prev) => ({
          ...prev,
          [parentCommentId]: [...(prev[parentCommentId] || []), newReply],
        }));
        setExpandedReplies((prev) => ({ ...prev, [parentCommentId]: true }));
        setComments((prev) =>
          prev.map((c) =>
            c.commentId === parentCommentId
              ? { ...c, repliesCount: (c.repliesCount || 0) + 1 }
              : c
          )
        );
        setReplyContent("");
        setReplyingToCommentId(null);
        toast.success("Reply posted!");
      } else {
        toast.error("Failed to post reply");
      }
    } catch {
      toast.error("An error occurred while posting reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Helper to render comment text with clickable timestamps
  const renderCommentContent = (content: string) => {
    const timestampRegex = /(\b\d{1,2}:\d{2}\b)/g;
    const parts = content.split(timestampRegex);

    return parts.map((part, index) => {
      if (timestampRegex.test(part)) {
        const seconds = parseTimestamp(part);
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSeekTo?.(seconds)}
            className="inline-flex items-center gap-0.5 mx-1 px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title={`Jump to ${part}`}
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Helper to render a comment item (usable for both root comments and replies)
  const renderCommentItem = (comment: CommentDTO, isReply: boolean = false, parentId?: number) => {
    const author = comment.user;
    const authorName =
      author?.fullName ||
      author?.full_name ||
      author?.user_name ||
      "BuzzClips User";
    const authorHandle = author?.username
      ? `@${author.username}`
      : author?.user_name
      ? `@${author.user_name}`
      : "";
    const channelHref = author?.username
      ? `/channel/@${author.username}`
      : author?.userId
      ? `/channel/${author.userId}`
      : undefined;

    const timeAgo = comment.createdAt
      ? formatDistanceToNow(new Date(comment.createdAt), {
          addSuffix: true,
        })
      : "";

    const isAuthor = isCommentAuthor(comment);
    const canEdit = isAuthor;
    const canDelete = isAuthor || isVideoOwner;
    const canPin = !isReply && isVideoOwner;
    const isEditing = editingCommentId === comment.commentId;

    const hasBeenEdited =
      Boolean(comment.updatedAt) &&
      comment.updatedAt !== comment.createdAt &&
      new Date(comment.updatedAt!).getTime() > new Date(comment.createdAt).getTime() + 5000;

    return (
      <div
        key={comment.commentId}
        className={`group p-3.5 sm:p-4 rounded-xl border transition-all ${
          comment.isPinned
            ? "border-amber-500/40 bg-amber-500/5 shadow-sm"
            : isReply
            ? "border-border/30 bg-muted/20"
            : "border-border/40 bg-card/40 hover:bg-card/60"
        }`}
      >
        {/* Author Header */}
        <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <Avatar className={isReply ? "w-6 h-6 shrink-0" : "w-7 h-7 shrink-0"}>
              <AvatarImage src={author?.avatar_url || ""} />
              <AvatarFallback className="text-[10px] bg-muted font-semibold">
                {(authorName || "BC").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {channelHref ? (
                <Link
                  href={channelHref}
                  className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {authorName}
                </Link>
              ) : (
                <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  {authorName}
                </span>
              )}
              {authorHandle && (
                <span className="text-[11px] font-mono text-muted-foreground/70">
                  {authorHandle}
                </span>
              )}

              {comment.isPinned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                </span>
              )}

              {timeAgo && (
                <span suppressHydrationWarning className="text-[11px] text-muted-foreground">
                  {timeAgo}
                </span>
              )}

              {hasBeenEdited && (
                <span className="text-[10px] italic text-muted-foreground/80">
                  (edited)
                </span>
              )}
            </div>
          </div>

          {/* Action buttons (Edit / Delete / Pin) */}
          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
            {canPin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleTogglePin(comment.commentId)}
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                title={comment.isPinned ? "Unpin comment" : "Pin comment"}
              >
                <Pin className={`w-3.5 h-3.5 ${comment.isPinned ? "fill-amber-500 text-amber-500" : ""}`} />
                <span className="sr-only">{comment.isPinned ? "Unpin comment" : "Pin comment"}</span>
              </Button>
            )}
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStartEdit(comment)}
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                title="Edit comment"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {canDelete && (
              deletingCommentId === comment.commentId ? (
                <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 rounded-lg px-2 py-0.5">
                  <span className="text-[11px] text-destructive font-semibold">Delete?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="h-6 px-2 text-[10px] rounded-md bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "..." : "Confirm"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingCommentId(null)}
                    disabled={isDeleting}
                    className="h-6 px-1.5 text-[10px] rounded-md"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingCommentId(comment.commentId)}
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              )
            )}
          </div>
        </div>

        {/* Comment Body / Inline Edit Mode */}
        {isEditing ? (
          <div className="pl-8 sm:pl-9 space-y-2 mt-1">
            <Textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="min-h-[70px] text-xs sm:text-sm bg-background border-border/70 rounded-lg p-2.5 resize-none"
              placeholder="Edit your comment..."
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingCommentId(null);
                  setEditingContent("");
                }}
                className="h-7 text-xs rounded-full"
                disabled={isSavingEdit}
              >
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleSaveEdit(comment.commentId, isReply, parentId)}
                disabled={isSavingEdit || !editingContent.trim()}
                className="h-7 text-xs rounded-full bg-primary text-primary-foreground gap-1"
              >
                <Check className="w-3 h-3" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-8 sm:pl-9 break-words [overflow-wrap:anywhere] min-w-0">
            {renderCommentContent(comment.content)}
          </div>
        )}

        {/* Comment Footer: Reply Button & View Replies Toggle */}
        {!isReply && (
          <div className="pl-8 sm:pl-9 mt-2.5 flex items-center gap-3">
            {token && (
              <button
                type="button"
                onClick={() => {
                  if (replyingToCommentId === comment.commentId) {
                    setReplyingToCommentId(null);
                    setReplyContent("");
                  } else {
                    setReplyingToCommentId(comment.commentId);
                    setReplyContent("");
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <CornerDownRight className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}

            {/* Toggle Threaded Child Replies */}
            {(comment.repliesCount || (repliesMap[comment.commentId]?.length ?? 0) > 0) ? (
              <button
                type="button"
                onClick={() => handleToggleReplies(comment.commentId)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-all"
              >
                {expandedReplies[comment.commentId] ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span>Hide replies</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>
                      View {comment.repliesCount || repliesMap[comment.commentId]?.length || 1}{" "}
                      {(comment.repliesCount || repliesMap[comment.commentId]?.length || 1) === 1 ? "reply" : "replies"}
                    </span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        )}

        {/* Inline Reply Input Box */}
        {!isReply && replyingToCommentId === comment.commentId && (
          <div className="pl-8 sm:pl-9 mt-3 pt-3 border-t border-border/30">
            <div className="flex gap-2 items-start">
              <Avatar className="w-6 h-6 shrink-0 mt-1">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                  {(user?.user_name || "ME").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${authorName}... (e.g. Thanks! Check 02:10)`}
                  className="h-9 text-xs bg-card border-border/60 rounded-lg px-3 focus-visible:border-primary/50"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingToCommentId(null);
                      setReplyContent("");
                    }}
                    className="h-7 text-xs rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmittingReply || !replyContent.trim()}
                    onClick={() => handleSubmitReply(comment.commentId)}
                    className="h-7 text-xs rounded-full px-3 bg-primary text-primary-foreground gap-1"
                  >
                    <Send className="w-3 h-3" /> Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies Thread List */}
        {!isReply && expandedReplies[comment.commentId] && (
          <div className="pl-6 sm:pl-8 mt-3 space-y-2.5 border-l-2 border-primary/20">
            {loadingReplies[comment.commentId] && (
              <p className="text-xs text-muted-foreground py-2 pl-2 animate-pulse">
                Loading replies...
              </p>
            )}
            {repliesMap[comment.commentId]?.map((reply) =>
              renderCommentItem(reply, true, comment.commentId)
            )}
            {!loadingReplies[comment.commentId] &&
              (!repliesMap[comment.commentId] || repliesMap[comment.commentId].length === 0) && (
                <p className="text-xs text-muted-foreground py-1 pl-2">No replies yet.</p>
              )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border/40">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h2>
        </div>
      </div>

      {/* Comment Input Box */}
      {token ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5 items-start">
          <Avatar className="w-9 h-9 shrink-0 ring-1 ring-border/50">
            <AvatarImage src={user?.user_name ? "" : ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {(user?.user_name || "ME").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (Tip: type 01:23 to tag a timestamp!)"
              className="bg-card/75 border-border/60 rounded-xl px-4 h-11 text-sm focus-visible:border-primary/50"
            />
            <div className="flex justify-end gap-2">
              {newComment.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewComment("")}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={loading || !newComment.trim()}
                className="rounded-full px-4 h-8 text-xs font-semibold bg-primary text-primary-foreground gap-1.5 hover:bg-primary/90"
              >
                <Send className="w-3 h-3" />
                Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-card/60 border border-border/40 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Sign in to join the conversation, edit, reply, and leave timestamped comments.
          </p>
          <Link href="/auth/login" className="inline-block">
            <Button size="sm" variant="outline" className="rounded-full text-xs">
              Sign In to Comment
            </Button>
          </Link>
        </div>
      )}

      {/* Top-Level Comments List */}
      <div className="space-y-3.5">
        {comments.map((comment) => renderCommentItem(comment, false))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;

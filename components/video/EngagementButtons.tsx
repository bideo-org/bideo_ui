"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Share2, Check, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EngagementDTO } from "@/types/video";
import { api_instance } from "@/global";
import { useAuth } from "@/store/auth-context";

interface EngagementButtonsProps {
  videoId: number;
  initialEngagement?: EngagementDTO;
  onSave?: () => void;
}

export const EngagementButtons: React.FC<EngagementButtonsProps> = ({
  videoId,
  initialEngagement,
  onSave,
}) => {
  const { token } = useAuth();

  const [data, setData] = useState<EngagementDTO>(
    initialEngagement || {
      videoId,
      likesCount: 0,
      dislikesCount: 0,
      userReaction: "NONE",
    }
  );
  const [copied, setCopied] = useState(false);

  // Fetch engagement data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadEngagement() {
      try {
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${api_instance}/vid/${videoId}/engagement`, {
          headers,
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        }
      } catch {
        // Fallback gracefully to default
      }
    }
    loadEngagement();
    return () => {
      isMounted = false;
    };
  }, [videoId, token]);

  const handleLike = async () => {
    if (!token) {
      toast.error("Please sign in to like this video");
      return;
    }

    // Optimistic UI state update
    const prev = { ...data };
    setData((curr) => ({
      ...curr,
      likesCount:
        curr.userReaction === "LIKE"
          ? Math.max(0, curr.likesCount - 1)
          : curr.likesCount + 1,
      dislikesCount:
        curr.userReaction === "DISLIKE"
          ? Math.max(0, curr.dislikesCount - 1)
          : curr.dislikesCount,
      userReaction: curr.userReaction === "LIKE" ? "NONE" : "LIKE",
    }));

    try {
      const res = await fetch(`${api_instance}/vid/${videoId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
      } else {
        setData(prev);
      }
    } catch {
      setData(prev);
    }
  };

  const handleDislike = async () => {
    if (!token) {
      toast.error("Please sign in to dislike this video");
      return;
    }

    const prev = { ...data };
    setData((curr) => ({
      ...curr,
      dislikesCount:
        curr.userReaction === "DISLIKE"
          ? Math.max(0, curr.dislikesCount - 1)
          : curr.dislikesCount + 1,
      likesCount:
        curr.userReaction === "LIKE"
          ? Math.max(0, curr.likesCount - 1)
          : curr.likesCount,
      userReaction: curr.userReaction === "DISLIKE" ? "NONE" : "DISLIKE",
    }));

    try {
      const res = await fetch(`${api_instance}/vid/${videoId}/dislike`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
      } else {
        setData(prev);
      }
    } catch {
      setData(prev);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Pill: Like & Dislike */}
      <div className="flex items-center bg-muted/60 border border-border/50 backdrop-blur-sm rounded-full p-0.5 h-9">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          aria-label="Like video"
          className={`gap-1.5 rounded-full px-3 h-8 text-xs font-semibold transition-colors ${
            data.userReaction === "LIKE"
              ? "text-primary bg-primary/10 shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ThumbsUp
            className={`w-3.5 h-3.5 ${data.userReaction === "LIKE" ? "fill-current" : ""}`}
          />
          <span>{data.likesCount.toLocaleString()}</span>
        </Button>

        <span className="h-4 w-px bg-border/60 mx-0.5" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDislike}
          aria-label="Dislike video"
          className={`rounded-full px-2.5 h-8 text-xs transition-colors ${
            data.userReaction === "DISLIKE"
              ? "text-red-500 bg-red-500/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ThumbsDown
            className={`w-3.5 h-3.5 ${data.userReaction === "DISLIKE" ? "fill-current" : ""}`}
          />
        </Button>
      </div>

      {/* Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="rounded-full gap-1.5 h-9 px-3.5 text-xs font-semibold bg-muted/60 border border-border/50 hover:bg-muted text-foreground transition-colors"
        aria-label="Share video"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
        <span>{copied ? "Copied" : "Share"}</span>
      </Button>

      {/* Save Button */}
      {onSave && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="rounded-full gap-1.5 h-9 px-3.5 text-xs font-semibold bg-muted/60 border border-border/50 hover:bg-muted text-foreground transition-colors"
          title="Save to playlist or watch later"
          aria-label="Save video"
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
          <span>Save</span>
        </Button>
      )}
    </div>
  );
};

export default EngagementButtons;

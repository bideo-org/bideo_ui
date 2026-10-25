"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { MESSAGES } from "@/constants/messages";
import { deleteVideo } from "@/utility/requests";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAuth } from "@/store/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

export interface DeleteVideoButtonProps {
  videoId: number;
  videoTitle?: string;
}

export default function DeleteVideoButton({
  videoId,
  videoTitle,
}: DeleteVideoButtonProps) {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const isTitleMatch =
    !videoTitle ||
    confirmInput.trim().toLowerCase() === videoTitle.trim().toLowerCase();
  const canDelete = isTitleMatch && !isDeleting;

  const handleDelete = async () => {
    if (!user?.userId) {
      toast.error(MESSAGES.DELETED_ERROR);
      return;
    }

    if (!canDelete) return;

    setIsDeleting(true);
    try {
      await deleteVideo(user.userId, videoId, token as string);
      toast.success(MESSAGES.DELETED_SUCCESS);
      // Invalidate userVideos query so the table immediately updates
      queryClient.invalidateQueries({ queryKey: ["userVideos"] });
      setOpen(false);
      setConfirmInput("");
    } catch (error) {
      console.error("Delete video failed:", error);
      toast.error(MESSAGES.DELETED_ERROR);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmInput("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete video"
          aria-label="Delete video"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              Delete video?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground text-sm space-y-3 pt-1 text-left">
              <p>
                This action cannot be undone. This video and all its associated
                data will be permanently removed from your channel.
              </p>
              {videoTitle && (
                <div className="pt-1 space-y-1.5">
                  <label className="text-xs font-medium text-foreground block">
                    To confirm, type{" "}
                    <span className="font-bold text-destructive select-all">
                      &quot;{videoTitle}&quot;
                    </span>{" "}
                    below:
                  </label>
                  <Input
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={`Type "${videoTitle}" to confirm`}
                    className="h-9 text-sm font-mono border-border/60 focus-visible:ring-destructive"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canDelete) {
                        e.preventDefault();
                        handleDelete();
                      }
                    }}
                    disabled={isDeleting}
                  />
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
          <AlertDialogCancel
            disabled={isDeleting}
            onClick={() => setConfirmInput("")}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={!canDelete}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete Video"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

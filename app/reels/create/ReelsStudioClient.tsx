"use client";

import React, { useState } from "react";
import { ReelsStudio } from "@/components/reels-studio/ReelsStudio";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-context";
import { toast } from "sonner";
import {
  requestPresignedUpload,
  completePresignedUpload,
} from "@/utility/requests";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ReelsStudioClient() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const handleUploadFinishedReel = async (
    file: File,
    meta: { title: string; tags: string; category: string }
  ) => {
    if (!token || !user) {
      toast.error("Please log in to upload your reel.");
      router.push("/auth/login?redirect=/reels/create");
      return;
    }

    try {
      setIsUploading(true);
      setUploadPercent(0);

      // 1. Request presigned upload URL
      toast.info("Requesting S3 upload slot...");
      const presigned = await requestPresignedUpload(
        file.name,
        file.type || "video/webm",
        token
      );
      const { uploadUrl, s3Key, processId } = presigned;

      // 2. Direct S3 Upload
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type || "video/webm",
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size || 1;
          const pct = Math.round((progressEvent.loaded * 100) / total);
          setUploadPercent(pct);
        },
      });

      // 3. Complete Presigned Upload
      const tagsList = meta.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const completeResult = await completePresignedUpload(
        {
          s3Key,
          processId,
          videoTitle: meta.title || "My BuzzClips Reel",
          description: "Created with BuzzClips Reels Studio ✨ #reels #buzzclips",
          tags: tagsList,
          category: (meta.category as any) || "ENTERTAINMENT",
          visibility: "PUBLIC",
        },
        token
      );

      toast.success("Reel uploaded successfully! Queued for transcoding 🚀");
      const videoId = completeResult.videoId || (completeResult as any)?.id;
      if (videoId) {
        router.push(`/watch/${videoId}`);
      } else {
        router.push("/reels");
      }
    } catch (err: any) {
      console.error("Direct Reel upload failed:", err);
      toast.error("Upload failed: " + (err.message || "Network error"));
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <Card className="max-w-md w-full p-8 rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xl text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-pink-500/25">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold">Uploading Reel to BuzzClips</h3>
            <p className="text-xs text-muted-foreground">
              Direct S3 presigned upload in progress. Do not close this window.
            </p>
          </div>

          <div className="space-y-2 max-w-xs mx-auto">
            <div className="flex justify-between text-xs font-semibold">
              <span>Transferring stream</span>
              <span className="font-mono text-primary font-bold">{uploadPercent}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden ring-1 ring-border/40">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 transition-all duration-300"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ReelsStudio
      onUploadFinishedReel={handleUploadFinishedReel}
      onClose={() => router.push("/video/upload")}
    />
  );
}

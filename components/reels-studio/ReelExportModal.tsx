"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, UploadCloud, CheckCircle2, ArrowRight } from "lucide-react";
import { StudioExportResult } from "./types";

interface ReelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExporting: boolean;
  exportProgress: number;
  exportResult: StudioExportResult | null;
  onUploadToBuzzClips: (file: File, title: string) => void;
}

export const ReelExportModal: React.FC<ReelExportModalProps> = ({
  isOpen,
  onClose,
  isExporting,
  exportProgress,
  exportResult,
  onUploadToBuzzClips,
}) => {
  const handleDownload = () => {
    if (!exportResult) return;
    const a = document.createElement("a");
    a.href = exportResult.previewUrl;
    a.download = exportResult.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/60 rounded-3xl p-6 text-center shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-center">
            {isExporting ? "Rendering Your Reel Studio Masterpiece 🎬" : "Reel Ready for BuzzClips! ✨"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground text-center">
            {isExporting
              ? "Synthesizing audio, applying filters, and rendering 9:16 vertical stream..."
              : "Your reel has been composited and rendered. Upload it directly or download a copy."}
          </DialogDescription>
        </DialogHeader>

        {isExporting ? (
          <div className="py-8 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2 max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Compositing Canvas Stream</span>
                <span className="font-mono text-primary font-bold">{exportProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden ring-1 ring-border/40">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Please keep this tab open while rendering completes.
            </p>
          </div>
        ) : exportResult ? (
          <div className="space-y-5 py-2">
            {/* Video preview thumbnail */}
            <div className="relative w-44 h-72 mx-auto rounded-2xl overflow-hidden shadow-xl bg-black border-2 border-primary/40">
              <video
                src={exportResult.previewUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={() => onUploadToBuzzClips(exportResult.file, exportResult.title)}
                className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                Publish to BuzzClips Now
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
                className="w-full h-10 rounded-xl font-semibold gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download Reel (.webm)
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

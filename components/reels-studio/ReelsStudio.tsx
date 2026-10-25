"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  UploadCloud,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/store/auth-context";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ReelAspect,
  ReelFilter,
  TextOverlay,
  StickerOverlay,
  SoundtrackTrack,
  StudioExportResult,
} from "./types";
import { REEL_FILTERS } from "./filters";
import { ReelCanvasPreview } from "./ReelCanvasPreview";
import { ReelToolsPanel, StudioTab } from "./ReelToolsPanel";
import { ReelCameraRecorder } from "./ReelCameraRecorder";
import { ReelExportModal } from "./ReelExportModal";
import { exportReelCanvas } from "./exportEngine";
import { reelAudioEngine } from "./audioEngine";

interface ReelsStudioProps {
  onUploadFinishedReel?: (
    file: File,
    meta: { title: string; tags: string; category: string }
  ) => void;
  onClose?: () => void;
  initialFile?: File | null;
}

export const ReelsStudio: React.FC<ReelsStudioProps> = ({
  onUploadFinishedReel,
  onClose,
  initialFile,
}) => {
  const { user, isLoaded } = useAuth();
  const router = useRouter();

  // Video State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [, setVideoFile] = useState<File | null>(initialFile || null);
  const [aspect, setAspect] = useState<ReelAspect>("9:16");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(30);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(30);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Styling & Overlays
  const [selectedFilter, setSelectedFilter] = useState<ReelFilter>(REEL_FILTERS[0]);
  const [manualAdjustments, setManualAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hue: 0,
    blur: 0,
  });

  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([
    {
      id: "sample_text",
      text: "✨ Trending on BuzzClips",
      x: 50,
      y: 25,
      font: "Inter, sans-serif",
      fontName: "Modern Bold",
      fontSize: 22,
      color: "#ffffff",
      bgColor: "rgba(0,0,0,0.65)",
      hasBg: true,
      align: "center",
    },
  ]);

  const [stickerOverlays, setStickerOverlays] = useState<StickerOverlay[]>([
    {
      id: "sample_badge",
      content: "🔥 VIRAL",
      x: 50,
      y: 15,
      size: 16,
      rotation: 0,
      type: "badge",
      bgColor: "#ef4444",
      textColor: "#ffffff",
    },
  ]);

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [showInstagramMockup, setShowInstagramMockup] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [reelTitle, setReelTitle] = useState("My Epic Reel ✨");
  const [activeTab, setActiveTab] = useState<StudioTab>("source");

  // Audio Mixer State
  const [selectedTrack, setSelectedTrack] = useState<SoundtrackTrack | null>(null);
  const [videoVolume, setVideoVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(0.7);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<StudioExportResult | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Load initial file if provided
  useEffect(() => {
    if (initialFile) {
      handleLoadFile(initialFile);
    } else {
      // Default sample clip so user can start testing instantly
      setVideoSrc(
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      );
    }
  }, [initialFile]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      reelAudioEngine.stop();
    };
  }, []);

  // Update video metadata on loadeddata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      const dur = video.duration || 30;
      setDuration(dur);
      setTrimStart(0);
      setTrimEnd(Math.min(dur, 60)); // Max 60s for reel
    };

    const handleTimeUpdate = () => {
      if (video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
        video.play().catch(() => {});
      }
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoSrc, trimEnd, trimStart]);

  const handleLoadFile = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setReelTitle(cleanName);
    toast.success("Video imported to Reel Studio! 🎬");
  };

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      if (selectedTrack) {
        reelAudioEngine.play(selectedTrack, musicVolume);
      }
    } else {
      video.pause();
      setIsPlaying(false);
      reelAudioEngine.stop();
    }
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = trimStart;
    video.play().catch(() => {});
    setIsPlaying(true);
  };

  // Overlay management
  const handleAddText = () => {
    const newText: TextOverlay = {
      id: `text_${Date.now()}`,
      text: "Tap to edit text",
      x: 50,
      y: 40,
      font: "Inter, sans-serif",
      fontName: "Modern Bold",
      fontSize: 22,
      color: "#ffffff",
      bgColor: "rgba(0,0,0,0.7)",
      hasBg: true,
      align: "center",
    };
    setTextOverlays((prev) => [...prev, newText]);
    setSelectedOverlayId(newText.id);
    setActiveTab("text");
  };

  const handleUpdateText = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleUpdateTextPosition = (id: string, x: number, y: number) => {
    setTextOverlays((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  const handleAddSticker = (
    content: string,
    type: "emoji" | "badge",
    bgColor?: string,
    textColor?: string
  ) => {
    const newSticker: StickerOverlay = {
      id: `sticker_${Date.now()}`,
      content,
      x: 50,
      y: type === "badge" ? 80 : 50,
      size: type === "emoji" ? 36 : 14,
      rotation: type === "emoji" ? (Math.random() * 20 - 10) : 0,
      type,
      bgColor,
      textColor,
    };
    setStickerOverlays((prev) => [...prev, newSticker]);
    setSelectedOverlayId(newSticker.id);
  };

  const handleUpdateStickerPosition = (id: string, x: number, y: number) => {
    setStickerOverlays((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  const handleDeleteOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((item) => item.id !== id));
    setStickerOverlays((prev) => prev.filter((item) => item.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  // Export & Canvas Rendering
  const handleStartExport = async () => {
    const video = videoRef.current;
    if (!video) {
      toast.error("Please load a video clip before exporting.");
      return;
    }

    try {
      setIsExporting(true);
      setShowExportModal(true);
      setExportProgress(0);

      // Compute combined filter
      const filterString = [
        selectedFilter.cssFilter !== "none" ? selectedFilter.cssFilter : "",
        manualAdjustments.brightness !== 100
          ? `brightness(${manualAdjustments.brightness}%)`
          : "",
        manualAdjustments.contrast !== 100
          ? `contrast(${manualAdjustments.contrast}%)`
          : "",
        manualAdjustments.saturate !== 100
          ? `saturate(${manualAdjustments.saturate}%)`
          : "",
        manualAdjustments.hue !== 0 ? `hue-rotate(${manualAdjustments.hue}deg)` : "",
        manualAdjustments.blur > 0 ? `blur(${manualAdjustments.blur}px)` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const result = await exportReelCanvas({
        videoEl: video,
        aspect,
        filterString,
        textOverlays,
        stickerOverlays,
        trimStart,
        trimEnd,
        playbackSpeed,
        soundtrack: selectedTrack,
        videoVolume,
        musicVolume,
        title: reelTitle,
        onProgress: (percent) => setExportProgress(percent),
      });

      setExportResult(result);
      setIsExporting(false);
      toast.success("Reel exported successfully! Ready to upload 🚀");
    } catch (err: any) {
      console.error("Export failed:", err);
      setIsExporting(false);
      setShowExportModal(false);
      toast.error("Failed to render reel: " + (err.message || "Unknown error"));
    }
  };

  const handleUploadHandOff = (file: File, title: string) => {
    setShowExportModal(false);
    if (onUploadFinishedReel) {
      onUploadFinishedReel(file, {
        title: title || reelTitle,
        tags: "reels, buzzclips, viral, shorts",
        category: "ENTERTAINMENT",
      });
    } else {
      // Navigate to /video/upload
      router.push("/video/upload");
    }
  };

  // If user is not authenticated, show sign-in gate
  if (isLoaded && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-card/85 backdrop-blur-xl border border-border/60 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/25">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              BuzzClips Reels Studio
            </h2>
            <p className="text-sm text-muted-foreground">
              Reels Studio is an exclusive creator tool available for logged-in
              users. Sign in to edit vertical 9:16 reels with filters, music, and
              stickers!
            </p>
          </div>

          <Link href="/auth/login?redirect=/reels/create" className="block pt-2">
            <Button className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Access Studio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Top Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-card/90 backdrop-blur-md border border-border/60 shadow-md">
        <div className="flex items-center gap-3">
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <Link href="/video/upload">
              <Button type="button" variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Input
                  value={reelTitle}
                  onChange={(e) => setReelTitle(e.target.value)}
                  className="h-8 max-w-[200px] sm:max-w-xs font-bold text-sm bg-transparent border-none px-1 focus-visible:ring-1"
                  placeholder="Reel Title"
                />
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] bg-primary/10 text-primary border-primary/20"
                >
                  9:16 Vertical
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Aspect Ratio & Instagram Mockup Switcher */}
        <div className="flex items-center gap-2">
          {/* Aspect ratio */}
          <div className="hidden sm:flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            {(["9:16", "1:1", "4:5", "16:9"] as ReelAspect[]).map((asp) => (
              <Button
                key={asp}
                type="button"
                variant={aspect === asp ? "default" : "ghost"}
                size="sm"
                onClick={() => setAspect(asp)}
                className="h-7 text-xs font-bold px-2 rounded-lg"
              >
                {asp}
              </Button>
            ))}
          </div>

          {/* Instagram Overlay Preview Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInstagramMockup(!showInstagramMockup)}
            className="h-9 rounded-xl text-xs gap-1.5"
            title="Toggle Reel UI Overlay"
          >
            {showInstagramMockup ? <Eye className="w-4 h-4 text-pink-500" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Instagram UI</span>
          </Button>

          {/* Export & Upload Button */}
          <Button
            type="button"
            onClick={handleStartExport}
            className="h-9 px-4 rounded-xl font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            Export & Upload
          </Button>
        </div>
      </div>

      {/* Main Studio Body: Left/Center Viewport + Right Creative Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive Reel Canvas Preview & Playback Controls */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-3">
          <ReelCanvasPreview
            videoRef={videoRef}
            videoSrc={videoSrc}
            aspect={aspect}
            selectedFilter={selectedFilter}
            manualAdjustments={manualAdjustments}
            textOverlays={textOverlays}
            stickerOverlays={stickerOverlays}
            selectedOverlayId={selectedOverlayId}
            onSelectOverlay={setSelectedOverlayId}
            onUpdateTextPosition={handleUpdateTextPosition}
            onUpdateStickerPosition={handleUpdateStickerPosition}
            onDeleteOverlay={handleDeleteOverlay}
            showInstagramOverlay={showInstagramMockup}
            currentUser={user}
            reelTitle={reelTitle}
            soundtrackTitle={selectedTrack?.title}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
          />

          {/* Playback Control Bar */}
          <div className="flex items-center justify-center gap-3 p-2 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-md w-full max-w-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRestart}
              className="rounded-xl h-9 w-9"
              title="Restart from trim start"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="default"
              size="icon"
              onClick={handleTogglePlay}
              className="rounded-xl h-10 w-10 bg-primary text-primary-foreground shadow-md"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>

            <div className="text-xs font-mono text-muted-foreground px-2">
              {Math.round(duration)}s
            </div>
          </div>
        </div>

        {/* Right Column: Creative Tools Panel */}
        <div className="lg:col-span-5 w-full">
          <ReelToolsPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectFile={handleLoadFile}
            onOpenLiveCamera={() => setShowCamera(true)}
            onSelectSampleClip={(url) => {
              setVideoSrc(url);
              setVideoFile(null);
              toast.success("Loaded viral sample clip!");
            }}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            manualAdjustments={manualAdjustments}
            onUpdateManualAdjustment={(key, val) =>
              setManualAdjustments((prev) => ({ ...prev, [key]: val }))
            }
            onResetAdjustments={() =>
              setManualAdjustments({
                brightness: 100,
                contrast: 100,
                saturate: 100,
                hue: 0,
                blur: 0,
              })
            }
            textOverlays={textOverlays}
            selectedOverlayId={selectedOverlayId}
            onAddText={handleAddText}
            onUpdateText={handleUpdateText}
            onAddSticker={handleAddSticker}
            selectedTrack={selectedTrack}
            onSelectTrack={setSelectedTrack}
            videoVolume={videoVolume}
            onChangeVideoVolume={setVideoVolume}
            musicVolume={musicVolume}
            onChangeMusicVolume={setMusicVolume}
            onUploadCustomAudio={(file) => {
              const url = URL.createObjectURL(file);
              const customTrack: SoundtrackTrack = {
                id: `custom_${Date.now()}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: user?.username || "You",
                genre: "Custom Audio",
                durationSec: 30,
                bpm: 120,
                mood: "lofi",
                isCustom: true,
                audioBlobUrl: url,
              };
              setSelectedTrack(customTrack);
              reelAudioEngine.play(customTrack, musicVolume);
              toast.success("Custom audio track loaded 🎵");
            }}
            duration={duration}
            trimStart={trimStart}
            trimEnd={trimEnd}
            onTrimChange={(st, en) => {
              setTrimStart(st);
              setTrimEnd(en);
              if (videoRef.current) {
                videoRef.current.currentTime = st;
              }
            }}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={(spd) => {
              setPlaybackSpeed(spd);
              if (videoRef.current) {
                videoRef.current.playbackRate = spd;
              }
            }}
          />
        </div>
      </div>

      {/* Live Camera Recorder Overlay Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <ReelCameraRecorder
            onRecorded={(file) => {
              setShowCamera(false);
              handleLoadFile(file);
            }}
            onCancel={() => setShowCamera(false)}
          />
        </div>
      )}

      {/* Export & Upload Modal */}
      <ReelExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        isExporting={isExporting}
        exportProgress={exportProgress}
        exportResult={exportResult}
        onUploadToBuzzClips={handleUploadHandOff}
      />
    </div>
  );
};

"use client";

import React, { useRef } from "react";
import {
  Upload,
  Camera,
  Sliders,
  Type,
  Smile,
  Music,
  Scissors,
  Check,
  Plus,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ReelFilter,
  TextOverlay,
  SoundtrackTrack,
  TextFontFamily,
} from "./types";
import { REEL_FILTERS, PRESET_STICKERS, QUICK_EMOJIS } from "./filters";
import { CURATED_TRACKS, reelAudioEngine } from "./audioEngine";

export type StudioTab = "source" | "trim" | "filters" | "text" | "stickers" | "audio";

interface ReelToolsPanelProps {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  // Source
  onSelectFile: (file: File) => void;
  onOpenLiveCamera: () => void;
  onSelectSampleClip: (url: string) => void;
  // Filters
  selectedFilter: ReelFilter;
  onSelectFilter: (filter: ReelFilter) => void;
  manualAdjustments: {
    brightness: number;
    contrast: number;
    saturate: number;
    hue: number;
    blur: number;
  };
  onUpdateManualAdjustment: (key: string, value: number) => void;
  onResetAdjustments: () => void;
  // Text
  textOverlays: TextOverlay[];
  selectedOverlayId: string | null;
  onAddText: () => void;
  onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
  // Stickers
  onAddSticker: (content: string, type: "emoji" | "badge", bgColor?: string, textColor?: string) => void;
  // Audio
  selectedTrack: SoundtrackTrack | null;
  onSelectTrack: (track: SoundtrackTrack | null) => void;
  videoVolume: number;
  onChangeVideoVolume: (vol: number) => void;
  musicVolume: number;
  onChangeMusicVolume: (vol: number) => void;
  onUploadCustomAudio: (file: File) => void;
  // Trim & Speed
  duration: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
}

export const ReelToolsPanel: React.FC<ReelToolsPanelProps> = ({
  activeTab,
  setActiveTab,
  onSelectFile,
  onOpenLiveCamera,
  onSelectSampleClip,
  selectedFilter,
  onSelectFilter,
  manualAdjustments,
  onUpdateManualAdjustment,
  onResetAdjustments,
  textOverlays,
  selectedOverlayId,
  onAddText,
  onUpdateText,
  onAddSticker,
  selectedTrack,
  onSelectTrack,
  videoVolume,
  onChangeVideoVolume,
  musicVolume,
  onChangeMusicVolume,
  onUploadCustomAudio,
  duration,
  trimStart,
  trimEnd,
  onTrimChange,
  playbackSpeed,
  onChangePlaybackSpeed,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const selectedText = textOverlays.find((t) => t.id === selectedOverlayId);

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec - s) * 10);
    return `${s}.${ms}s`;
  };

  return (
    <div className="w-full flex flex-col bg-card/90 backdrop-blur-md rounded-2xl border border-border/60 overflow-hidden shadow-xl">
      {/* Tab Navigation Navigation Bar */}
      <div className="flex items-center gap-1 p-2 bg-muted/40 border-b border-border/50 overflow-x-auto no-scrollbar">
        <Button
          type="button"
          variant={activeTab === "source" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("source")}
          className="rounded-xl text-xs font-semibold gap-1.5 h-8 shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          Media
        </Button>

        <Button
          type="button"
          variant={activeTab === "trim" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("trim")}
          className="rounded-xl text-xs font-semibold gap-1.5 h-8 shrink-0"
        >
          <Scissors className="w-3.5 h-3.5" />
          Trim & Speed
        </Button>

        <Button
          type="button"
          variant={activeTab === "filters" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("filters")}
          className="rounded-xl text-xs font-semibold gap-1.5 h-8 shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          Filters
        </Button>

        <Button
          type="button"
          variant={activeTab === "text" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("text")}
          className="rounded-xl text-xs font-semibold gap-1.5 h-8 shrink-0"
        >
          <Type className="w-3.5 h-3.5" />
          Text ({textOverlays.length})
        </Button>

        <Button
          type="button"
          variant={activeTab === "stickers" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("stickers")}
          className="rounded-xl text-xs font-semibold gap-1.5 h-8 shrink-0"
        >
          <Smile className="w-3.5 h-3.5" />
          Stickers
        </Button>

        <Button
          type="button"
          variant={activeTab === "audio" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("audio")}
          className="rounded-xl text-xs font-semibold gap-1.5 h-8 shrink-0"
        >
          <Music className="w-3.5 h-3.5" />
          Audio
        </Button>
      </div>

      {/* Tab Content Body */}
      <div className="p-4 overflow-y-auto max-h-[380px]">
        {/* TAB 1: MEDIA SOURCE */}
        {activeTab === "source" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onSelectFile(e.target.files[0]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-24 flex flex-col items-center justify-center gap-2 rounded-2xl border-dashed border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-foreground"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Upload Video Clip</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onOpenLiveCamera}
                className="h-24 flex flex-col items-center justify-center gap-2 rounded-2xl border-dashed border-2 border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/5 text-foreground"
              >
                <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Record from Camera</span>
              </Button>
            </div>

            {/* Quick Demo Clips */}
            <div className="pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Or Try Sample Clips
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onSelectSampleClip(
                      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    )
                  }
                  className="p-2.5 rounded-xl border border-border/70 hover:border-primary bg-muted/20 text-left transition-colors"
                >
                  <p className="text-xs font-bold truncate">Action Clip</p>
                  <p className="text-[10px] text-muted-foreground">High energy ⚡</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSelectSampleClip(
                      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
                    )
                  }
                  className="p-2.5 rounded-xl border border-border/70 hover:border-primary bg-muted/20 text-left transition-colors"
                >
                  <p className="text-xs font-bold truncate">Lifestyle</p>
                  <p className="text-[10px] text-muted-foreground">Vibrant 🌴</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSelectSampleClip(
                      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
                    )
                  }
                  className="p-2.5 rounded-xl border border-border/70 hover:border-primary bg-muted/20 text-left transition-colors"
                >
                  <p className="text-xs font-bold truncate">Urban Beat</p>
                  <p className="text-[10px] text-muted-foreground">Modern City 🌆</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRIM & SPEED */}
        {activeTab === "trim" && (
          <div className="space-y-5">
            {/* Trim controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-primary" />
                  Trim Clip Range
                </span>
                <span className="font-mono text-muted-foreground">
                  {formatSeconds(trimStart)} - {formatSeconds(trimEnd)} (Total:{" "}
                  {formatSeconds(Math.max(0, trimEnd - trimStart))})
                </span>
              </div>

              {/* Range sliders */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-muted-foreground">Start:</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0.1, trimEnd - 0.5)}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => onTrimChange(parseFloat(e.target.value), trimEnd)}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono text-[11px]">
                    {formatSeconds(trimStart)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-muted-foreground">End:</span>
                  <input
                    type="range"
                    min={trimStart + 0.5}
                    max={Math.max(1, duration)}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => onTrimChange(trimStart, parseFloat(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono text-[11px]">
                    {formatSeconds(trimEnd)}
                  </span>
                </div>
              </div>
            </div>

            {/* Playback Speed */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Label className="text-xs font-semibold text-foreground">
                Playback Speed Multiplier
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <Button
                    key={speed}
                    type="button"
                    variant={playbackSpeed === speed ? "default" : "outline"}
                    size="sm"
                    onClick={() => onChangePlaybackSpeed(speed)}
                    className="rounded-xl font-bold text-xs h-8"
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FILTERS & ADJUSTMENTS */}
        {activeTab === "filters" && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Instagram Filter Presets
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {REEL_FILTERS.map((f) => {
                  const isSelected = selectedFilter.id === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onSelectFilter(f)}
                      className={`group relative flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary"
                          : "border-border/60 hover:border-primary/50 bg-muted/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${f.previewGradient} shadow-inner mb-1 flex items-center justify-center`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-[11px] font-semibold truncate w-full">
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-3 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Fine Tune Sliders</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onResetAdjustments}
                  className="h-6 text-[10px] text-muted-foreground"
                >
                  Reset All
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Brightness</span>
                  <span className="font-mono text-[11px]">{manualAdjustments.brightness}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={1}
                  value={manualAdjustments.brightness}
                  onChange={(e) => onUpdateManualAdjustment("brightness", parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground">Contrast</span>
                  <span className="font-mono text-[11px]">{manualAdjustments.contrast}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={160}
                  step={1}
                  value={manualAdjustments.contrast}
                  onChange={(e) => onUpdateManualAdjustment("contrast", parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground">Saturation</span>
                  <span className="font-mono text-[11px]">{manualAdjustments.saturate}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={manualAdjustments.saturate}
                  onChange={(e) => onUpdateManualAdjustment("saturate", parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TEXT OVERLAYS */}
        {activeTab === "text" && (
          <div className="space-y-4">
            <Button
              type="button"
              onClick={onAddText}
              className="w-full h-9 rounded-xl font-semibold gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <Plus className="w-4 h-4" />
              Add Text Sticker
            </Button>

            {selectedText ? (
              <div className="p-3 rounded-xl border border-border/70 bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">Edit Selected Text</Label>
                  <Badge variant="outline" className="text-[10px]">
                    Drag on canvas to position
                  </Badge>
                </div>

                <Input
                  value={selectedText.text}
                  onChange={(e) => onUpdateText(selectedText.id, { text: e.target.value })}
                  placeholder="Type your caption..."
                  className="h-8 text-xs font-semibold"
                />

                {/* Typography selector */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Font Style</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: "Modern Bold", font: "Inter, sans-serif" as TextFontFamily },
                      { name: "Typewriter", font: "'Courier New', Courier, monospace" as TextFontFamily },
                      { name: "Impact Meme", font: "Impact, Haettenschweiler, sans-serif" as TextFontFamily },
                      { name: "Neon Script", font: "'Brush Script MT', cursive" as TextFontFamily },
                    ].map((f) => (
                      <Button
                        key={f.name}
                        type="button"
                        variant={selectedText.font === f.font ? "default" : "outline"}
                        size="sm"
                        onClick={() => onUpdateText(selectedText.id, { font: f.font, fontName: f.name })}
                        className="h-7 text-[11px] justify-start"
                      >
                        {f.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color & Background Pill Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-[11px] text-muted-foreground">Color:</Label>
                    <input
                      type="color"
                      value={selectedText.color}
                      onChange={(e) => onUpdateText(selectedText.id, { color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>

                  <Button
                    type="button"
                    variant={selectedText.hasBg ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onUpdateText(selectedText.id, { hasBg: !selectedText.hasBg })}
                    className="h-7 text-[11px]"
                  >
                    {selectedText.hasBg ? "Pill Background: ON" : "Pill Background: OFF"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Click on any text in the phone preview or click &quot;Add Text Sticker&quot; to customize.
              </p>
            )}
          </div>
        )}

        {/* TAB 5: STICKERS & EMOJIS */}
        {activeTab === "stickers" && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Trending Reel Badges
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() =>
                      onAddSticker(stk.content, "badge", stk.bgColor, stk.textColor)
                    }
                    style={{ backgroundColor: stk.bgColor }}
                    className="p-2.5 rounded-xl text-white font-black text-xs shadow-sm hover:scale-102 transition-transform text-center active:scale-95"
                  >
                    {stk.content}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border/40">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Quick Emojis
              </Label>
              <div className="grid grid-cols-6 gap-2">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onAddSticker(emoji, "emoji")}
                    className="h-10 rounded-xl bg-muted/40 hover:bg-muted text-xl flex items-center justify-center transition-transform hover:scale-115 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIO & SOUNDTRACK */}
        {activeTab === "audio" && (
          <div className="space-y-4">
            {/* Curated Soundtracks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  BuzzClips Sound Library
                </Label>
                {selectedTrack && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      reelAudioEngine.stop();
                      onSelectTrack(null);
                    }}
                    className="h-6 text-[10px] text-destructive"
                  >
                    Remove Music
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                {CURATED_TRACKS.map((trk) => {
                  const isSelected = selectedTrack?.id === trk.id;
                  return (
                    <button
                      key={trk.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          reelAudioEngine.stop();
                          onSelectTrack(null);
                        } else {
                          onSelectTrack(trk);
                          reelAudioEngine.play(trk, musicVolume);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-pink-500 bg-pink-500/10 ring-1 ring-pink-500"
                          : "border-border/60 hover:border-primary/50 bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-pink-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Music className={`w-4 h-4 ${isSelected ? "animate-bounce" : ""}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-foreground">
                            {trk.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {trk.genre} • {trk.bpm} BPM
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <Badge className="bg-pink-600 text-white text-[10px]">Active</Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Audio Upload */}
            <div className="pt-2">
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onUploadCustomAudio(e.target.files[0]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => audioInputRef.current?.click()}
                className="w-full rounded-xl text-xs font-semibold gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Custom Soundtrack (MP3/WAV)
              </Button>
            </div>

            {/* Volume Mixer Sliders */}
            <div className="space-y-3 pt-3 border-t border-border/40">
              <Label className="text-xs font-semibold">Audio Mixer</Label>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {videoVolume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    Original Video Audio
                  </span>
                  <span className="font-mono text-[11px]">{Math.round(videoVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={videoVolume}
                  onChange={(e) => onChangeVideoVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Music className="w-3.5 h-3.5 text-pink-400" />
                    Background Music
                  </span>
                  <span className="font-mono text-[11px]">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeMusicVolume(val);
                    reelAudioEngine.setVolume(val);
                  }}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

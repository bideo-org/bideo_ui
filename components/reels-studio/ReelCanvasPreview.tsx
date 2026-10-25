"use client";

import React, { useRef, useState } from "react";
import {
  ReelAspect,
  ReelFilter,
  TextOverlay,
  StickerOverlay,
} from "./types";
import {
  Heart,
  MessageCircle,
  Share2,
  Music,
  Trash2,
  Sparkles,
  Play,
} from "lucide-react";
import { User } from "@/store/auth-context";

interface ReelCanvasPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoSrc: string | null;
  aspect: ReelAspect;
  selectedFilter: ReelFilter;
  manualAdjustments: {
    brightness: number;
    contrast: number;
    saturate: number;
    hue: number;
    blur: number;
  };
  textOverlays: TextOverlay[];
  stickerOverlays: StickerOverlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onUpdateTextPosition: (id: string, x: number, y: number) => void;
  onUpdateStickerPosition: (id: string, x: number, y: number) => void;
  onDeleteOverlay: (id: string) => void;
  showInstagramOverlay: boolean;
  currentUser?: User;
  reelTitle: string;
  soundtrackTitle?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const ReelCanvasPreview: React.FC<ReelCanvasPreviewProps> = ({
  videoRef,
  videoSrc,
  aspect,
  selectedFilter,
  manualAdjustments,
  textOverlays,
  stickerOverlays,
  selectedOverlayId,
  onSelectOverlay,
  onUpdateTextPosition,
  onUpdateStickerPosition,
  onDeleteOverlay,
  showInstagramOverlay,
  currentUser,
  reelTitle,
  soundtrackTitle,
  isPlaying,
  onTogglePlay,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map aspect ratio to Tailwind container sizing
  const getAspectClass = (asp: ReelAspect) => {
    switch (asp) {
      case "9:16":
        return "w-[340px] h-[604px] sm:w-[360px] sm:h-[640px]";
      case "1:1":
        return "w-[360px] h-[360px]";
      case "4:5":
        return "w-[360px] h-[450px]";
      case "16:9":
        return "w-[560px] h-[315px]";
      default:
        return "w-[340px] h-[604px]";
    }
  };

  // Compute CSS filter string combining preset filter + fine adjustments
  const combinedFilterString = [
    selectedFilter.cssFilter !== "none" ? selectedFilter.cssFilter : "",
    manualAdjustments.brightness !== 100 ? `brightness(${manualAdjustments.brightness}%)` : "",
    manualAdjustments.contrast !== 100 ? `contrast(${manualAdjustments.contrast}%)` : "",
    manualAdjustments.saturate !== 100 ? `saturate(${manualAdjustments.saturate}%)` : "",
    manualAdjustments.hue !== 0 ? `hue-rotate(${manualAdjustments.hue}deg)` : "",
    manualAdjustments.blur > 0 ? `blur(${manualAdjustments.blur}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Dragging handlers for text and stickers
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    currentX: number,
    currentY: number
  ) => {
    e.stopPropagation();
    onSelectOverlay(id);
    setDraggingId(id);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickPercentX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickPercentY = ((e.clientY - rect.top) / rect.height) * 100;

    setDragOffset({
      x: clickPercentX - currentX,
      y: clickPercentY - currentY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = Math.max(5, Math.min(95, rawX - dragOffset.x));
    const newY = Math.max(5, Math.min(95, rawY - dragOffset.y));

    const isText = textOverlays.some((t) => t.id === draggingId);
    if (isText) {
      onUpdateTextPosition(draggingId, newX, newY);
    } else {
      onUpdateStickerPosition(draggingId, newX, newY);
    }
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      {/* Phone Mockup Frame */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => onSelectOverlay(null)}
        className={`relative ${getAspectClass(
          aspect
        )} rounded-[32px] overflow-hidden bg-black shadow-2xl ring-1 ring-zinc-800 transition-all duration-300 flex items-center justify-center cursor-pointer`}
      >
        {/* Top Phone Notch / Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-900/90 rounded-full z-30 pointer-events-none ring-1 ring-zinc-800/50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-950/80 mr-3" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
        </div>

        {/* Video Element */}
        {videoSrc ? (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              playsInline
              loop
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              style={{ filter: combinedFilterString || undefined }}
              className="w-full h-full object-cover transition-all duration-150"
            />
            {!isPlaying && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 shadow-lg">
                  <Play className="w-6 h-6 ml-1" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500 gap-2 p-6 text-center">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            <p className="text-sm font-semibold text-zinc-300">
              No Video Selected
            </p>
            <p className="text-xs text-zinc-500 max-w-xs">
              Upload a clip, record with your camera, or pick a sample from the
              source panel.
            </p>
          </div>
        )}

        {/* Text Overlays Layer */}
        {textOverlays.map((item) => {
          const isSelected = selectedOverlayId === item.id;
          return (
            <div
              key={item.id}
              onPointerDown={(e) => handlePointerDown(e, item.id, item.x, item.y)}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translate(-50%, -50%)",
                fontFamily: item.font,
                fontSize: `${item.fontSize}px`,
                color: item.color,
                backgroundColor: item.hasBg ? item.bgColor : "transparent",
              }}
              className={`absolute z-20 cursor-grab active:cursor-grabbing px-3 py-1 rounded-xl max-w-[85%] text-center break-words font-bold transition-shadow ${
                isSelected
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-black shadow-lg"
                  : ""
              }`}
            >
              {item.text}
              {isSelected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteOverlay(item.id);
                  }}
                  className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-md"
                  title="Remove text"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Sticker Overlays Layer */}
        {stickerOverlays.map((stk) => {
          const isSelected = selectedOverlayId === stk.id;
          return (
            <div
              key={stk.id}
              onPointerDown={(e) => handlePointerDown(e, stk.id, stk.x, stk.y)}
              style={{
                left: `${stk.x}%`,
                top: `${stk.y}%`,
                transform: `translate(-50%, -50%) rotate(${stk.rotation}deg)`,
                fontSize: `${stk.size}px`,
                backgroundColor: stk.bgColor || "transparent",
                color: stk.textColor || "inherit",
              }}
              className={`absolute z-20 cursor-grab active:cursor-grabbing select-none transition-shadow ${
                stk.type === "badge"
                  ? "px-3 py-1 rounded-full font-black tracking-wide text-xs shadow-lg uppercase"
                  : ""
              } ${
                isSelected
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-black"
                  : ""
              }`}
            >
              {stk.content}
              {isSelected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteOverlay(stk.id);
                  }}
                  className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-md text-xs"
                  title="Remove sticker"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Simulated Instagram Reel UI Overlay */}
        {showInstagramOverlay && (
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 bg-gradient-to-b from-black/30 via-transparent to-black/70">
            {/* Reel Header */}
            <div className="flex items-center justify-between text-white text-xs font-semibold pt-4">
              <span className="flex items-center gap-1.5 drop-shadow">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Reels
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] text-zinc-300 backdrop-blur-sm">
                BuzzClips Preview
              </span>
            </div>

            {/* Right Action Rail */}
            <div className="self-end flex flex-col items-center gap-4 text-white drop-shadow pb-12 pr-1">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </div>
                <span className="text-[11px] font-semibold">12.4K</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold">482</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold">Share</span>
              </div>
            </div>

            {/* Bottom Meta & Soundtrack */}
            <div className="text-white space-y-1.5 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center font-bold text-xs text-white">
                  {(currentUser?.fullName || currentUser?.user_name || "B")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="font-semibold text-xs drop-shadow">
                  @{currentUser?.username || currentUser?.user_name || "creator"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/40 font-medium">
                  Follow
                </span>
              </div>

              <p className="text-xs line-clamp-2 drop-shadow font-normal text-zinc-100">
                {reelTitle || "Creating viral reels with BuzzClips Reels Studio ✨ #buzzclips #reels"}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 drop-shadow">
                <Music className="w-3 h-3 animate-spin text-pink-400" />
                <span className="truncate max-w-[200px]">
                  {soundtrackTitle || "Original Audio - BuzzClips Sound"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

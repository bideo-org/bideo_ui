export type ReelAspect = "9:16" | "1:1" | "4:5" | "16:9";

export interface ReelFilter {
  id: string;
  name: string;
  cssFilter: string;
  description: string;
  previewGradient: string;
}

export type TextFontFamily =
  | "Inter, sans-serif"
  | "'Courier New', Courier, monospace"
  | "Impact, Haettenschweiler, sans-serif"
  | "'Brush Script MT', cursive"
  | "Georgia, serif";

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  font: TextFontFamily;
  fontName: string;
  fontSize: number; // px at 1080x1920 base
  color: string;
  bgColor: string;
  hasBg: boolean;
  align: "left" | "center" | "right";
}

export interface StickerOverlay {
  id: string;
  content: string; // Emoji char or badge text
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  size: number;
  rotation: number; // degrees
  type: "emoji" | "badge";
  bgColor?: string;
  textColor?: string;
}

export type SynthMood = "lofi" | "cyber" | "pop" | "acoustic" | "chill";

export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  durationSec: number;
  bpm: number;
  mood: SynthMood;
  isCustom?: boolean;
  audioBlobUrl?: string;
}

export interface StudioExportResult {
  blob: Blob;
  file: File;
  previewUrl: string;
  duration: number;
  aspect: ReelAspect;
  title: string;
}

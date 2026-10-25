import { ReelFilter } from "./types";

export const REEL_FILTERS: ReelFilter[] = [
  {
    id: "normal",
    name: "Normal",
    cssFilter: "none",
    description: "Original natural footage",
    previewGradient: "from-zinc-500 to-zinc-700",
  },
  {
    id: "clarendon",
    name: "Clarendon",
    cssFilter: "contrast(1.25) saturate(1.4) brightness(1.05)",
    description: "Vivid, intense colors with deep contrast",
    previewGradient: "from-blue-500 via-indigo-500 to-pink-500",
  },
  {
    id: "golden_hour",
    name: "Golden Hour",
    cssFilter: "sepia(0.28) saturate(1.45) brightness(1.08) hue-rotate(-12deg)",
    description: "Warm sunset glow and golden highlights",
    previewGradient: "from-amber-400 via-orange-500 to-rose-500",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    cssFilter: "contrast(1.35) saturate(1.6) hue-rotate(170deg) brightness(1.1)",
    description: "Futuristic electric neon violet & cyan tones",
    previewGradient: "from-fuchsia-600 via-purple-600 to-cyan-400",
  },
  {
    id: "noir_90s",
    name: "Noir 90s",
    cssFilter: "grayscale(1) contrast(1.45) brightness(0.95)",
    description: "High-contrast vintage monochrome cinema",
    previewGradient: "from-zinc-900 via-zinc-600 to-zinc-400",
  },
  {
    id: "retro_vhs",
    name: "Retro VHS",
    cssFilter: "sepia(0.35) contrast(1.2) saturate(1.3) hue-rotate(-5deg)",
    description: "90s analog camcorder nostalgic warmth",
    previewGradient: "from-yellow-600 via-red-500 to-amber-700",
  },
  {
    id: "teal_orange",
    name: "Teal & Orange",
    cssFilter: "contrast(1.22) saturate(1.35) hue-rotate(25deg)",
    description: "Hollywood blockbuster cinematic grade",
    previewGradient: "from-teal-500 via-cyan-600 to-orange-500",
  },
  {
    id: "neon_pop",
    name: "Neon Pop",
    cssFilter: "contrast(1.4) saturate(1.8) brightness(1.12)",
    description: "Ultra-vibrant punchy colors that pop",
    previewGradient: "from-pink-500 via-rose-500 to-yellow-400",
  },
];

export const PRESET_STICKERS = [
  { id: "viral", content: "🔥 VIRAL", type: "badge" as const, bgColor: "#ef4444", textColor: "#ffffff" },
  { id: "sound_on", content: "🔊 SOUND ON", type: "badge" as const, bgColor: "#3b82f6", textColor: "#ffffff" },
  { id: "lit", content: "✨ LIT", type: "badge" as const, bgColor: "#8b5cf6", textColor: "#ffffff" },
  { id: "wait_for_it", content: "⏳ WAIT FOR IT...", type: "badge" as const, bgColor: "#f59e0b", textColor: "#000000" },
  { id: "new_reel", content: "🎬 NEW REEL", type: "badge" as const, bgColor: "#10b981", textColor: "#ffffff" },
  { id: "india_pride", content: "🇮🇳 BUZZCLIPS", type: "badge" as const, bgColor: "#ea580c", textColor: "#ffffff" },
  { id: "tap_here", content: "👇 TAP HERE", type: "badge" as const, bgColor: "#ec4899", textColor: "#ffffff" },
  { id: "mood", content: "💯 MOOD", type: "badge" as const, bgColor: "#6366f1", textColor: "#ffffff" },
];

export const QUICK_EMOJIS = ["🔥", "❤️", "🚀", "😂", "✨", "🍿", "⚡", "💯", "🤯", "🙌", "😍", "🎉"];

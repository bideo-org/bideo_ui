# BuzzClips (`bideo_ui`) 🎬

> **High-Performance Video Sharing & Viral Reels Platform | Built with Next.js 15, React 19 & Tailwind CSS v4**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.8-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![HLS.js](https://img.shields.io/badge/Streaming-HLS.js-orange?style=flat)](https://github.com/video-dev/hls.js/)

---

## 🚀 Overview

**BuzzClips** is a next-generation video streaming and creation platform built for creators and viewers. It features adaptive multi-rendition HLS video playback, direct-to-cloud S3 uploads with real-time SSE transcoding tracking, an Instagram-style vertical Reels feed, and a built-in **Instagram Reel-like Editor Studio**.

---

## ✨ Features

### 🌟 Instagram Reel-like Editor Studio (`/reels/create`)
* **Exclusive for Authenticated Creators**: Dedicated creation suite restricted to logged-in users with a radiant alert banner on the upload page.
* **9:16 Vertical Canvas Preview**: Interactive phone mockup with simulated Instagram UI (username, likes, comments, share, audio ticker) for true WYSIWYG editing.
* **Live Camera Recording**: In-browser webcam/mobile camera recording with a 3-second countdown timer, camera flip, and audio mute.
* **Timeline Trimming & Speed Controls**: Set precise start and end trim markers, with playback speeds from `0.5x` (slow-motion) to `2x` (hyper-lapse).
* **Color Grading & Filters**: Instant Instagram presets (*Clarendon, Golden Hour, Cyberpunk, 90s Noir, Retro VHS, Teal & Orange*) plus manual brightness, contrast, and saturation sliders.
* **Draggable Text Overlays**: Custom typography (*Modern Bold, Typewriter, Impact Meme, Neon Script*), font colors, and rounded pill backgrounds.
* **Stickers & Emoji Reactions**: Viral badges (`🔥 VIRAL`, `🔊 SOUND ON`, `✨ LIT`, `WAIT FOR IT...`) and interactive emojis placed anywhere on the canvas.
* **Audio Mixer & Synthesized Soundtracks**: Curated procedural beat tracks (Lo-Fi, Synthwave, Pop, Acoustic) or custom audio upload with dual volume controls.
* **In-Browser Canvas Export**: Fast client-side rendering via `canvas.captureStream()` and `MediaRecorder` at 1080x1920 (9:16) with 1-click publishing directly to BuzzClips.

### ⚡ Direct-to-S3 Uploads & Live SSE Transcoder
* Direct presigned uploads to AWS S3 bypassing proxy bottlenecks, handling multi-GB video files.
* Live Server-Sent Events (SSE) tracking transcoding progress with automatic REST polling fallback.
* Multi-rendition HLS encoding (1080p, 720p, 480p, 360p) for buffer-free playback.

### 📱 Viral Reels Feed (`/reels`)
* Swipe/scroll vertical video feed with instant playback.
* Action rail for likes, comments drawer, sharing, and channel follow.

### 📺 Adaptive Video Player (`/watch/[id]`)
* Powered by `hls.js` and `plyr` with adaptive bitrate streaming.
* Theater mode, quality switcher, playback speed, and keyboard shortcuts.

---

## 🏛 Architecture & Design Patterns

Detailed technical documentation is available in the [`architecture/`](./architecture) directory:

* 📖 **[System Architecture Guide](./architecture/README.md)**: Cloud infrastructure, upload pipeline, HLS streaming pipeline, and module directory structure.
* 🛠 **[Design Patterns & Best Practices](./architecture/DESIGN_PATTERNS.md)**: Container-Presenter pattern, Canvas Compositor pipeline, Two-Phase direct storage handshake, procedural audio synthesizer, and SSE fallback strategies.

---

## 📁 Project Structure

```
bideo_ui/
├── app/                        # Next.js 15 App Router
│   ├── auth/                   # Authentication (login, register)
│   ├── channel/                # Creator channels (@username)
│   ├── my-videos/              # Video management dashboard
│   ├── reels/                  # Reels feed & /reels/create studio
│   ├── video/upload/           # Video upload page with Reels Studio banner
│   └── watch/[id]/             # Single video watch & playback page
├── components/
│   ├── partials/               # Navbar, Footer, MobileNav, Sidebar
│   ├── player/                 # HLS Video Player
│   ├── reels/                  # Reels feed container & action rail
│   ├── reels-studio/           # Instagram Reel-like editor studio
│   ├── ui/                     # Radix UI design system primitives
│   └── video/                  # UploadPage, ReelsStudioBanner, Comments
├── store/                      # AuthContext and user session management
├── utility/                    # S3 upload routines, API clients, SEO helpers
└── architecture/               # Architecture and design patterns documentation
```

---

## 🛠 Getting Started

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **npm** or **pnpm** / **yarn**

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/bideo-org/bideo_ui.git
   cd bideo_ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Run Development Server (Turbopack):
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality

```bash
# Run unit tests
npm test

# Run ESLint validation
npm run lint

# Production build check
npm run build
```

---

## 📄 License

This project is licensed under the MIT License. Built with ❤️ for creators in India and worldwide.

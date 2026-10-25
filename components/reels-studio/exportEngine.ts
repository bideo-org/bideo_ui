import {
  ReelAspect,
  StudioExportResult,
  TextOverlay,
  StickerOverlay,
  SoundtrackTrack,
} from "./types";
import { reelAudioEngine } from "./audioEngine";

export interface ExportOptions {
  videoEl: HTMLVideoElement;
  aspect: ReelAspect;
  filterString: string;
  textOverlays: TextOverlay[];
  stickerOverlays: StickerOverlay[];
  trimStart: number;
  trimEnd: number;
  playbackSpeed: number;
  soundtrack: SoundtrackTrack | null;
  videoVolume: number;
  musicVolume: number;
  title: string;
  onProgress?: (percent: number) => void;
}

export async function exportReelCanvas(
  options: ExportOptions
): Promise<StudioExportResult> {
  const {
    videoEl,
    aspect,
    filterString,
    textOverlays,
    stickerOverlays,
    trimStart,
    trimEnd,
    playbackSpeed,
    soundtrack,
    videoVolume,
    musicVolume,
    title,
    onProgress,
  } = options;

  // Determine export resolution
  let width = 1080;
  let height = 1920; // 9:16 default
  if (aspect === "1:1") {
    width = 1080;
    height = 1080;
  } else if (aspect === "4:5") {
    width = 1080;
    height = 1350;
  } else if (aspect === "16:9") {
    width = 1920;
    height = 1080;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create canvas 2D rendering context.");
  }

  // Setup canvas capture stream
  const canvasStream = canvas.captureStream(30);

  // Combine audio track if available
  const mixedAudioTrack = reelAudioEngine.createMixedAudioTrack(
    videoEl,
    soundtrack,
    videoVolume,
    musicVolume
  );
  if (mixedAudioTrack) {
    canvasStream.addTrack(mixedAudioTrack);
  }

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : "video/webm";

  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: 4000000, // 4Mbps high quality
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const renderDuration = Math.max(1, (trimEnd - trimStart) / playbackSpeed);

  return new Promise<StudioExportResult>((resolve, reject) => {
    let animFrameId: number;
    const startTime = performance.now();

    // Prepare video playback
    videoEl.currentTime = trimStart;
    videoEl.playbackRate = playbackSpeed;
    videoEl.muted = true; // prevent double browser speaker audio during export

    const drawFrame = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(100, Math.round((elapsed / renderDuration) * 100));
      onProgress?.(progress);

      if (elapsed >= renderDuration || videoEl.currentTime >= trimEnd) {
        // Finish recording
        cancelAnimationFrame(animFrameId);
        recorder.stop();
        return;
      }

      // 1. Draw video background with "object-fit: cover"
      ctx.save();
      if (filterString && filterString !== "none") {
        ctx.filter = filterString;
      }

      const vWidth = videoEl.videoWidth || 1920;
      const vHeight = videoEl.videoHeight || 1080;
      const scale = Math.max(width / vWidth, height / vHeight);
      const drawW = vWidth * scale;
      const drawH = vHeight * scale;
      const offsetX = (width - drawW) / 2;
      const offsetY = (height - drawH) / 2;

      ctx.drawImage(videoEl, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      // 2. Draw Text Overlays
      textOverlays.forEach((t) => {
        ctx.save();
        const posX = (t.x / 100) * width;
        const posY = (t.y / 100) * height;

        // Scale font to canvas base resolution (1080px base)
        const scaleFactor = width / 360;
        const scaledFontSize = Math.round(t.fontSize * scaleFactor);

        ctx.font = `bold ${scaledFontSize}px ${t.font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (t.hasBg) {
          const textMetrics = ctx.measureText(t.text);
          const padX = 20 * scaleFactor;
          const padY = 12 * scaleFactor;
          const bgW = textMetrics.width + padX * 2;
          const bgH = scaledFontSize * 1.3 + padY;

          ctx.fillStyle = t.bgColor;
          ctx.beginPath();
          // Draw rounded pill
          const r = 16 * scaleFactor;
          ctx.roundRect(posX - bgW / 2, posY - bgH / 2, bgW, bgH, r);
          ctx.fill();
        }

        ctx.fillStyle = t.color;
        ctx.fillText(t.text, posX, posY);
        ctx.restore();
      });

      // 3. Draw Stickers & Emojis
      stickerOverlays.forEach((stk) => {
        ctx.save();
        const posX = (stk.x / 100) * width;
        const posY = (stk.y / 100) * height;
        const scaleFactor = width / 360;

        ctx.translate(posX, posY);
        ctx.rotate((stk.rotation * Math.PI) / 180);

        if (stk.type === "badge") {
          const fontSize = Math.round(18 * scaleFactor);
          ctx.font = `900 ${fontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const metrics = ctx.measureText(stk.content);
          const padX = 18 * scaleFactor;
          const padY = 10 * scaleFactor;
          const bgW = metrics.width + padX * 2;
          const bgH = fontSize * 1.2 + padY * 2;

          ctx.fillStyle = stk.bgColor || "#ef4444";
          ctx.beginPath();
          ctx.roundRect(-bgW / 2, -bgH / 2, bgW, bgH, 20 * scaleFactor);
          ctx.fill();

          ctx.fillStyle = stk.textColor || "#ffffff";
          ctx.fillText(stk.content, 0, 0);
        } else {
          // Emoji
          const emojiSize = Math.round(stk.size * scaleFactor);
          ctx.font = `${emojiSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(stk.content, 0, 0);
        }

        ctx.restore();
      });

      animFrameId = requestAnimationFrame(drawFrame);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const cleanTitle = (title || "buzzclips_reel")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_")
        .slice(0, 50);
      const fileName = `${cleanTitle}_${Date.now()}.webm`;
      const file = new File([blob], fileName, { type: "video/webm" });
      const previewUrl = URL.createObjectURL(blob);

      onProgress?.(100);
      resolve({
        blob,
        file,
        previewUrl,
        duration: renderDuration,
        aspect,
        title: title || "My BuzzClips Reel",
      });
    };

    recorder.onerror = (e) => {
      cancelAnimationFrame(animFrameId);
      reject(e);
    };

    // Start video playback & recorder
    videoEl
      .play()
      .then(() => {
        recorder.start(100);
        animFrameId = requestAnimationFrame(drawFrame);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

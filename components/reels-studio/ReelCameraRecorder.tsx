"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw, Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReelCameraRecorderProps {
  onRecorded: (file: File) => void;
  onCancel: () => void;
}

export const ReelCameraRecorder: React.FC<ReelCameraRecorderProps> = ({
  onRecorded,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize camera stream
  const startCamera = async (facing: "user" | "environment") => {
    // Stop any existing tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "Camera / Microphone permission denied. Please enable camera permissions in your browser."
          : "Unable to access camera device."
      );
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Handle Mute toggle
  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const beginRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    try {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const file = new File([blob], `reel_record_${Date.now()}.webm`, {
          type: "video/webm",
        });
        toast.success("Reel clip recorded successfully! Ready to edit ✨");
        onRecorded(file);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setRecordSeconds(0);
    } catch (e: any) {
      toast.error("Failed to start recording: " + e.message);
    }
  }, [onRecorded]);

  // Countdown & Recording Trigger
  const handleStartCountdown = () => {
    if (isRecording) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      beginRecording();
    }
  }, [countdown, beginRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Record timer tick
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordSeconds((s) => {
        if (s >= 60) {
          stopRecording();
          return s;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording, stopRecording]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full h-[620px] max-w-[360px] mx-auto rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-zinc-800 flex flex-col items-center justify-between p-4">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${
          facingMode === "user" ? "scale-x-[-1]" : ""
        }`}
      />

      {/* 3-2-1 Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center animate-ping text-6xl font-black text-white shadow-2xl">
            {countdown === 0 ? "GO!" : countdown}
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="relative z-20 w-full flex items-center justify-between text-white drop-shadow-md">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="rounded-full bg-black/40 hover:bg-black/60 text-white"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Live Timer Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-mono font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            REC {formatTime(recordSeconds)} / 01:00
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="rounded-full bg-black/40 hover:bg-black/60 text-white"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={flipCamera}
            className="rounded-full bg-black/40 hover:bg-black/60 text-white"
            title="Flip Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="relative z-20 bg-red-950/80 border border-red-500/50 rounded-xl p-4 text-xs text-red-200 text-center mx-4">
          <p>{errorMsg}</p>
          <Button
            onClick={() => startCamera(facingMode)}
            variant="outline"
            size="sm"
            className="mt-2 text-xs"
          >
            Retry Camera
          </Button>
        </div>
      )}

      {/* Bottom Shutter Action Bar */}
      <div className="relative z-20 w-full flex items-center justify-center py-4">
        {!isRecording ? (
          <button
            type="button"
            onClick={handleStartCountdown}
            className="group relative w-18 h-18 rounded-full border-4 border-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl"
            title="Start Recording"
          >
            <span className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 group-hover:scale-90 transition-transform" />
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="w-18 h-18 rounded-full border-4 border-red-500 flex items-center justify-center animate-pulse transition-transform hover:scale-105 active:scale-95 shadow-xl"
            title="Stop Recording"
          >
            <span className="w-8 h-8 rounded-lg bg-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

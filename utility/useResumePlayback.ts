"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { recordWatchProgress, fetchWatchProgress } from "@/utility/requests";

interface UseResumePlaybackProps {
  videoId?: number | string;
  playerRef?: React.RefObject<any>;
  token?: string;
}

export function useResumePlayback({
  videoId,
  playerRef,
  token,
}: UseResumePlaybackProps) {
  const [savedProgress, setSavedProgress] = useState<number>(0);
  const lastSentProgress = useRef<number>(-1);
  const lastHeartbeat = useRef<number>(0);
  const currentPositionRef = useRef<{ current: number; duration: number }>({
    current: 0,
    duration: 0,
  });
  const videoIdRef = useRef(videoId);
  videoIdRef.current = videoId;
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const initialSeekDone = useRef(false);

  // 1. Fetch saved position on videoId / token change
  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;
    initialSeekDone.current = false;

    fetchWatchProgress(videoId, token)
      .then((data) => {
        if (!isMounted || !data) return;
        const secs = data.progressSeconds || 0;
        if (secs > 5 && !data.completed && !initialSeekDone.current) {
          initialSeekDone.current = true;
          setSavedProgress(secs);
          if (playerRef?.current?.seekTo) {
            playerRef.current.seekTo(secs, "seconds");
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [videoId, token, playerRef]);

  const sendProgress = useCallback(
    (seconds: number, duration: number, keepalive = false) => {
      const vid = videoIdRef.current;
      const tok = tokenRef.current;
      if (!vid) return;

      const roundedSecs = Math.max(0, Math.floor(seconds));
      const roundedDur = Math.max(0, Math.floor(duration));

      if (roundedSecs === lastSentProgress.current && !keepalive) {
        return;
      }

      lastSentProgress.current = roundedSecs;
      lastHeartbeat.current = Date.now();

      recordWatchProgress(vid, roundedSecs, roundedDur, tok, keepalive);
    },
    []
  );

  // 2. Throttled heartbeat during playback
  const onTimeUpdate = useCallback(
    (currentTime?: number, duration?: number) => {
      let current = currentTime;
      let dur = duration;

      if (current === undefined && playerRef?.current) {
        if (typeof playerRef.current.getCurrentTime === "function") {
          current = playerRef.current.getCurrentTime();
        }
        if (typeof playerRef.current.getDuration === "function") {
          dur = playerRef.current.getDuration();
        }
      }

      if (current !== undefined) {
        currentPositionRef.current = {
          current,
          duration: dur !== undefined ? dur : currentPositionRef.current.duration,
        };

        const now = Date.now();
        // Send heartbeat every 8 seconds, or on the first progress tick past 0
        if (
          now - lastHeartbeat.current >= 8000 ||
          (lastHeartbeat.current === 0 && current > 0)
        ) {
          sendProgress(current, dur || 0);
        }
      }
    },
    [playerRef, sendProgress]
  );

  // 3. Play handler: record immediately so video appears in history right away
  const onPlay = useCallback(
    (currentTime?: number, duration?: number) => {
      const current = currentTime ?? currentPositionRef.current.current;
      const dur = duration ?? currentPositionRef.current.duration;
      currentPositionRef.current = { current, duration: dur };
      sendProgress(current, dur);
    },
    [sendProgress]
  );

  // 4. Pause handler: record immediately on pause
  const onPause = useCallback(
    (currentTime?: number, duration?: number) => {
      const current = currentTime ?? currentPositionRef.current.current;
      const dur = duration ?? currentPositionRef.current.duration;
      currentPositionRef.current = { current, duration: dur };
      sendProgress(current, dur);
    },
    [sendProgress]
  );

  // 5. Unmount / tab close flush with keepalive
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { current, duration } = currentPositionRef.current;
      if (current > 0) {
        sendProgress(current, duration, true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      const { current, duration } = currentPositionRef.current;
      if (current > 0) {
        sendProgress(current, duration, true);
      }
    };
  }, [sendProgress]);

  return {
    onTimeUpdate,
    onPlay,
    onPause,
    savedProgress,
  };
}

export default useResumePlayback;

import { SoundtrackTrack, SynthMood } from "./types";

export const CURATED_TRACKS: SoundtrackTrack[] = [
  {
    id: "lofi_sunset",
    title: "Sunset Vibes (Lofi Chill)",
    artist: "BuzzBeats Originals",
    genre: "Lo-Fi",
    durationSec: 30,
    bpm: 85,
    mood: "lofi",
  },
  {
    id: "cyber_pulse",
    title: "Neon Horizon (Synthwave)",
    artist: "BuzzBeats Cyber",
    genre: "Electronic",
    durationSec: 30,
    bpm: 120,
    mood: "cyber",
  },
  {
    id: "upbeat_pop",
    title: "Summer Bounce (Viral Pop)",
    artist: "BuzzBeats Studio",
    genre: "Pop / Dance",
    durationSec: 30,
    bpm: 128,
    mood: "pop",
  },
  {
    id: "acoustic_glow",
    title: "Morning Coffee (Acoustic)",
    artist: "BuzzBeats Acoustic",
    genre: "Indie Folk",
    durationSec: 30,
    bpm: 96,
    mood: "acoustic",
  },
  {
    id: "chill_midnight",
    title: "Midnight Tokyo (Ambient)",
    artist: "BuzzBeats Chill",
    genre: "Ambient",
    durationSec: 30,
    bpm: 75,
    mood: "chill",
  },
];

class ReelAudioEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: SoundtrackTrack | null = null;
  private isPlaying = false;
  private timerId: any = null;
  private masterGain: GainNode | null = null;
  private customAudio: HTMLAudioElement | null = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Synthesize procedural melodic beats using Web Audio API oscillators and filters
  private playSynthPattern(mood: SynthMood, bpm: number) {
    const ctx = this.getContext();
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
    }

    const interval = (60 / bpm) * 1000;
    let step = 0;

    // Chords and notes per mood
    const patterns: Record<SynthMood, { chords: number[][]; bass: number[]; lead: number[] }> = {
      lofi: {
        chords: [
          [261.63, 329.63, 392.0, 493.88], // Cmaj7
          [220.0, 261.63, 329.63, 392.0],  // Am7
          [174.61, 220.0, 261.63, 329.63], // Fmaj7
          [196.0, 246.94, 293.66, 349.23], // G7
        ],
        bass: [130.81, 110.0, 87.31, 98.0],
        lead: [523.25, 493.88, 392.0, 440.0, 329.63],
      },
      cyber: {
        chords: [
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
          [261.63, 329.63, 392.0], // C
          [196.0, 246.94, 293.66], // G
        ],
        bass: [55.0, 43.65, 65.41, 49.0],
        lead: [440.0, 523.25, 659.25, 587.33, 783.99],
      },
      pop: {
        chords: [
          [261.63, 329.63, 392.0], // C
          [196.0, 246.94, 293.66], // G
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
        ],
        bass: [130.81, 98.0, 110.0, 87.31],
        lead: [523.25, 587.33, 659.25, 783.99],
      },
      acoustic: {
        chords: [
          [196.0, 246.94, 293.66], // G
          [164.81, 196.0, 246.94], // Em
          [261.63, 329.63, 392.0], // C
          [293.66, 369.99, 440.0], // D
        ],
        bass: [98.0, 82.41, 130.81, 146.83],
        lead: [392.0, 440.0, 493.88, 587.33],
      },
      chill: {
        chords: [
          [220.0, 277.18, 329.63], // A
          [174.61, 220.0, 261.63], // F
          [261.63, 329.63, 392.0], // C
          [146.83, 174.61, 220.0], // Dm
        ],
        bass: [110.0, 87.31, 130.81, 73.42],
        lead: [440.0, 392.0, 349.23, 329.63],
      },
    };

    const pattern = patterns[mood] || patterns.lofi;

    const playStep = () => {
      if (!this.isPlaying || !this.ctx || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;
      const chordIndex = Math.floor(step / 4) % pattern.chords.length;

      // 1. Kick / Bass Note
      if (step % 2 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = mood === "cyber" ? "sawtooth" : "triangle";
        bassOsc.frequency.setValueAtTime(pattern.bass[chordIndex], now);
        
        bassGain.gain.setValueAtTime(0.25, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + (interval / 1000) * 1.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain!);
        bassOsc.start(now);
        bassOsc.stop(now + (interval / 1000) * 1.5);
      }

      // 2. Warm Pad Chords (every 4 steps)
      if (step % 4 === 0) {
        const chordNotes = pattern.chords[chordIndex];
        chordNotes.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = mood === "cyber" ? "sawtooth" : "sine";
          osc.frequency.setValueAtTime(freq, now);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(mood === "cyber" ? 1800 : 900, now);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (interval / 1000) * 3.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(now);
          osc.stop(now + (interval / 1000) * 3.8);
        });
      }

      // 3. Lead Arp Plucks
      if (step % 2 === 1) {
        const leadNotes = pattern.lead;
        const note = leadNotes[(step * 3) % leadNotes.length];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (interval / 1000) * 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + (interval / 1000) * 0.8);
      }

      step++;
    };

    this.timerId = setInterval(playStep, interval / 2);
  }

  public play(track: SoundtrackTrack, volume = 0.7) {
    this.stop();
    this.currentTrack = track;
    this.isPlaying = true;

    const ctx = this.getContext();
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
    }
    this.masterGain.gain.setValueAtTime(volume, ctx.currentTime);

    if (track.isCustom && track.audioBlobUrl) {
      this.customAudio = new Audio(track.audioBlobUrl);
      this.customAudio.loop = true;
      this.customAudio.volume = volume;
      this.customAudio.play().catch((e) => console.warn("Audio play prevented", e));
    } else {
      this.playSynthPattern(track.mood, track.bpm);
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.currentTime = 0;
      this.customAudio = null;
    }
  }

  // Hook up audio mixer for canvas stream export: combines video audio track + soundtrack
  public createMixedAudioTrack(
    videoEl: HTMLVideoElement,
    track: SoundtrackTrack | null,
    videoVolume: number,
    musicVolume: number
  ): MediaStreamTrack | null {
    try {
      const ctx = this.getContext();
      const dest = ctx.createMediaStreamDestination();

      // Video element source
      if (videoVolume > 0 && !(videoEl as any)._audioSourceConnected) {
        try {
          const videoSource = ctx.createMediaElementSource(videoEl);
          const videoGain = ctx.createGain();
          videoGain.gain.value = videoVolume;
          videoSource.connect(videoGain);
          videoGain.connect(dest);
          videoGain.connect(ctx.destination);
          (videoEl as any)._audioSourceConnected = true;
        } catch {
          // MediaElementAudioSource already connected or CORS
        }
      }

      // Connect soundtrack to export destination if music track is active
      if (track && musicVolume > 0 && this.masterGain) {
        try {
          this.masterGain.connect(dest);
        } catch {
          // already connected
        }
      }

      // Return destination audio track if available
      const audioTracks = dest.stream.getAudioTracks();
      return audioTracks.length > 0 ? audioTracks[0] : null;
    } catch (err) {
      console.warn("Failed to create mixed audio track:", err);
      return null;
    }
  }
}

export const reelAudioEngine = new ReelAudioEngine();

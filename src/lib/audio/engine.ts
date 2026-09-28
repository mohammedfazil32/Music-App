import type { EngineMode, Track } from '../../types';
import { SynthVoice } from './synth';

/**
 * The single audio output for the app.
 *
 * One `HTMLAudioElement` is reused for every track (creating one per track
 * leaks decoders and breaks the autoplay gesture chain). If the stream cannot
 * be reached the engine transparently switches that track to the generative
 * `SynthVoice` and keeps its own clock, so progress, seeking, track-end and
 * auto-advance all behave identically in both modes.
 *
 * The engine is imperative and framework-free; `PlayerContext` owns all state
 * and drives this through effects.
 */

export interface EngineStatus {
  /** Intent to play — set optimistically so the UI responds to clicks at once. */
  isPlaying: boolean;
  isBuffering: boolean;
  mode: EngineMode;
  /** True once the stream failed and the synth fallback took over. */
  errored: boolean;
}

/** How long to wait for a stream to become playable before falling back. */
const STREAM_TIMEOUT_MS = 7000;
/** Progress is emitted at ~10Hz; the bars interpolate the rest with CSS. */
const PROGRESS_INTERVAL_MS = 100;

export class PlaybackEngine {
  onProgress: ((currentTime: number, duration: number) => void) | null = null;
  onStatus: ((status: EngineStatus) => void) | null = null;
  onEnded: (() => void) | null = null;

  private el: HTMLAudioElement;
  private synth = new SynthVoice();
  private mode: EngineMode = 'stream';
  private playing = false;
  private buffering = false;
  private errored = false;

  private track: Track | null = null;
  private volume = 0.8;
  private muted = false;

  /** Synth mode keeps its own clock, in seconds. */
  private synthTime = 0;
  private synthDuration = 0;
  private lastFrame = 0;

  private raf = 0;
  private lastEmit = 0;
  private fallbackTimer: number | null = null;

  constructor() {
    this.el = new Audio();
    this.el.preload = 'metadata';
    this.el.volume = this.volume;

    this.el.addEventListener('ended', this.handleEnded);
    this.el.addEventListener('error', this.handleError);
    this.el.addEventListener('waiting', this.handleWaiting);
    this.el.addEventListener('stalled', this.handleWaiting);
    this.el.addEventListener('canplay', this.handleReady);
    this.el.addEventListener('playing', this.handleReady);
    this.el.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    // Some browsers pause on their own (device sleep, audio focus loss).
    this.el.addEventListener('pause', this.handleElementPause);
  }

  /**
   * Point the engine at a track.
   * @param startAt Resume position in seconds — used when restoring a session.
   */
  load(track: Track, options: { autoplay: boolean; startAt?: number } = { autoplay: true }): void {
    const startAt = options.startAt ?? 0;
    this.track = track;
    this.mode = 'stream';
    this.errored = false;
    this.synthTime = startAt;
    this.synthDuration = track.duration;
    this.synth.stop();
    this.synth.seed(track.id);
    this.clearFallbackTimer();

    this.el.src = track.src;
    this.el.currentTime = 0;
    // `load()` cancels any in-flight request from the previous track.
    this.el.load();
    if (startAt > 0) {
      const seekOnce = () => {
        this.el.removeEventListener('loadedmetadata', seekOnce);
        try {
          this.el.currentTime = Math.min(startAt, this.el.duration || startAt);
        } catch {
          // Seeking before the media is seekable — harmless, start from 0.
        }
      };
      this.el.addEventListener('loadedmetadata', seekOnce);
    }

    this.emitProgress(true);

    if (options.autoplay) {
      void this.play();
    } else {
      this.playing = false;
      this.buffering = false;
      this.emitStatus();
    }
  }

  async play(): Promise<void> {
    if (!this.track) return;
    this.playing = true;
    this.emitStatus();
    this.startClock();

    if (this.mode === 'synth') {
      this.synth.setVolume(this.effectiveVolume());
      this.synth.start(this.synthTime);
      return;
    }

    this.armFallbackTimer();
    try {
      await this.el.play();
      this.clearFallbackTimer();
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'NotAllowedError') {
        // Autoplay was blocked: report paused and wait for a user gesture.
        this.playing = false;
        this.buffering = false;
        this.clearFallbackTimer();
        this.stopClock();
        this.emitStatus();
        return;
      }
      // Unsupported/undecodable source — the synth can still carry the UI.
      this.switchToSynth();
    }
  }

  pause(): void {
    this.playing = false;
    this.buffering = false;
    this.clearFallbackTimer();
    this.stopClock();
    if (this.mode === 'synth') {
      this.synth.stop();
    } else {
      this.el.pause();
    }
    this.emitStatus();
  }

  seek(seconds: number): void {
    const duration = this.duration();
    const next = Math.min(Math.max(0, seconds), duration > 0 ? duration : seconds);
    if (this.mode === 'synth') {
      this.synthTime = next;
      if (this.playing) {
        // Restart the sequencer so the music reflects the new position.
        this.synth.stop();
        this.synth.start(next);
      }
    } else {
      try {
        this.el.currentTime = next;
      } catch {
        // Not seekable yet; the position will apply once metadata arrives.
      }
    }
    this.emitProgress(true);
  }

  setVolume(value: number): void {
    this.volume = value;
    this.el.volume = this.effectiveVolume();
    this.synth.setVolume(this.effectiveVolume());
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.el.volume = this.effectiveVolume();
    this.synth.setVolume(this.effectiveVolume());
  }

  dispose(): void {
    this.stopClock();
    this.clearFallbackTimer();
    this.el.removeEventListener('ended', this.handleEnded);
    this.el.removeEventListener('error', this.handleError);
    this.el.removeEventListener('waiting', this.handleWaiting);
    this.el.removeEventListener('stalled', this.handleWaiting);
    this.el.removeEventListener('canplay', this.handleReady);
    this.el.removeEventListener('playing', this.handleReady);
    this.el.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.el.removeEventListener('pause', this.handleElementPause);
    this.el.pause();
    this.el.src = '';
    this.synth.dispose();
    this.onProgress = null;
    this.onStatus = null;
    this.onEnded = null;
  }

  // --- internals ------------------------------------------------------------

  private effectiveVolume(): number {
    return this.muted ? 0 : this.volume;
  }

  private duration(): number {
    if (this.mode === 'synth') return this.synthDuration;
    return Number.isFinite(this.el.duration) && this.el.duration > 0
      ? this.el.duration
      : (this.track?.duration ?? 0);
  }

  private currentTime(): number {
    return this.mode === 'synth' ? this.synthTime : this.el.currentTime;
  }

  private handleEnded = (): void => {
    this.stopClock();
    this.playing = false;
    this.emitStatus();
    this.onEnded?.();
  };

  private handleError = (): void => {
    // Only meaningful while a real source is attached.
    if (this.track && this.mode === 'stream') this.switchToSynth();
  };

  private handleWaiting = (): void => {
    if (this.mode !== 'stream' || !this.playing) return;
    this.buffering = true;
    this.emitStatus();
  };

  private handleReady = (): void => {
    this.clearFallbackTimer();
    if (!this.buffering) return;
    this.buffering = false;
    this.emitStatus();
  };

  private handleLoadedMetadata = (): void => {
    // Real duration beats the catalog's nominal value.
    this.emitProgress(true);
  };

  private handleElementPause = (): void => {
    if (this.mode !== 'stream' || !this.playing) return;
    if (this.el.ended) return;
    this.playing = false;
    this.stopClock();
    this.emitStatus();
  };

  private armFallbackTimer(): void {
    this.clearFallbackTimer();
    this.fallbackTimer = window.setTimeout(() => {
      // Still nothing playable after the grace period: go generative.
      if (this.mode === 'stream' && this.playing && this.el.readyState < 3) {
        this.switchToSynth();
      }
    }, STREAM_TIMEOUT_MS);
  }

  private clearFallbackTimer(): void {
    if (this.fallbackTimer !== null) {
      window.clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  private switchToSynth(): void {
    this.clearFallbackTimer();
    this.el.pause();
    this.mode = 'synth';
    this.errored = true;
    this.buffering = false;
    this.synthDuration = this.track?.duration ?? 0;
    this.emitStatus();
    if (this.playing) {
      this.synth.setVolume(this.effectiveVolume());
      this.synth.start(this.synthTime);
      this.startClock();
    }
    this.emitProgress(true);
  }

  private startClock(): void {
    if (this.raf !== 0) return;
    this.lastFrame = performance.now();
    const tick = (now: number) => {
      const delta = (now - this.lastFrame) / 1000;
      this.lastFrame = now;

      if (this.mode === 'synth' && this.playing) {
        this.synthTime += delta;
        if (this.synthDuration > 0 && this.synthTime >= this.synthDuration) {
          this.synthTime = this.synthDuration;
          this.synth.stop();
          this.playing = false;
          this.raf = 0;
          this.emitProgress(true);
          this.emitStatus();
          this.onEnded?.();
          return;
        }
      }

      this.emitProgress(false);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private stopClock(): void {
    if (this.raf !== 0) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private emitProgress(force: boolean): void {
    const now = performance.now();
    if (!force && now - this.lastEmit < PROGRESS_INTERVAL_MS) return;
    this.lastEmit = now;
    this.onProgress?.(this.currentTime(), this.duration());
  }

  private emitStatus(): void {
    this.onStatus?.({
      isPlaying: this.playing,
      isBuffering: this.buffering,
      mode: this.mode,
      errored: this.errored,
    });
  }
}

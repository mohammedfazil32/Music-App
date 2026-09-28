/**
 * Generative Web Audio fallback voice.
 *
 * When a track's audio URL cannot be reached (offline, blocked host, expired
 * link) the player switches to this instead of silently showing a dead
 * transport. It renders an ambient pad plus a slow arpeggio, seeded from the
 * track id so each track sounds consistent but distinct.
 *
 * It deliberately knows nothing about time or progress — the engine owns the
 * clock — so it only needs start / stop / setVolume.
 */

const SCALES: readonly number[][] = [
  [0, 3, 5, 7, 10], // minor pentatonic
  [0, 2, 4, 7, 9], // major pentatonic
  [0, 2, 3, 7, 8], // kumoi-ish
  [0, 3, 7, 10, 14], // stacked minor
];

const PROGRESSIONS: readonly number[][] = [
  [0, -3, -5, -1],
  [0, 4, -2, -5],
  [0, -5, 2, -3],
];

/** Bar length in seconds — the pad changes chord on each bar. */
const BAR = 3.2;
/** How far ahead of the audio clock notes are scheduled. */
const LOOKAHEAD = 0.6;
const TICK_MS = 120;

function hash(seed: string): number {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export class SynthVoice {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private pad: OscillatorNode[] = [];
  private timer: number | null = null;
  private nextNoteTime = 0;
  private step = 0;
  private volume = 0.8;
  private scale: number[] = SCALES[0];
  private progression: number[] = PROGRESSIONS[0];
  private root = 45;

  /** True when the browser exposes Web Audio at all. */
  static get supported(): boolean {
    return typeof window !== 'undefined' && 'AudioContext' in window;
  }

  seed(trackId: string): void {
    const h = hash(trackId);
    this.scale = SCALES[h % SCALES.length];
    this.progression = PROGRESSIONS[(h >> 3) % PROGRESSIONS.length];
    this.root = 40 + (h % 8);
  }

  setVolume(value: number): void {
    this.volume = value;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(value * 0.28, this.ctx.currentTime, 0.05);
    }
  }

  /** `offset` seeds the musical position so seeking lands somewhere new. */
  start(offset: number): void {
    if (!SynthVoice.supported) return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 1400;
      this.filter.Q.value = 0.8;
      this.filter.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.master.gain.value = 0;
    }
    void this.ctx.resume();

    this.step = Math.max(0, Math.floor(offset / (BAR / 4)));
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.startPad();
    this.master?.gain.setTargetAtTime(this.volume * 0.28, this.ctx.currentTime, 0.4);

    if (this.timer === null) {
      this.timer = window.setInterval(() => this.schedule(), TICK_MS);
    }
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(0, now, 0.12);
      const pad = this.pad;
      this.pad = [];
      window.setTimeout(() => {
        pad.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped by a rapid start/stop sequence.
          }
        });
      }, 400);
    }
  }

  /** Release the AudioContext entirely (called on teardown). */
  dispose(): void {
    this.stop();
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    this.filter = null;
    if (ctx) void ctx.close().catch(() => undefined);
  }

  private startPad(): void {
    if (!this.ctx || !this.filter || this.pad.length > 0) return;
    // Two slightly detuned saws an octave apart give the pad its width.
    [0, 12].forEach((interval, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = index === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.value = midiToHz(this.root + interval);
      osc.detune.value = index === 0 ? -6 : 8;
      gain.gain.value = index === 0 ? 0.16 : 0.07;
      osc.connect(gain);
      gain.connect(this.filter!);
      osc.start();
      this.pad.push(osc);
    });

    // Slow filter sweep so the pad breathes instead of sitting static.
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 550;
    lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    lfo.start();
    this.pad.push(lfo);
  }

  private schedule(): void {
    if (!this.ctx || !this.filter) return;
    const stepDuration = BAR / 4;

    while (this.nextNoteTime < this.ctx.currentTime + LOOKAHEAD) {
      const bar = Math.floor(this.step / 4) % this.progression.length;
      const chordRoot = this.root + 12 + this.progression[bar];
      const degree = this.scale[(this.step * 3) % this.scale.length];
      const octave = this.step % 8 === 0 ? 12 : 0;
      this.playNote(midiToHz(chordRoot + degree + octave), this.nextNoteTime, stepDuration * 1.8);

      // Sparse counter-melody every third step keeps it from feeling looped.
      if (this.step % 3 === 0) {
        const counter = this.scale[(this.step * 5) % this.scale.length];
        this.playNote(midiToHz(chordRoot + counter + 12), this.nextNoteTime + stepDuration * 0.5, stepDuration, 0.5);
      }

      this.nextNoteTime += stepDuration;
      this.step += 1;
    }
  }

  private playNote(frequency: number, at: number, length: number, level = 1): void {
    if (!this.ctx || !this.filter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.12 * level, at + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain);
    gain.connect(this.filter);
    osc.start(at);
    osc.stop(at + length + 0.05);
    osc.onended = () => {
      gain.disconnect();
      osc.disconnect();
    };
  }
}

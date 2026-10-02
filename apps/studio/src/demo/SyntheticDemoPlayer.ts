import { Point3D, NormalizedHand } from '@beatwave/protocol';
import { GestureRuntime } from '@beatwave/gesture-runtime';

export interface DemoStep {
  readonly timeMs: number;
  readonly padIndex: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly pinch: number;
}

export class SyntheticDemoPlayer {
  private isRunning: boolean = false;
  private animId: number | null = null;
  private startTime: number = 0;
  private readonly loopDurationMs: number = 4000; // 4 second 120BPM 2-bar beat

  // Rhythmic strike choreography: Kick (0), Hat (2), Snare (1), Hat (2), Clap (4), Sub Bass (12)
  private readonly pattern = [
    { t: 0, pad: 0, x: 0.2, y: 0.2 }, // Kick
    { t: 250, pad: 2, x: 0.6, y: 0.2 }, // Hat
    { t: 500, pad: 1, x: 0.4, y: 0.2 }, // Snare
    { t: 750, pad: 2, x: 0.6, y: 0.2 }, // Hat
    { t: 1000, pad: 0, x: 0.2, y: 0.2 }, // Kick
    { t: 1250, pad: 2, x: 0.6, y: 0.2 }, // Hat
    { t: 1500, pad: 4, x: 0.2, y: 0.4 }, // Clap
    { t: 1750, pad: 2, x: 0.6, y: 0.2 }, // Hat
    { t: 2000, pad: 12, x: 0.2, y: 0.8 }, // Sub Bass
    { t: 2250, pad: 2, x: 0.6, y: 0.2 }, // Hat
    { t: 2500, pad: 1, x: 0.4, y: 0.2 }, // Snare
    { t: 2750, pad: 2, x: 0.6, y: 0.2 }, // Hat
    { t: 3000, pad: 0, x: 0.2, y: 0.2 }, // Kick
    { t: 3250, pad: 3, x: 0.8, y: 0.2 }, // Open Hat
    { t: 3500, pad: 13, x: 0.4, y: 0.8 }, // FM Chord
    { t: 3750, pad: 2, x: 0.6, y: 0.2 } // Hat
  ];

  constructor(
    private readonly runtime: GestureRuntime,
    private readonly onUpdateCursor: (point: Point3D, pinch: number, striking: boolean) => void
  ) {}

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = performance.now();

    const loop = (now: DOMHighResTimeStamp) => {
      if (!this.isRunning) return;

      const elapsed = (now - this.startTime) % this.loopDurationMs;

      // Find current active pattern hit
      let currentHit = this.pattern[0];
      let nextHit = this.pattern[1];
      for (let i = 0; i < this.pattern.length; i++) {
        if (elapsed >= this.pattern[i].t) {
          currentHit = this.pattern[i];
          nextHit = this.pattern[(i + 1) % this.pattern.length];
        }
      }

      // Time since hit start
      const timeSinceHit = elapsed - currentHit.t;
      const isStriking = timeSinceHit >= 0 && timeSinceHit <= 60;

      // Interpolate position between current hit and next hit
      const hitDuration = (nextHit.t > currentHit.t ? nextHit.t : this.loopDurationMs) - currentHit.t;
      const alpha = Math.min(1.0, Math.max(0.0, timeSinceHit / hitDuration));

      const curX = currentHit.x + (nextHit.x - currentHit.x) * alpha;
      const curY = currentHit.y + (nextHit.y - currentHit.y) * alpha;

      // Depth: plunge down to -0.055 on strike, hover around -0.01 otherwise
      const curZ = isStriking ? -0.055 : -0.01 + Math.sin(alpha * Math.PI) * 0.005;

      const syntheticHand: NormalizedHand = {
        id: 99,
        handedness: 'Right',
        confidence: 0.98,
        landmarks: Array.from({ length: 21 }, () => ({ x: curX, y: curY, z: curZ })),
        indexFingertip: { x: curX, y: curY, z: curZ },
        pinchDistance: 0.15,
        palmCenter: { x: curX, y: curY + 0.1, z: curZ },
        palmScale: 0.2,
        timestampMs: now
      };

      // Feed into production runtime!
      this.runtime.processHands([syntheticHand]);
      this.onUpdateCursor({ x: curX, y: curY, z: curZ }, 0.15, isStriking);

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  public get active(): boolean {
    return this.isRunning;
  }
}

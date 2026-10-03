import { Point3D, NormalizedHand } from '@beatwave/protocol';
import { GestureRuntime } from '@beatwave/gesture-runtime';

export interface DemoHit {
  readonly t: number;
  readonly pad: number;
}

export class SyntheticDemoPlayer {
  private isRunning: boolean = false;
  private animId: number | null = null;
  private startTime: number = 0;
  private activeKitId: string = 'flashing_lights';

  // Flashing Lights vocal phrases synchronized to 90 BPM (10.667s loop = 16 beats)
  private readonly flashingLightsPattern: DemoHit[] = [
    { t: 0, pad: 0 },     // "Flashing..."
    { t: 900, pad: 1 },   // "...Lights"
    { t: 1800, pad: 2 },  // "She don't believe in shooting stars"
    { t: 4100, pad: 3 },  // "Inside our lives, until daylight"
    { t: 6700, pad: 4 },  // "Flashing lights, flashing lights"
    { t: 9200, pad: 15 }  // "Until daylight!"
  ];

  // POWER vocal phrases synchronized to 154 BPM (6.234s loop = 16 beats)
  private readonly powerPattern: DemoHit[] = [
    { t: 0, pad: 0 },     // "No one man should have all that POWER"
    { t: 2300, pad: 1 },  // "The clock's ticking, I just count the hours"
    { t: 4500, pad: 5 },  // "21st Century Schizoid Man!"
    { t: 5400, pad: 6 },  // "HEY!"
    { t: 5800, pad: 7 }   // "HAH!"
  ];

  // Runaway vocal phrases synchronized to 85 BPM (11.294s loop = 16 beats)
  private readonly runawayPattern: DemoHit[] = [
    { t: 0, pad: 0 },     // "Look at ya, look at ya!"
    { t: 1900, pad: 1 },  // "Ladies and gentlemen..."
    { t: 3600, pad: 2 },  // "And I always find, yeah I always find something wrong"
    { t: 7600, pad: 6 },  // "Let's have a toast for the douchebags"
    { t: 9600, pad: 13 }  // "Run away as fast as you can!"
  ];

  // 808s Heartbreak taiko & autotune choir
  private readonly heartbreakPattern: DemoHit[] = [
    { t: 0, pad: 1 },
    { t: 500, pad: 4 },
    { t: 1000, pad: 9 },
    { t: 2000, pad: 1 },
    { t: 2500, pad: 4 },
    { t: 3000, pad: 10 }
  ];

  // Classic 808 rhythm
  private readonly classicPattern: DemoHit[] = [
    { t: 0, pad: 0 },
    { t: 500, pad: 1 },
    { t: 1000, pad: 4 },
    { t: 1500, pad: 12 }
  ];

  constructor(
    private readonly runtime: GestureRuntime,
    private readonly onUpdateCursor: (point: Point3D, pinch: number, striking: boolean) => void
  ) {}

  public setKit(kitId: string): void {
    this.activeKitId = kitId;
  }

  private getLoopDurationMs(): number {
    switch (this.activeKitId) {
      case 'flashing_lights':
        return 10667; // 4 bars at 90 BPM
      case 'power':
        return 6234;  // 4 bars at 154 BPM
      case 'runaway':
        return 11294; // 4 bars at 85 BPM
      default:
        return 4000;
    }
  }

  private getPattern(): DemoHit[] {
    switch (this.activeKitId) {
      case 'power':
        return this.powerPattern;
      case 'runaway':
        return this.runawayPattern;
      case '808s_heartbreak':
        return this.heartbreakPattern;
      case 'classic_808':
        return this.classicPattern;
      case 'flashing_lights':
      default:
        return this.flashingLightsPattern;
    }
  }

  private padToCoord(padIndex: number): { x: number; y: number } {
    const col = padIndex % 4;
    const row = Math.floor(padIndex / 4);
    return {
      x: col * 0.22 + 0.15,
      y: row * 0.22 + 0.15
    };
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = performance.now();

    const loop = (now: DOMHighResTimeStamp) => {
      if (!this.isRunning) return;

      const loopDurationMs = this.getLoopDurationMs();
      const pattern = this.getPattern();
      const elapsed = (now - this.startTime) % loopDurationMs;

      let currentHit = pattern[0];
      let nextHit = pattern[1] || pattern[0];
      for (let i = 0; i < pattern.length; i++) {
        if (elapsed >= pattern[i].t) {
          currentHit = pattern[i];
          nextHit = pattern[(i + 1) % pattern.length];
        }
      }

      const timeSinceHit = elapsed - currentHit.t;
      const isStriking = timeSinceHit >= 0 && timeSinceHit <= 80;

      const hitDuration = (nextHit.t > currentHit.t ? nextHit.t : loopDurationMs) - currentHit.t;
      const alpha = Math.min(1.0, Math.max(0.0, timeSinceHit / Math.max(1, hitDuration)));

      const curPos = this.padToCoord(currentHit.pad);
      const nextPos = this.padToCoord(nextHit.pad);

      const curX = curPos.x + (nextPos.x - curPos.x) * alpha;
      const curY = curPos.y + (nextPos.y - curPos.y) * alpha;

      // Depth strike kinematics: plunge down to -0.055 on strike, hover around -0.01 otherwise
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
}

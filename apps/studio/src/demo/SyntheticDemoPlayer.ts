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
  private readonly loopDurationMs: number = 4000;
  private activeKitId: string = 'flashing_lights';

  // Flashing Lights signature hook & electro beat choreography
  private readonly flashingLightsPattern: DemoHit[] = [
    { t: 0, pad: 0 },    // Kick + F#5 String
    { t: 250, pad: 5 },  // F#5 Violin Staccato
    { t: 500, pad: 1 },  // Gated Snare
    { t: 750, pad: 6 },  // E5 Violin Staccato
    { t: 1000, pad: 0 }, // Kick
    { t: 1250, pad: 7 }, // C#5 Violin Staccato
    { t: 1500, pad: 4 }, // Gated Clap
    { t: 1750, pad: 8 }, // B4 Violin Staccato
    { t: 2000, pad: 9 }, // Strings Hook Sweep Arp
    { t: 2250, pad: 11 },// French Electro Bass Pluck
    { t: 2500, pad: 1 }, // Gated Snare
    { t: 2750, pad: 10 },// Analog Brass Chord
    { t: 3000, pad: 13 },// Vocal "Flashing"
    { t: 3250, pad: 14 },// Vocal "Lights"
    { t: 3500, pad: 12 },// Crystal Glockenspiel
    { t: 3750, pad: 15 } // Sub Bass Drop
  ];

  // POWER tribal stomp, stadium clap & chant choreography
  private readonly powerPattern: DemoHit[] = [
    { t: 0, pad: 0 },    // Schizoid Stomp Kick
    { t: 250, pad: 0 },  // Double Stomp
    { t: 500, pad: 2 },  // Stadium Clap "HAAH"
    { t: 750, pad: 6 },  // Chant "HEY!"
    { t: 1000, pad: 0 }, // Stomp Kick
    { t: 1250, pad: 4 }, // Low Tribal Floor Tom
    { t: 1500, pad: 2 }, // Stadium Clap "HAAH"
    { t: 1750, pad: 7 }, // Chant "HAH!"
    { t: 2000, pad: 10 },// Distorted Brass Fanfare Bb
    { t: 2250, pad: 12 },// Fuzz Bass Guitar
    { t: 2500, pad: 2 }, // Stadium Clap "HAAH"
    { t: 2750, pad: 8 }, // Vocoder "21st Century"
    { t: 3000, pad: 0 }, // Stomp Kick
    { t: 3250, pad: 9 }, // Overdrive "Schizoid Man"
    { t: 3500, pad: 2 }, // Stadium Clap "HAAH"
    { t: 3750, pad: 14 } // Industrial Anvil Clang
  ];

  // Runaway high E piano note & Rick James vocal chop choreography
  private readonly runawayPattern: DemoHit[] = [
    { t: 0, pad: 0 },    // High E Piano Note (ping)
    { t: 500, pad: 0 },  // High E Piano Note (ping)
    { t: 1000, pad: 0 }, // High E Piano Note (ping)
    { t: 1500, pad: 0 }, // High E Piano Note (ping)
    { t: 2000, pad: 1 }, // Distorted 808 Sub Boom Drop
    { t: 2250, pad: 3 }, // Distorted Rimshot
    { t: 2500, pad: 2 }, // Crisp Hip-Hop Snare
    { t: 2750, pad: 7 }, // Vocal "Look At Ya!"
    { t: 3000, pad: 4 }, // Piano Eb6
    { t: 3250, pad: 5 }, // Piano C#6
    { t: 3500, pad: 2 }, // Snare + "Ladies & Gentlemen"
    { t: 3750, pad: 9 }  // Distorted Vocoder Solo Lead
  ];

  // 808s Heartbreak Love Lockdown taiko & autotune choir
  private readonly heartbreakPattern: DemoHit[] = [
    { t: 0, pad: 1 },    // Taiko Low Heartbeat
    { t: 250, pad: 2 },  // Taiko High Heartbeat
    { t: 500, pad: 4 },  // Hollow 808 Clap
    { t: 750, pad: 5 },  // 808 Cowbell
    { t: 1000, pad: 0 }, // 808 Kick
    { t: 1250, pad: 9 }, // Auto-tune Choir C#4
    { t: 1500, pad: 4 }, // 808 Clap
    { t: 1750, pad: 10 },// Auto-tune Choir E4
    { t: 2000, pad: 1 }, // Taiko Low
    { t: 2250, pad: 12 },// Heartless Synth Pluck
    { t: 2500, pad: 4 }, // 808 Clap
    { t: 2750, pad: 11 },// Auto-tune Choir G#4
    { t: 3000, pad: 0 }, // 808 Kick
    { t: 3250, pad: 6 }, // 808 Conga
    { t: 3500, pad: 4 }, // 808 Clap
    { t: 3750, pad: 5 }  // 808 Cowbell
  ];

  // Classic 808 rhythm
  private readonly classicPattern: DemoHit[] = [
    { t: 0, pad: 0 },
    { t: 250, pad: 2 },
    { t: 500, pad: 1 },
    { t: 750, pad: 2 },
    { t: 1000, pad: 0 },
    { t: 1250, pad: 2 },
    { t: 1500, pad: 4 },
    { t: 1750, pad: 2 },
    { t: 2000, pad: 12 },
    { t: 2250, pad: 2 },
    { t: 2500, pad: 1 },
    { t: 2750, pad: 2 },
    { t: 3000, pad: 0 },
    { t: 3250, pad: 3 },
    { t: 3500, pad: 13 },
    { t: 3750, pad: 2 }
  ];

  constructor(
    private readonly runtime: GestureRuntime,
    private readonly onUpdateCursor: (point: Point3D, pinch: number, striking: boolean) => void
  ) {}

  public setKit(kitId: string): void {
    this.activeKitId = kitId;
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

      const pattern = this.getPattern();
      const elapsed = (now - this.startTime) % this.loopDurationMs;

      let currentHit = pattern[0];
      let nextHit = pattern[1];
      for (let i = 0; i < pattern.length; i++) {
        if (elapsed >= pattern[i].t) {
          currentHit = pattern[i];
          nextHit = pattern[(i + 1) % pattern.length];
        }
      }

      const timeSinceHit = elapsed - currentHit.t;
      const isStriking = timeSinceHit >= 0 && timeSinceHit <= 60;

      const hitDuration = (nextHit.t > currentHit.t ? nextHit.t : this.loopDurationMs) - currentHit.t;
      const alpha = Math.min(1.0, Math.max(0.0, timeSinceHit / hitDuration));

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

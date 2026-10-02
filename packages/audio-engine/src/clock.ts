/**
 * AudioClock manages high-resolution timing, converting between
 * AudioContext.currentTime (hardware audio clock) and performance.now() (system time),
 * and computing musical bar, beat, and subdivision positions.
 */

export class AudioClock {
  private baseContextTime: number = 0;
  private basePerformanceTime: number = 0;

  constructor(private readonly ctx: AudioContext) {
    this.sync();
  }

  public sync(): void {
    this.baseContextTime = this.ctx.currentTime;
    this.basePerformanceTime = performance.now();
  }

  public get audioTime(): number {
    return this.ctx.currentTime;
  }

  public performanceToAudioTime(perfTimeMs: number): number {
    const elapsedSec = (perfTimeMs - this.basePerformanceTime) / 1000;
    return this.baseContextTime + elapsedSec;
  }

  public audioToPerformanceTime(audioTimeSec: number): number {
    const elapsedSec = audioTimeSec - this.baseContextTime;
    return this.basePerformanceTime + elapsedSec * 1000;
  }

  /**
   * Returns current musical position at given bpm.
   */
  public getMusicalPosition(bpm: number, startTimeSec: number = 0): {
    bar: number;
    beat: number;
    subdivision: number;
    elapsedSeconds: number;
  } {
    const elapsed = Math.max(0, this.ctx.currentTime - startTimeSec);
    const beatsPerSec = bpm / 60;
    const totalBeats = elapsed * beatsPerSec;
    const bar = Math.floor(totalBeats / 4) + 1;
    const beat = Math.floor(totalBeats % 4) + 1;
    const subdivision = Math.floor((totalBeats * 4) % 16) + 1;
    return { bar, beat, subdivision, elapsedSeconds: elapsed };
  }

  /**
   * Device output latency estimation if available in browser
   */
  public get estimatedOutputLatencySec(): number {
    const baseLatency = (this.ctx as any).baseLatency || 0.005;
    const outputLatency = (this.ctx as any).outputLatency || 0.01;
    return baseLatency + outputLatency;
  }
}

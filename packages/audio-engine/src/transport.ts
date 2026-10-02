import { AudioClock } from './clock.js';

export type TransportState = 'stopped' | 'playing' | 'paused';

export class Transport {
  private _state: TransportState = 'stopped';
  private _startTimeSec: number = 0;
  private _pauseTimeSec: number = 0;
  private _bpm: number = 120;
  private timerId: number | null = null;
  private tickListeners: Set<(position: { bar: number; beat: number; subdivision: number }) => void> =
    new Set();

  constructor(private readonly clock: AudioClock) {}

  public get state(): TransportState {
    return this._state;
  }

  public get bpm(): number {
    return this._bpm;
  }

  public set bpm(value: number) {
    this._bpm = Math.max(30, Math.min(300, value));
  }

  public get startTimeSec(): number {
    return this._startTimeSec;
  }

  public play(): void {
    if (this._state === 'playing') return;

    if (this._state === 'paused') {
      const pausedDuration = this.clock.audioTime - this._pauseTimeSec;
      this._startTimeSec += pausedDuration;
    } else {
      this._startTimeSec = this.clock.audioTime;
    }

    this._state = 'playing';
    this.startClockLoop();
  }

  public pause(): void {
    if (this._state !== 'playing') return;
    this._state = 'paused';
    this._pauseTimeSec = this.clock.audioTime;
    this.stopClockLoop();
  }

  public stop(): void {
    this._state = 'stopped';
    this._startTimeSec = 0;
    this._pauseTimeSec = 0;
    this.stopClockLoop();
  }

  public onTick(
    callback: (position: { bar: number; beat: number; subdivision: number }) => void
  ): () => void {
    this.tickListeners.add(callback);
    return () => this.tickListeners.delete(callback);
  }

  private startClockLoop(): void {
    if (this.timerId !== null) return;

    const intervalMs = 25; // 40Hz scheduler update
    this.timerId = (setInterval as any)(() => {
      if (this._state !== 'playing') return;
      const pos = this.clock.getMusicalPosition(this._bpm, this._startTimeSec);
      for (const listener of this.tickListeners) {
        listener(pos);
      }
    }, intervalMs);
  }

  private stopClockLoop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public dispose(): void {
    this.stop();
    this.tickListeners.clear();
  }
}

/**
 * BackingTrackPlayer
 * Manages continuous, seamless looping backing tracks (instrumentals) for signature songs.
 * Connects directly to the master audio context with independent gain control.
 */

export class BackingTrackPlayer {
  private sourceNode: AudioBufferSourceNode | null = null;
  private readonly gainNode: GainNode;
  private buffer: AudioBuffer | null = null;
  private isPlaying: boolean = false;
  private currentUrl: string | null = null;

  constructor(private readonly ctx: AudioContext) {
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0.85;
    this.gainNode.connect(this.ctx.destination);
  }

  public async loadTrack(url: string): Promise<boolean> {
    if (this.currentUrl === url && this.buffer) return true;
    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentUrl = url;

    try {
      if (typeof fetch === 'undefined') return false;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
      if (wasPlaying) {
        this.play();
      }
      return true;
    } catch (err) {
      console.warn(`[BackingTrackPlayer] Failed to load backing track from "${url}":`, err);
      this.buffer = null;
      return false;
    }
  }

  public play(): void {
    if (this.isPlaying || !this.buffer) return;
    try {
      this.sourceNode = this.ctx.createBufferSource();
      this.sourceNode.buffer = this.buffer;
      this.sourceNode.loop = true;
      this.sourceNode.connect(this.gainNode);
      this.sourceNode.start(0);
      this.isPlaying = true;
    } catch (err) {
      console.warn('[BackingTrackPlayer] play() error:', err);
    }
  }

  public stop(): void {
    if (!this.isPlaying || !this.sourceNode) return;
    try {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
    } catch {
      // ignore
    }
    this.sourceNode = null;
    this.isPlaying = false;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public setVolume(val: number): void {
    const clamped = Math.max(0, Math.min(1.5, val));
    this.gainNode.gain.setValueAtTime(clamped, this.ctx.currentTime);
  }

  public get playing(): boolean {
    return this.isPlaying;
  }

  public get loaded(): boolean {
    return this.buffer !== null;
  }

  public get url(): string | null {
    return this.currentUrl;
  }
}

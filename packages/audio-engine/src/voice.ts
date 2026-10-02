export interface VoiceTriggerOptions {
  readonly sampleId: string;
  readonly gain: number; // 0..2
  readonly pan: number; // -1..1
  readonly velocity: number; // 0..1
  readonly chokeGroup?: number;
  readonly startOffsetSec?: number;
  readonly endOffsetSec?: number;
  readonly loop?: boolean;
  readonly scheduledAudioTimeSec: number;
  readonly padIndex: number;
}

export class ActiveVoice {
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private stopped: boolean = false;

  constructor(
    public readonly options: VoiceTriggerOptions,
    private readonly ctx: AudioContext,
    destinationNode: AudioNode,
    buffer: AudioBuffer
  ) {
    this.sourceNode = this.ctx.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.loop = !!options.loop;

    this.gainNode = this.ctx.createGain();
    const finalGain = Math.max(0.0001, options.gain * Math.min(1.0, Math.max(0.1, options.velocity)));
    this.gainNode.gain.setValueAtTime(finalGain, options.scheduledAudioTimeSec);

    // Stereo panning where supported
    if (typeof this.ctx.createStereoPanner === 'function') {
      this.pannerNode = this.ctx.createStereoPanner();
      this.pannerNode.pan.setValueAtTime(
        Math.max(-1, Math.min(1, options.pan)),
        options.scheduledAudioTimeSec
      );
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.pannerNode);
      this.pannerNode.connect(destinationNode);
    } else {
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(destinationNode);
    }

    const startOffset = Math.max(0, options.startOffsetSec || 0);
    const duration = options.endOffsetSec && options.endOffsetSec > startOffset
      ? options.endOffsetSec - startOffset
      : undefined;

    if (duration !== undefined) {
      this.sourceNode.start(options.scheduledAudioTimeSec, startOffset, duration);
    } else {
      this.sourceNode.start(options.scheduledAudioTimeSec, startOffset);
    }

    this.sourceNode.onended = () => {
      this.stopped = true;
      this.dispose();
    };
  }

  public stop(fadeSec: number = 0.015): void {
    if (this.stopped || !this.gainNode || !this.sourceNode) return;
    this.stopped = true;

    const now = this.ctx.currentTime;
    try {
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
      this.sourceNode.stop(now + fadeSec);
    } catch {
      // In case source node already finished
    }
  }

  public get isPlaying(): boolean {
    return !this.stopped;
  }

  public dispose(): void {
    try {
      this.sourceNode?.disconnect();
      this.gainNode?.disconnect();
      this.pannerNode?.disconnect();
    } catch {
      // ignore disconnect errors on cleanup
    }
    this.sourceNode = null;
    this.gainNode = null;
    this.pannerNode = null;
  }
}

export class VoicePool {
  private readonly activeVoices: Set<ActiveVoice> = new Set();

  constructor(
    private readonly ctx: AudioContext,
    private readonly maxPolyphony: number = 32
  ) {}

  public spawnVoice(
    options: VoiceTriggerOptions,
    buffer: AudioBuffer,
    destinationNode: AudioNode
  ): ActiveVoice {
    // 1. Handle Choke Groups (e.g. Open Hat choked by Closed Hat)
    if (options.chokeGroup !== undefined) {
      for (const voice of this.activeVoices) {
        if (voice.options.chokeGroup === options.chokeGroup) {
          voice.stop(0.01);
          this.activeVoices.delete(voice);
        }
      }
    }

    // 2. Polyphony limit: steal oldest voice if exceeded
    if (this.activeVoices.size >= this.maxPolyphony) {
      const oldest = this.activeVoices.values().next().value;
      if (oldest) {
        oldest.stop(0.005);
        this.activeVoices.delete(oldest);
      }
    }

    const voice = new ActiveVoice(options, this.ctx, destinationNode, buffer);
    this.activeVoices.add(voice);
    return voice;
  }

  public stopPadVoices(padIndex: number): void {
    for (const voice of this.activeVoices) {
      if (voice.options.padIndex === padIndex) {
        voice.stop(0.015);
        this.activeVoices.delete(voice);
      }
    }
  }

  public stopAll(): void {
    for (const voice of this.activeVoices) {
      voice.stop(0.01);
    }
    this.activeVoices.clear();
  }

  public get activeCount(): number {
    return this.activeVoices.size;
  }

  public cleanFinished(): void {
    for (const voice of this.activeVoices) {
      if (!voice.isPlaying) {
        this.activeVoices.delete(voice);
      }
    }
  }
}

export class Mixer {
  private readonly masterGainNode: GainNode;
  private readonly masterLimiterNode: DynamicsCompressorNode;
  private readonly analyserNode: AnalyserNode;
  private readonly padGainNodes: Map<number, GainNode> = new Map();

  constructor(private readonly ctx: AudioContext) {
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.setValueAtTime(1.0, 0);

    // Fast-acting master limiter to prevent digital clipping
    this.masterLimiterNode = this.ctx.createDynamicsCompressor();
    this.masterLimiterNode.threshold.setValueAtTime(-1.0, 0);
    this.masterLimiterNode.knee.setValueAtTime(0.0, 0);
    this.masterLimiterNode.ratio.setValueAtTime(20.0, 0);
    this.masterLimiterNode.attack.setValueAtTime(0.002, 0);
    this.masterLimiterNode.release.setValueAtTime(0.05, 0);

    // Master visualizer analyser
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;

    this.masterGainNode.connect(this.masterLimiterNode);
    this.masterLimiterNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
  }

  public getPadDestination(padIndex: number): AudioNode {
    let node = this.padGainNodes.get(padIndex);
    if (!node) {
      node = this.ctx.createGain();
      node.gain.setValueAtTime(1.0, 0);
      node.connect(this.masterGainNode);
      this.padGainNodes.set(padIndex, node);
    }
    return node;
  }

  public setPadGain(padIndex: number, gain: number): void {
    const node = this.padGainNodes.get(padIndex);
    if (node) {
      node.gain.setValueAtTime(Math.max(0, Math.min(2, gain)), this.ctx.currentTime);
    }
  }

  public setMasterGain(gain: number): void {
    this.masterGainNode.gain.setValueAtTime(
      Math.max(0, Math.min(2, gain)),
      this.ctx.currentTime
    );
  }

  public getMasterGain(): number {
    return this.masterGainNode.gain.value;
  }

  public getWaveformData(outputArray: Float32Array): void {
    this.analyserNode.getFloatTimeDomainData(outputArray as any);
  }

  public getFrequencyData(outputArray: Uint8Array): void {
    this.analyserNode.getByteFrequencyData(outputArray as any);
  }
}

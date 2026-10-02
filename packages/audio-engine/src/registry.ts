import { PROCEDURAL_KIT_METADATA, generateProceduralSample } from './procedural-kit.js';

export class SampleRegistry {
  private readonly samples: Map<string, AudioBuffer> = new Map();
  private readonly sampleMetadata: Map<string, { name: string; duration: number; channels: number }> =
    new Map();

  constructor(private readonly ctx: AudioContext) {}

  public async preloadProceduralKit(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    const total = PROCEDURAL_KIT_METADATA.length;
    let count = 0;

    for (const meta of PROCEDURAL_KIT_METADATA) {
      if (!this.samples.has(meta.id)) {
        const buffer = await generateProceduralSample(meta.id, this.ctx.sampleRate);
        this.registerBuffer(meta.id, meta.name, buffer);
      }
      count++;
      onProgress?.(count, total);
    }
  }

  public registerBuffer(id: string, name: string, buffer: AudioBuffer): void {
    this.samples.set(id, buffer);
    this.sampleMetadata.set(id, {
      name,
      duration: buffer.duration,
      channels: buffer.numberOfChannels
    });
  }

  public async loadFromBlob(id: string, name: string, blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.registerBuffer(id, name, audioBuffer);
    return audioBuffer;
  }

  public getBuffer(id: string): AudioBuffer | undefined {
    return this.samples.get(id);
  }

  public getMetadata(id: string): { name: string; duration: number; channels: number } | undefined {
    return this.sampleMetadata.get(id);
  }

  public has(id: string): boolean {
    return this.samples.has(id);
  }

  public remove(id: string): void {
    this.samples.delete(id);
    this.sampleMetadata.delete(id);
  }

  public clear(): void {
    this.samples.clear();
    this.sampleMetadata.clear();
  }

  public listIds(): string[] {
    return Array.from(this.samples.keys());
  }
}

import {
  ALL_KITS,
  PROCEDURAL_KIT_METADATA,
  generateProceduralSample,
  KanyeKitDefinition
} from './procedural-kit.js';

export class SampleRegistry {
  private readonly samples: Map<string, AudioBuffer> = new Map();
  private readonly sampleMetadata: Map<string, { name: string; duration: number; channels: number }> =
    new Map();

  constructor(private readonly ctx: AudioContext) {}

  /** Preloads all procedural samples across all kits */
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

  /** Preloads a specific Kanye kit into the registry in parallel */
  public async preloadKit(kitId: string, onProgress?: (loaded: number, total: number) => void): Promise<KanyeKitDefinition | undefined> {
    const kit = ALL_KITS.find((k) => k.id === kitId) || ALL_KITS[0];
    const total = kit.samples.length;
    let count = 0;

    await Promise.all(
      kit.samples.map(async (sample) => {
        if (!this.samples.has(sample.id)) {
          let buffer: AudioBuffer | null = null;
          if (sample.audioUrl && typeof fetch !== 'undefined') {
            try {
              const res = await fetch(sample.audioUrl);
              if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                buffer = await this.ctx.decodeAudioData(arrayBuffer);
              }
            } catch {
              // fallback to procedural synthesis below
            }
          }
          if (!buffer) {
            buffer = await generateProceduralSample(sample.id, this.ctx.sampleRate);
          }
          this.registerBuffer(sample.id, sample.name, buffer);
        }
        count++;
        onProgress?.(count, total);
      })
    );

    return kit;
  }

  /** Preloads all Kanye kits in parallel for zero kit-switching latency */
  public async preloadAllKits(): Promise<void> {
    await Promise.all(ALL_KITS.map((k) => this.preloadKit(k.id)));
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

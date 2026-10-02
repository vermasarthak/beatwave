export interface LatencySample {
  readonly requestedAtPerfMs: number;
  readonly scheduledAudioTimeSec: number;
  readonly actualAudioTimeSec: number;
  readonly deltaMs: number;
}

export class AudioLatencyProfiler {
  private readonly samples: LatencySample[] = [];
  private readonly maxSamples: number = 200;

  public recordSchedule(
    requestedAtPerfMs: number,
    scheduledAudioTimeSec: number,
    currentAudioTimeSec: number
  ): void {
    const deltaMs = (scheduledAudioTimeSec - currentAudioTimeSec) * 1000;
    this.samples.push({
      requestedAtPerfMs,
      scheduledAudioTimeSec,
      actualAudioTimeSec: currentAudioTimeSec,
      deltaMs
    });

    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  public getStats(): {
    meanJitterMs: number;
    p50Ms: number;
    p95Ms: number;
    count: number;
  } {
    if (this.samples.length === 0) {
      return { meanJitterMs: 0, p50Ms: 0, p95Ms: 0, count: 0 };
    }

    const deltas = this.samples.map((s) => Math.abs(s.deltaMs)).sort((a, b) => a - b);
    const sum = deltas.reduce((a, b) => a + b, 0);
    const mean = sum / deltas.length;
    const p50 = deltas[Math.floor(deltas.length * 0.5)];
    const p95 = deltas[Math.floor(deltas.length * 0.95)];

    return {
      meanJitterMs: Number(mean.toFixed(2)),
      p50Ms: Number(p50.toFixed(2)),
      p95Ms: Number(p95.toFixed(2)),
      count: deltas.length
    };
  }
}

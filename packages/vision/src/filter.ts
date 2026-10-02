/**
 * 1€ (One Euro) Filter for low-latency, jitter-free hand landmark filtering.
 * Casiez, G., Roussel, N. and Vogel, D. (2012).
 * "1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Human-Computer Interaction"
 */

class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  public filter(val: number, alpha: number): number {
    if (this.y === null) {
      this.s = val;
      this.y = val;
      return val;
    }
    this.s = alpha * val + (1 - alpha) * this.s!;
    this.y = this.s;
    return this.y;
  }

  public reset(): void {
    this.y = null;
    this.s = null;
  }
}

export interface OneEuroFilterConfig {
  /** Minimum cutoff frequency (Hz) at near-zero speed to eliminate jitter */
  minCutoff: number;
  /** Speed coefficient beta: increases cutoff dynamically as velocity rises */
  beta: number;
  /** Cutoff frequency for derivative velocity filter */
  dCutoff: number;
}

export class OneEuroFilter {
  private xFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private lastTime: number | null = null;

  constructor(
    private minCutoff: number = 1.0,
    private beta: number = 0.007,
    private dCutoff: number = 1.0
  ) {}

  private alpha(rate: number, cutoff: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    const te = 1.0 / rate;
    return 1.0 / (1.0 + tau / te);
  }

  public filter(val: number, timestampMs: number): number {
    if (this.lastTime === null) {
      this.lastTime = timestampMs;
      return this.xFilter.filter(val, 1.0);
    }

    const dt = Math.max(0.001, (timestampMs - this.lastTime) / 1000);
    this.lastTime = timestampMs;
    const rate = 1.0 / dt;

    // Estimate derivative
    const prev = this.xFilter['y'] ?? val;
    const dx = (val - prev) / dt;
    const edx = this.dxFilter.filter(dx, this.alpha(rate, this.dCutoff));

    // Dynamic cutoff frequency
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    return this.xFilter.filter(val, this.alpha(rate, cutoff));
  }

  public reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }
}

export class Point3DOneEuroFilter {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;
  private filterZ: OneEuroFilter;

  constructor(minCutoff: number = 1.2, beta: number = 0.005, dCutoff: number = 1.0) {
    this.filterX = new OneEuroFilter(minCutoff, beta, dCutoff);
    this.filterY = new OneEuroFilter(minCutoff, beta, dCutoff);
    this.filterZ = new OneEuroFilter(minCutoff, beta, dCutoff);
  }

  public filter(
    p: { x: number; y: number; z: number },
    timestampMs: number
  ): { x: number; y: number; z: number } {
    return {
      x: this.filterX.filter(p.x, timestampMs),
      y: this.filterY.filter(p.y, timestampMs),
      z: this.filterZ.filter(p.z, timestampMs)
    };
  }

  public reset(): void {
    this.filterX.reset();
    this.filterY.reset();
    this.filterZ.reset();
  }
}

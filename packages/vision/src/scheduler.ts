export interface FrameSchedulerStats {
  cameraFps: number;
  inferenceFps: number;
  inferenceLatencyMs: number;
  droppedFrames: number;
  totalFrames: number;
}

export class CameraFrameScheduler {
  private isInferenceRunning: boolean = false;
  private pendingVideoFrame: HTMLVideoElement | null = null;
  private animHandle: number | null = null;
  private isRunning: boolean = false;

  private totalFrames: number = 0;
  private droppedFrames: number = 0;
  private inferenceCount: number = 0;
  private lastInferenceLatencyMs: number = 0;

  private lastCameraFpsTime: number = 0;
  private cameraFrameCount: number = 0;
  private measuredCameraFps: number = 0;

  private lastInferenceFpsTime: number = 0;
  private measuredInferenceFps: number = 0;

  constructor(
    private readonly onProcessFrame: (video: HTMLVideoElement, timestampMs: number) => Promise<void>
  ) {}

  public start(video: HTMLVideoElement): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastCameraFpsTime = performance.now();
    this.lastInferenceFpsTime = performance.now();

    const loop = (now: DOMHighResTimeStamp) => {
      if (!this.isRunning) return;

      this.totalFrames++;
      this.cameraFrameCount++;

      // Compute Camera FPS
      const cameraElapsed = now - this.lastCameraFpsTime;
      if (cameraElapsed >= 1000) {
        this.measuredCameraFps = Number(((this.cameraFrameCount * 1000) / cameraElapsed).toFixed(1));
        this.cameraFrameCount = 0;
        this.lastCameraFpsTime = now;
      }

      // Latest-frame-only policy: If inference is already in flight, drop this frame!
      if (this.isInferenceRunning) {
        this.droppedFrames++;
      } else {
        this.isInferenceRunning = true;
        const inferenceStart = performance.now();

        this.onProcessFrame(video, now)
          .catch((err) => {
            console.error('[CameraFrameScheduler] Inference error:', err);
          })
          .finally(() => {
            const inferenceElapsed = performance.now() - inferenceStart;
            this.lastInferenceLatencyMs = Number(inferenceElapsed.toFixed(2));
            this.isInferenceRunning = false;
            this.inferenceCount++;

            const infElapsedSec = (performance.now() - this.lastInferenceFpsTime) / 1000;
            if (infElapsedSec >= 1.0) {
              this.measuredInferenceFps = Number((this.inferenceCount / infElapsedSec).toFixed(1));
              this.inferenceCount = 0;
              this.lastInferenceFpsTime = performance.now();
            }
          });
      }

      // Schedule next frame with requestVideoFrameCallback if available, fallback to requestAnimationFrame
      if ('requestVideoFrameCallback' in video) {
        (video as any).requestVideoFrameCallback(loop);
      } else {
        this.animHandle = requestAnimationFrame(loop);
      }
    };

    if ('requestVideoFrameCallback' in video) {
      (video as any).requestVideoFrameCallback(loop);
    } else {
      this.animHandle = requestAnimationFrame(loop);
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animHandle !== null) {
      cancelAnimationFrame(this.animHandle);
      this.animHandle = null;
    }
    this.isInferenceRunning = false;
  }

  public getStats(): FrameSchedulerStats {
    return {
      cameraFps: this.measuredCameraFps,
      inferenceFps: this.measuredInferenceFps,
      inferenceLatencyMs: this.lastInferenceLatencyMs,
      droppedFrames: this.droppedFrames,
      totalFrames: this.totalFrames
    };
  }
}

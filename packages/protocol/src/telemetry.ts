export interface TelemetryMetrics {
  readonly cameraFps: number;
  readonly inferenceFps: number;
  readonly inferenceLatencyMs: number;
  readonly droppedFrames: number;
  readonly handConfidence: number;
  readonly strikeConfidence: number;
  readonly renderFps: number;
  readonly audioScheduleJitterMs: number;
  readonly activeVoices: number;
  readonly audioContextState: AudioContextState | string;
  readonly lastStrikePadIndex?: number;
  readonly lastStrikeVelocity?: number;
  readonly strikeNetAdvisoryMs?: number;
}

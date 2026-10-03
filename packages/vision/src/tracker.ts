import { RawHandDetection, Landmark21, Handedness } from '@beatwave/protocol';

export interface IHandTracker {
  initialize(): Promise<void>;
  detectForVideo(video: HTMLVideoElement, timestampMs: number): Promise<RawHandDetection[]>;
  close(): void;
}

export class MediaPipeHandTracker implements IHandTracker {
  private handLandmarker: any = null;
  private isInitialized: boolean = false;

  constructor(
    private readonly wasmLoaderPath?: string,
    private readonly modelAssetPath?: string
  ) {}

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamic import to allow graceful fallback in non-browser or worker contexts
      const tasksVision = await import('@mediapipe/tasks-vision');
      const FilesetResolver = tasksVision.FilesetResolver;
      const HandLandmarker = tasksVision.HandLandmarker;

      const wasmFileset = await FilesetResolver.forVisionTasks(
        this.wasmLoaderPath || '/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath:
            this.modelAssetPath || '/models/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
    } catch (err) {
      console.warn('[MediaPipeHandTracker] GPU/Local init fallback to CPU or remote CDN:', err);
      // Attempt CPU delegate fallback with local/remote
      const tasksVision = await import('@mediapipe/tasks-vision');
      const FilesetResolver = tasksVision.FilesetResolver;
      const HandLandmarker = tasksVision.HandLandmarker;
      const wasmFileset = await FilesetResolver.forVisionTasks(
        this.wasmLoaderPath || '/wasm'
      );
      this.handLandmarker = await HandLandmarker.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath:
            this.modelAssetPath || '/models/hand_landmarker.task',
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        numHands: 2
      });
      this.isInitialized = true;
    }
  }

  public async detectForVideo(
    video: HTMLVideoElement,
    timestampMs: number
  ): Promise<RawHandDetection[]> {
    if (!this.handLandmarker) return [];

    const result = this.handLandmarker.detectForVideo(video, timestampMs);
    const detections: RawHandDetection[] = [];

    if (result.landmarks && result.landmarks.length > 0) {
      for (let i = 0; i < result.landmarks.length; i++) {
        const lms: Landmark21[] = result.landmarks[i].map((pt: any) => ({
          x: pt.x,
          y: pt.y,
          z: pt.z,
          visibility: pt.visibility
        }));

        let handedness: Handedness = 'Right';
        let confidence = 0.8;
        if (result.handedness && result.handedness[i] && result.handedness[i][0]) {
          handedness = (result.handedness[i][0].categoryName as Handedness) || 'Right';
          confidence = result.handedness[i][0].score || 0.8;
        }

        detections.push({
          id: i,
          handedness,
          confidence,
          landmarks: lms,
          timestampMs
        });
      }
    }

    return detections;
  }

  public close(): void {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
    this.isInitialized = false;
  }
}

/**
 * MockHandTracker for deterministic unit tests, CI, and synthetic trajectory replays
 */
export class MockHandTracker implements IHandTracker {
  private customDetections: RawHandDetection[] = [];

  public async initialize(): Promise<void> {}

  public setDetections(detections: RawHandDetection[]): void {
    this.customDetections = detections;
  }

  public async detectForVideo(
    _video: HTMLVideoElement,
    timestampMs: number
  ): Promise<RawHandDetection[]> {
    return this.customDetections.map((d) => ({ ...d, timestampMs }));
  }

  public close(): void {
    this.customDetections = [];
  }
}

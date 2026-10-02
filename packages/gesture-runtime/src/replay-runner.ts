import { NormalizedHand, StrikeEvent, PadBank } from '@beatwave/protocol';
import { GestureRuntime } from './gesture-runtime.js';

export interface TrajectoryFrame {
  readonly timestampMs: number;
  readonly hand: NormalizedHand;
}

export interface ReplayDataset {
  readonly name: string;
  readonly description: string;
  readonly expectedTriggers: {
    readonly padIndex: number;
    readonly approximateTimestampMs: number;
    readonly method: string;
  }[];
  readonly frames: readonly TrajectoryFrame[];
}

export interface ReplayResult {
  readonly datasetName: string;
  readonly totalFrames: number;
  readonly recordedStrikes: StrikeEvent[];
  readonly matchesExpected: boolean;
  readonly falseTriggerCount: number;
  readonly missedStrikeCount: number;
}

export class ReplayRunner {
  public static runReplay(runtime: GestureRuntime, dataset: ReplayDataset): ReplayResult {
    runtime.reset();
    const recordedStrikes: StrikeEvent[] = [];

    // Capture strikes during replay
    const originalCallbacks = (runtime as any).callbacks;
    (runtime as any).callbacks = {
      ...originalCallbacks,
      onStrike: (evt: StrikeEvent) => {
        recordedStrikes.push(evt);
        originalCallbacks?.onStrike?.(evt);
      }
    };

    // Feed each frame
    for (const frame of dataset.frames) {
      runtime.processHands([frame.hand]);
    }

    // Restore callbacks
    (runtime as any).callbacks = originalCallbacks;

    // Evaluate matching
    const expected = dataset.expectedTriggers;
    let falseTriggerCount = 0;
    let matchedCount = 0;

    for (const strike of recordedStrikes) {
      const match = expected.find(
        (exp) => exp.padIndex === strike.padIndex && Math.abs(exp.approximateTimestampMs - strike.timestampMs) < 120
      );
      if (match) {
        matchedCount++;
      } else {
        falseTriggerCount++;
      }
    }

    const missedStrikeCount = expected.length - matchedCount;
    const matchesExpected = falseTriggerCount === 0 && missedStrikeCount === 0;

    return {
      datasetName: dataset.name,
      totalFrames: dataset.frames.length,
      recordedStrikes,
      matchesExpected,
      falseTriggerCount,
      missedStrikeCount
    };
  }
}

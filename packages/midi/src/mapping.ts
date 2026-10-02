import { ContinuousGestureEvent } from '@beatwave/protocol';
import { IMidiAdapter } from './adapter.js';

export interface ContinuousMidiMappingConfig {
  /** Map pinch distance (0..1) to CC controller (e.g. 74 = Filter Cutoff) */
  readonly pinchCC?: number;
  /** Map vertical hand position (0..1) to CC controller (e.g. 11 = Expression / 7 = Volume) */
  readonly verticalCC?: number;
  /** Map wrist roll angle to CC controller (e.g. 1 = Modulation Wheel) */
  readonly wristRollCC?: number;
  readonly defaultChannel: number;
}

export const DEFAULT_MIDI_MAPPING: ContinuousMidiMappingConfig = {
  pinchCC: 74, // Filter Cutoff
  verticalCC: 11, // Expression
  wristRollCC: 1, // Mod Wheel
  defaultChannel: 1
};

export class MidiGestureMapper {
  constructor(
    private readonly adapter: IMidiAdapter,
    private config: ContinuousMidiMappingConfig = DEFAULT_MIDI_MAPPING
  ) {}

  public updateConfig(config: ContinuousMidiMappingConfig): void {
    this.config = config;
  }

  public handleContinuousGesture(evt: ContinuousGestureEvent): void {
    // 1. Pinch distance -> Filter Cutoff
    if (this.config.pinchCC !== undefined) {
      // Invert so tighter pinch = higher value
      const pinchVal = Math.max(0, Math.min(127, Math.round((1.0 - evt.pinchDistance * 5) * 127)));
      this.adapter.sendCC(this.config.pinchCC, pinchVal, this.config.defaultChannel);
    }

    // 2. Vertical position -> Expression (higher hand = higher value)
    if (this.config.verticalCC !== undefined) {
      const vertVal = Math.max(0, Math.min(127, Math.round((1.0 - evt.verticalPositionNorm) * 127)));
      this.adapter.sendCC(this.config.verticalCC, vertVal, this.config.defaultChannel);
    }

    // 3. Wrist roll -> Mod Wheel
    if (this.config.wristRollCC !== undefined) {
      // Normalize angle from -PI/2..PI/2 to 0..127
      const normRoll = (evt.wristRollRad + Math.PI / 2) / Math.PI;
      const rollVal = Math.max(0, Math.min(127, Math.round(normRoll * 127)));
      this.adapter.sendCC(this.config.wristRollCC, rollVal, this.config.defaultChannel);
    }
  }
}

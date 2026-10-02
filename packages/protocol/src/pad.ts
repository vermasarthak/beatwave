import { PadAction } from './actions.js';
import { Rect2D } from './geometry.js';

export type PadBankId = 'A' | 'B' | 'C' | 'D';
export type QuantizeGrid = 'off' | '1/4' | '1/8' | '1/16';

export type PadLifecycleState =
  | 'OUTSIDE'
  | 'HOVER'
  | 'ARMED'
  | 'STRIKE'
  | 'HELD'
  | 'RELEASE'
  | 'COOLDOWN';

export interface PadConfig {
  readonly id: string;
  readonly padIndex: number; // 0..15
  readonly label: string;
  readonly color: string;
  readonly bounds: Rect2D;
  readonly action: PadAction;
  readonly chokeGroup?: number;
}

export interface PadBank {
  readonly id: PadBankId;
  readonly name: string;
  readonly pads: readonly PadConfig[]; // 16 pads
}

export interface PadRuntimeState {
  readonly padIndex: number;
  readonly state: PadLifecycleState;
  readonly lastTriggerTimestampMs: number;
  readonly compression: number; // 0..1 (for 3D visual depression spring)
  readonly hoverProximity: number; // 0..1
  readonly activeHandId?: number;
}

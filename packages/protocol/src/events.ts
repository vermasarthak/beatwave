import { PadLifecycleState } from './pad.js';
import { PadAction } from './actions.js';

export type InteractionMethod = 'AIR_TAP' | 'PINCH_TAP' | 'POINTER_FALLBACK' | 'KEYBOARD_FALLBACK';

export interface StrikeEvent {
  readonly padIndex: number;
  readonly handId: number;
  readonly timestampMs: number;
  readonly audioContextTimeSec?: number;
  readonly velocity: number; // 0..1 (derived from Z-strike velocity or pinch impulse)
  readonly method: InteractionMethod;
  readonly confidence: number; // 0..1
  readonly action: PadAction;
}

export interface PadStateChangeEvent {
  readonly padIndex: number;
  readonly handId: number;
  readonly previousState: PadLifecycleState;
  readonly newState: PadLifecycleState;
  readonly timestampMs: number;
  readonly compression: number;
}

export interface ContinuousGestureEvent {
  readonly handId: number;
  readonly timestampMs: number;
  readonly pinchDistance: number;
  readonly wristRollRad: number;
  readonly wristRollAngleRad?: number;
  readonly verticalPositionNorm: number;
}

export interface BeatwaveEventMap {
  'pad:stateChange': PadStateChangeEvent;
  'pad:strike': StrikeEvent;
  'pad:release': { padIndex: number; handId: number; timestampMs: number };
  'gesture:continuous': ContinuousGestureEvent;
}

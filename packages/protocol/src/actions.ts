import { AudioSourceCapabilities } from './capabilities.js';

/**
 * Discriminated union of Pad Actions with required capability mappings.
 */

export interface SampleTriggerAction {
  readonly type: 'SampleTrigger';
  readonly sampleId: string;
  readonly gain: number; // 0..2
  readonly pan: number; // -1..1
  readonly chokeGroup?: number;
  readonly startOffsetSec?: number;
  readonly endOffsetSec?: number;
  readonly pitchSemitones?: number;
}

export interface SampleGateAction {
  readonly type: 'SampleGate';
  readonly sampleId: string;
  readonly gain: number;
  readonly pan: number;
  readonly chokeGroup?: number;
}

export interface LoopToggleAction {
  readonly type: 'LoopToggle';
  readonly sampleId: string;
  readonly gain: number;
  readonly bpmSync: boolean;
}

export interface MidiNoteAction {
  readonly type: 'MidiNote';
  readonly note: number; // 0..127
  readonly channel: number; // 1..16
  readonly velocityOverride?: number; // if undefined, strike speed maps to velocity
}

export interface MidiCCAction {
  readonly type: 'MidiCC';
  readonly controller: number; // 0..127
  readonly channel: number;
  readonly value: number; // 0..127
}

export interface TransportPlayPauseAction {
  readonly type: 'TransportPlayPause';
}

export interface TransportNextAction {
  readonly type: 'TransportNext';
}

export interface TransportPreviousAction {
  readonly type: 'TransportPrevious';
}

export interface LocalCueAction {
  readonly type: 'LocalCue';
  readonly cuePositionSec: number;
}

export interface LocalEffectMomentaryAction {
  readonly type: 'LocalEffectMomentary';
  readonly effectType: 'lowpass_filter' | 'highpass_filter' | 'bitcrusher';
  readonly intensity: number; // 0..1
}

export type PadAction =
  | SampleTriggerAction
  | SampleGateAction
  | LoopToggleAction
  | MidiNoteAction
  | MidiCCAction
  | TransportPlayPauseAction
  | TransportNextAction
  | TransportPreviousAction
  | LocalCueAction
  | LocalEffectMomentaryAction;

export const ACTION_REQUIRED_CAPABILITY: Record<PadAction['type'], keyof AudioSourceCapabilities | null> = {
  SampleTrigger: 'decodedAudio',
  SampleGate: 'decodedAudio',
  LoopToggle: 'decodedAudio',
  MidiNote: null,
  MidiCC: null,
  TransportPlayPause: 'transport',
  TransportNext: 'transport',
  TransportPrevious: 'transport',
  LocalCue: 'transport',
  LocalEffectMomentary: 'effects'
};

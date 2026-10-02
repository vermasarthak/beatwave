/**
 * Audio source capability model.
 * Enforces operations (slicing, PCM decoding, recording, stem separation)
 * at the domain layer rather than leaving it to UI component logic.
 */

export interface AudioSourceCapabilities {
  readonly transport: boolean;
  readonly decodedAudio: boolean;
  readonly slicing: boolean;
  readonly localAnalysis: boolean;
  readonly effects: boolean;
  readonly recording: boolean;
  readonly exportAudio: boolean;
}

export type SourceType = 'local' | 'procedural' | 'spotify' | 'midi_only';

export const SOURCE_CAPABILITIES: Record<SourceType, AudioSourceCapabilities> = {
  local: {
    transport: true,
    decodedAudio: true,
    slicing: true,
    localAnalysis: true,
    effects: true,
    recording: true,
    exportAudio: true
  },
  procedural: {
    transport: true,
    decodedAudio: true,
    slicing: true,
    localAnalysis: true,
    effects: true,
    recording: true,
    exportAudio: true
  },
  spotify: {
    transport: true,
    decodedAudio: false,
    slicing: false,
    localAnalysis: false,
    effects: false,
    recording: false,
    exportAudio: false
  },
  midi_only: {
    transport: true,
    decodedAudio: false,
    slicing: false,
    localAnalysis: false,
    effects: false,
    recording: true,
    exportAudio: false
  }
};

export class IncompatibleSourceCapabilityError extends Error {
  constructor(
    public readonly sourceType: SourceType,
    public readonly requiredCapability: keyof AudioSourceCapabilities,
    public readonly actionName: string
  ) {
    super(
      `Incompatible source capability: source "${sourceType}" does not support "${requiredCapability}" required by action "${actionName}".`
    );
    this.name = 'IncompatibleSourceCapabilityError';
    Object.setPrototypeOf(this, IncompatibleSourceCapabilityError.prototype);
  }
}

export function assertSourceCapability(
  sourceType: SourceType,
  capability: keyof AudioSourceCapabilities,
  actionName: string
): void {
  const caps = SOURCE_CAPABILITIES[sourceType];
  if (!caps || !caps[capability]) {
    throw new IncompatibleSourceCapabilityError(sourceType, capability, actionName);
  }
}

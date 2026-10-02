import { z } from 'zod';

export const Rect2DSchema = z.object({
  minX: z.number(),
  maxX: z.number(),
  minY: z.number(),
  maxY: z.number()
});

export const PadActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('SampleTrigger'),
    sampleId: z.string(),
    gain: z.number(),
    pan: z.number(),
    chokeGroup: z.number().optional(),
    startOffsetSec: z.number().optional(),
    endOffsetSec: z.number().optional(),
    pitchSemitones: z.number().optional()
  }),
  z.object({
    type: z.literal('SampleGate'),
    sampleId: z.string(),
    gain: z.number(),
    pan: z.number(),
    chokeGroup: z.number().optional()
  }),
  z.object({
    type: z.literal('LoopToggle'),
    sampleId: z.string(),
    gain: z.number(),
    bpmSync: z.boolean()
  }),
  z.object({
    type: z.literal('MidiNote'),
    note: z.number().min(0).max(127),
    channel: z.number().min(1).max(16),
    velocityOverride: z.number().min(0).max(127).optional()
  }),
  z.object({
    type: z.literal('MidiCC'),
    controller: z.number().min(0).max(127),
    channel: z.number().min(1).max(16),
    value: z.number().min(0).max(127)
  }),
  z.object({ type: z.literal('TransportPlayPause') }),
  z.object({ type: z.literal('TransportNext') }),
  z.object({ type: z.literal('TransportPrevious') }),
  z.object({ type: z.literal('LocalCue'), cuePositionSec: z.number() }),
  z.object({
    type: z.literal('LocalEffectMomentary'),
    effectType: z.enum(['lowpass_filter', 'highpass_filter', 'bitcrusher']),
    intensity: z.number().min(0).max(1)
  })
]);

export const PadConfigSchema = z.object({
  id: z.string(),
  padIndex: z.number().min(0).max(15),
  label: z.string(),
  color: z.string(),
  bounds: Rect2DSchema,
  action: PadActionSchema,
  chokeGroup: z.number().optional()
});

export const PadBankSchema = z.object({
  id: z.enum(['A', 'B', 'C', 'D']),
  name: z.string(),
  pads: z.array(PadConfigSchema).length(16)
});

export const CalibrationProfileSchema = z.object({
  dominantHand: z.enum(['Left', 'Right']),
  hoverDepthZ: z.number(),
  strikeDepthThresholdZ: z.number(),
  minStrikeVelocityZ: z.number(),
  maxLateralVelocityXY: z.number(),
  pinchThreshold: z.number(),
  cooldownMs: z.number(),
  hysteresisDepthZ: z.number(),
  sensitivity: z.number()
});

export const BeatwaveSessionSchema = z.object({
  version: z.literal('1.0.0'),
  projectId: z.string(),
  title: z.string(),
  bpm: z.number().min(30).max(300),
  quantize: z.enum(['off', '1/4', '1/8', '1/16']),
  masterGain: z.number().min(0).max(2),
  sourceType: z.enum(['local', 'procedural', 'spotify', 'midi_only']),
  banks: z.array(PadBankSchema).min(1).max(4),
  calibration: CalibrationProfileSchema,
  exportedAt: z.string()
});

export type BeatwaveSession = z.infer<typeof BeatwaveSessionSchema>;

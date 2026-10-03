import {
  PadAction,
  StrikeEvent,
  SourceType,
  assertSourceCapability
} from '@beatwave/protocol';
import { AudioClock } from './clock.js';
import { SampleRegistry } from './registry.js';
import { VoicePool } from './voice.js';
import { Transport } from './transport.js';
import { Quantizer, QuantizeValue } from './quantizer.js';
import { Mixer } from './mixer.js';
import { PerformanceRecorder } from './recorder.js';
import { AudioLatencyProfiler } from './profiler.js';
import { BackingTrackPlayer } from './backing-track.js';

export interface AudioEngineOptions {
  readonly sampleRate?: number;
  readonly maxPolyphony?: number;
}

export class AudioEngine {
  public readonly ctx: AudioContext;
  public readonly clock: AudioClock;
  public readonly registry: SampleRegistry;
  public readonly voices: VoicePool;
  public readonly transport: Transport;
  public readonly quantizer: Quantizer;
  public readonly mixer: Mixer;
  public readonly recorder: PerformanceRecorder;
  public readonly profiler: AudioLatencyProfiler;
  public readonly backing: BackingTrackPlayer;

  private currentSourceType: SourceType = 'procedural';
  private lookaheadBufferSec: number = 0.005; // 5ms lookahead

  constructor(options: AudioEngineOptions = {}) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    this.ctx = new AudioContextClass({
      sampleRate: options.sampleRate || 44100,
      latencyHint: 'interactive'
    });

    this.clock = new AudioClock(this.ctx);
    this.registry = new SampleRegistry(this.ctx);
    this.voices = new VoicePool(this.ctx, options.maxPolyphony || 32);
    this.transport = new Transport(this.clock);
    this.quantizer = new Quantizer('off', 120);
    this.mixer = new Mixer(this.ctx);
    this.recorder = new PerformanceRecorder();
    this.profiler = new AudioLatencyProfiler();
    this.backing = new BackingTrackPlayer(this.ctx);
  }

  public async resume(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
      this.clock.sync();
    }
  }

  public setSourceType(sourceType: SourceType): void {
    this.currentSourceType = sourceType;
  }

  public getSourceType(): SourceType {
    return this.currentSourceType;
  }

  public setQuantize(q: QuantizeValue): void {
    this.quantizer.quantize = q;
  }

  public setBpm(bpm: number): void {
    this.transport.bpm = bpm;
    this.quantizer.bpm = bpm;
  }

  /**
   * Executes a pad action triggered by a strike or fallback pointer/key.
   * Enforces domain source capabilities before executing!
   */
  public triggerPadAction(strike: StrikeEvent): void {
    const action = strike.action;

    switch (action.type) {
      case 'SampleTrigger': {
        assertSourceCapability(this.currentSourceType, 'decodedAudio', 'SampleTrigger');
        const buffer = this.registry.getBuffer(action.sampleId);
        if (!buffer) {
          console.warn(`[AudioEngine] Sample "${action.sampleId}" not loaded in registry.`);
          return;
        }

        const scheduledTime = this.quantizer.computeScheduleTime(
          this.ctx.currentTime,
          this.transport.startTimeSec,
          this.lookaheadBufferSec
        );

        this.profiler.recordSchedule(performance.now(), scheduledTime, this.ctx.currentTime);

        const dest = this.mixer.getPadDestination(strike.padIndex);
        this.voices.spawnVoice(
          {
            sampleId: action.sampleId,
            gain: action.gain,
            pan: action.pan,
            velocity: strike.velocity,
            chokeGroup: action.chokeGroup,
            startOffsetSec: action.startOffsetSec,
            endOffsetSec: action.endOffsetSec,
            detune: action.pitchSemitones !== undefined ? action.pitchSemitones * 100 : undefined,
            loop: false,
            scheduledAudioTimeSec: scheduledTime,
            padIndex: strike.padIndex
          },
          buffer,
          dest
        );

        this.recorder.recordEvent(strike, 'A', action.sampleId);
        break;
      }

      case 'SampleGate': {
        assertSourceCapability(this.currentSourceType, 'decodedAudio', 'SampleGate');
        const buffer = this.registry.getBuffer(action.sampleId);
        if (!buffer) return;

        const scheduledTime = this.ctx.currentTime + this.lookaheadBufferSec;
        const dest = this.mixer.getPadDestination(strike.padIndex);

        this.voices.spawnVoice(
          {
            sampleId: action.sampleId,
            gain: action.gain,
            pan: action.pan,
            velocity: strike.velocity,
            chokeGroup: action.chokeGroup,
            scheduledAudioTimeSec: scheduledTime,
            padIndex: strike.padIndex
          },
          buffer,
          dest
        );
        this.recorder.recordEvent(strike, 'A', action.sampleId);
        break;
      }

      case 'LoopToggle': {
        assertSourceCapability(this.currentSourceType, 'decodedAudio', 'LoopToggle');
        // If already playing for this pad, stop it; else spawn looping voice
        const padIndex = strike.padIndex;
        const buffer = this.registry.getBuffer(action.sampleId);
        if (!buffer) return;

        this.voices.stopPadVoices(padIndex);
        const scheduledTime = this.quantizer.computeScheduleTime(
          this.ctx.currentTime,
          this.transport.startTimeSec,
          this.lookaheadBufferSec
        );
        const dest = this.mixer.getPadDestination(padIndex);

        this.voices.spawnVoice(
          {
            sampleId: action.sampleId,
            gain: action.gain,
            pan: 0,
            velocity: strike.velocity,
            loop: true,
            scheduledAudioTimeSec: scheduledTime,
            padIndex
          },
          buffer,
          dest
        );
        break;
      }

      case 'TransportPlayPause': {
        assertSourceCapability(this.currentSourceType, 'transport', 'TransportPlayPause');
        if (this.transport.state === 'playing') {
          this.transport.pause();
        } else {
          this.transport.play();
        }
        break;
      }

      default:
        // MIDI or other non-audio action handled by their respective systems
        break;
    }
  }

  public releasePad(padIndex: number): void {
    // Release pad voices for gated actions
    this.voices.stopPadVoices(padIndex);
  }

  public dispose(): void {
    this.backing.stop();
    this.voices.stopAll();
    this.transport.dispose();
    this.ctx.close();
  }
}

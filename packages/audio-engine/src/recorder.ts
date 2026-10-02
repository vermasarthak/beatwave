import { StrikeEvent, PadBankId } from '@beatwave/protocol';

export interface RecordedPerformanceEvent {
  readonly id: string;
  readonly timestampMs: number;
  readonly audioTimeSec: number;
  readonly padIndex: number;
  readonly bankId: PadBankId;
  readonly handId: number;
  readonly velocity: number;
  readonly confidence: number;
  readonly method: string;
  readonly sampleId?: string;
  readonly midiNote?: number;
}

export class PerformanceRecorder {
  private _isRecording: boolean = false;
  private events: RecordedPerformanceEvent[] = [];
  private startPerfTimeMs: number = 0;
  private startAudioTimeSec: number = 0;

  public start(audioTimeSec: number): void {
    this._isRecording = true;
    this.events = [];
    this.startPerfTimeMs = performance.now();
    this.startAudioTimeSec = audioTimeSec;
  }

  public stop(): RecordedPerformanceEvent[] {
    this._isRecording = false;
    return [...this.events];
  }

  public get isRecording(): boolean {
    return this._isRecording;
  }

  public recordEvent(
    strike: StrikeEvent,
    bankId: PadBankId = 'A',
    sampleId?: string,
    midiNote?: number
  ): void {
    if (!this._isRecording) return;

    this.events.push({
      id: `evt_${this.events.length}_${Date.now()}`,
      timestampMs: strike.timestampMs - this.startPerfTimeMs,
      audioTimeSec: (strike.audioContextTimeSec || 0) - this.startAudioTimeSec,
      padIndex: strike.padIndex,
      bankId,
      handId: strike.handId,
      velocity: strike.velocity,
      confidence: strike.confidence,
      method: strike.method,
      sampleId,
      midiNote
    });
  }

  public getRecordedEvents(): readonly RecordedPerformanceEvent[] {
    return this.events;
  }

  public exportJson(): string {
    return JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        totalEvents: this.events.length,
        events: this.events
      },
      null,
      2
    );
  }

  /**
   * Generates a Standard MIDI File (SMF Format 0) Uint8Array from recorded events.
   * Maps padIndex 0..15 to General MIDI drum notes (36 Kick, 38 Snare, 42 Hat, etc.)
   */
  public exportMidiFile(bpm: number = 120): Uint8Array {
    const ticksPerQuarter = 480;
    const msPerQuarter = (60 / bpm) * 1000;
    const msPerTick = msPerQuarter / ticksPerQuarter;

    // GM drum map for 16 pads
    const GM_PAD_MAP = [36, 38, 42, 46, 39, 37, 41, 45, 49, 51, 54, 56, 35, 48, 50, 52];

    const midiEvents: { tick: number; status: number; data1: number; data2: number }[] = [];

    for (const evt of this.events) {
      const note = evt.midiNote ?? GM_PAD_MAP[evt.padIndex % 16];
      const vel = Math.min(127, Math.max(1, Math.round(evt.velocity * 127)));
      const startTick = Math.max(0, Math.round(evt.timestampMs / msPerTick));
      const durationTicks = Math.round(120); // 16th note gate

      // Note On (Channel 10 = drum channel, 0x99)
      midiEvents.push({ tick: startTick, status: 0x99, data1: note, data2: vel });
      // Note Off
      midiEvents.push({ tick: startTick + durationTicks, status: 0x89, data1: note, data2: 0 });
    }

    // Sort by tick
    midiEvents.sort((a, b) => a.tick - b.tick);

    // Build track data with delta times
    const trackBytes: number[] = [];
    let lastTick = 0;

    for (const ev of midiEvents) {
      const delta = ev.tick - lastTick;
      lastTick = ev.tick;
      writeVariableLength(trackBytes, delta);
      trackBytes.push(ev.status, ev.data1, ev.data2);
    }

    // End of track meta event (delta 0, 0xFF, 0x2F, 0x00)
    writeVariableLength(trackBytes, 0);
    trackBytes.push(0xff, 0x2f, 0x00);

    // Header chunk: 'MThd' (4 bytes), length 6, format 0, 1 track, division 480
    const headerBytes = [
      0x4d, 0x54, 0x68, 0x64, // 'MThd'
      0x00, 0x00, 0x00, 0x06, // length 6
      0x00, 0x00,             // format 0
      0x00, 0x01,             // 1 track
      (ticksPerQuarter >> 8) & 0xff, ticksPerQuarter & 0xff
    ];

    // Track chunk: 'MTrk' (4 bytes), length, trackBytes
    const trackLen = trackBytes.length;
    const trackHeader = [
      0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
      (trackLen >> 24) & 0xff,
      (trackLen >> 16) & 0xff,
      (trackLen >> 8) & 0xff,
      trackLen & 0xff
    ];

    return new Uint8Array([...headerBytes, ...trackHeader, ...trackBytes]);
  }
}

function writeVariableLength(target: number[], value: number): void {
  let buffer = value & 0x7f;
  const bytes = [];
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
  target.push(...bytes);
}

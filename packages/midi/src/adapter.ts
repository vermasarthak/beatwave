export interface MidiPortInfo {
  readonly id: string;
  readonly name: string;
  readonly manufacturer?: string;
  readonly state: string;
}

export interface IMidiAdapter {
  isSupported(): boolean;
  initialize(): Promise<boolean>;
  getOutputs(): MidiPortInfo[];
  selectOutput(portId: string): void;
  sendNoteOn(note: number, velocity: number, channel?: number): void;
  sendNoteOff(note: number, channel?: number): void;
  sendCC(controller: number, value: number, channel?: number): void;
}

export class WebMidiAdapter implements IMidiAdapter {
  private midiAccess: any = null;
  private selectedOutput: any = null;
  private availableOutputs: MidiPortInfo[] = [];

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public async initialize(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      this.midiAccess = await (navigator as any).requestMIDIAccess({ sysex: false });
      this.updateOutputList();

      this.midiAccess.onstatechange = () => {
        this.updateOutputList();
      };

      // Select first available output by default
      const first = Array.from(this.midiAccess.outputs.values())[0];
      if (first) {
        this.selectedOutput = first;
      }

      return true;
    } catch (err) {
      console.warn('[WebMidiAdapter] Failed to obtain Web MIDI access:', err);
      return false;
    }
  }

  private updateOutputList(): void {
    if (!this.midiAccess) return;
    this.availableOutputs = [];
    for (const output of this.midiAccess.outputs.values()) {
      this.availableOutputs.push({
        id: output.id,
        name: output.name || 'MIDI Out',
        manufacturer: output.manufacturer,
        state: output.state
      });
    }
  }

  public getOutputs(): MidiPortInfo[] {
    return [...this.availableOutputs];
  }

  public selectOutput(portId: string): void {
    if (!this.midiAccess) return;
    this.selectedOutput = this.midiAccess.outputs.get(portId) || null;
  }

  public sendNoteOn(note: number, velocity: number, channel: number = 1): void {
    if (!this.selectedOutput) return;
    const status = 0x90 | ((channel - 1) & 0x0f);
    const vel = Math.max(1, Math.min(127, Math.round(velocity * 127)));
    this.selectedOutput.send([status, note & 0x7f, vel]);
  }

  public sendNoteOff(note: number, channel: number = 1): void {
    if (!this.selectedOutput) return;
    const status = 0x80 | ((channel - 1) & 0x0f);
    this.selectedOutput.send([status, note & 0x7f, 0]);
  }

  public sendCC(controller: number, value: number, channel: number = 1): void {
    if (!this.selectedOutput) return;
    const status = 0xb0 | ((channel - 1) & 0x0f);
    const val = Math.max(0, Math.min(127, Math.round(value)));
    this.selectedOutput.send([status, controller & 0x7f, val]);
  }
}

export class MockMidiAdapter implements IMidiAdapter {
  public sentMessages: { type: string; data: number[]; channel: number }[] = [];
  private selectedPort: string = 'mock-port-1';

  public isSupported(): boolean {
    return true;
  }

  public async initialize(): Promise<boolean> {
    return true;
  }

  public getOutputs(): MidiPortInfo[] {
    return [
      { id: 'mock-port-1', name: 'Virtual Beatwave MIDI Port', state: 'connected' }
    ];
  }

  public selectOutput(portId: string): void {
    this.selectedPort = portId;
  }

  public sendNoteOn(note: number, velocity: number, channel: number = 1): void {
    const vel = Math.max(1, Math.min(127, Math.round(velocity * 127)));
    this.sentMessages.push({ type: 'noteOn', data: [note, vel], channel });
  }

  public sendNoteOff(note: number, channel: number = 1): void {
    this.sentMessages.push({ type: 'noteOff', data: [note, 0], channel });
  }

  public sendCC(controller: number, value: number, channel: number = 1): void {
    this.sentMessages.push({ type: 'cc', data: [controller, Math.round(value)], channel });
  }

  public clear(): void {
    this.sentMessages = [];
  }
}

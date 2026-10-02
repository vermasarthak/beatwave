/**
 * Procedural Audio Kit Generator.
 * Synthesizes 16 high-quality drum/instrument samples using native Web Audio / OfflineAudioContext.
 * Zero external copyright-restricted assets; completely deterministic and local-first.
 */

export interface ProceduralSampleMeta {
  readonly id: string;
  readonly name: string;
  readonly category: 'kick' | 'snare' | 'hihat' | 'percussion' | 'melodic';
  readonly chokeGroup?: number;
  readonly defaultGain: number;
}

export const PROCEDURAL_KIT_METADATA: readonly ProceduralSampleMeta[] = [
  { id: 'proc_kick', name: 'Deep 808 Kick', category: 'kick', defaultGain: 1.0 },
  { id: 'proc_snare', name: 'Crisp Snare', category: 'snare', defaultGain: 0.9 },
  { id: 'proc_cl_hat', name: 'Closed Hi-Hat', category: 'hihat', chokeGroup: 1, defaultGain: 0.8 },
  { id: 'proc_op_hat', name: 'Open Hi-Hat', category: 'hihat', chokeGroup: 1, defaultGain: 0.8 },
  { id: 'proc_clap', name: 'Stereo Clap', category: 'snare', defaultGain: 0.85 },
  { id: 'proc_rim', name: 'Acoustic Rim', category: 'percussion', defaultGain: 0.75 },
  { id: 'proc_tom_lo', name: 'Low Tom', category: 'percussion', defaultGain: 0.85 },
  { id: 'proc_tom_hi', name: 'High Tom', category: 'percussion', defaultGain: 0.85 },
  { id: 'proc_crash', name: 'Crash Cymbal', category: 'hihat', defaultGain: 0.7 },
  { id: 'proc_ride', name: 'Ride Bell', category: 'hihat', defaultGain: 0.7 },
  { id: 'proc_shaker', name: 'Perc Shaker', category: 'percussion', defaultGain: 0.75 },
  { id: 'proc_cowbell', name: '808 Cowbell', category: 'percussion', defaultGain: 0.7 },
  { id: 'proc_sub_bass', name: 'Sub Bass C1', category: 'melodic', defaultGain: 0.95 },
  { id: 'proc_chord_c', name: 'FM Chord Cmin', category: 'melodic', defaultGain: 0.8 },
  { id: 'proc_chord_eb', name: 'FM Chord EbMaj', category: 'melodic', defaultGain: 0.8 },
  { id: 'proc_chord_g', name: 'FM Chord Gmin', category: 'melodic', defaultGain: 0.8 }
];

export async function generateProceduralSample(
  id: string,
  sampleRate: number = 44100
): Promise<AudioBuffer> {
  switch (id) {
    case 'proc_kick':
      return synthesizeKick(sampleRate);
    case 'proc_snare':
      return synthesizeSnare(sampleRate);
    case 'proc_cl_hat':
      return synthesizeHat(sampleRate, false);
    case 'proc_op_hat':
      return synthesizeHat(sampleRate, true);
    case 'proc_clap':
      return synthesizeClap(sampleRate);
    case 'proc_rim':
      return synthesizeRim(sampleRate);
    case 'proc_tom_lo':
      return synthesizeTom(sampleRate, 85);
    case 'proc_tom_hi':
      return synthesizeTom(sampleRate, 140);
    case 'proc_crash':
      return synthesizeCrash(sampleRate);
    case 'proc_ride':
      return synthesizeRide(sampleRate);
    case 'proc_shaker':
      return synthesizeShaker(sampleRate);
    case 'proc_cowbell':
      return synthesizeCowbell(sampleRate);
    case 'proc_sub_bass':
      return synthesizeSubBass(sampleRate);
    case 'proc_chord_c':
      return synthesizeChord(sampleRate, [261.63, 311.13, 392.0]); // C minor
    case 'proc_chord_eb':
      return synthesizeChord(sampleRate, [311.13, 392.0, 466.16]); // Eb Major
    case 'proc_chord_g':
      return synthesizeChord(sampleRate, [392.0, 466.16, 587.33]); // G minor
    default:
      return synthesizeKick(sampleRate);
  }
}

/** 808 Style Pitch-Dropped Kick */
async function synthesizeKick(sr: number): Promise<AudioBuffer> {
  const duration = 0.45;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, 0);
  osc.frequency.exponentialRampToValueAtTime(42, 0.08);
  osc.frequency.exponentialRampToValueAtTime(32, duration);

  gain.gain.setValueAtTime(1.0, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** Punchy Snare: Tonal body + shaped noise burst */
async function synthesizeSnare(sr: number): Promise<AudioBuffer> {
  const duration = 0.25;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  // Tone generator
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, 0);
  osc.frequency.exponentialRampToValueAtTime(120, 0.08);
  oscGain.gain.setValueAtTime(0.7, 0);
  oscGain.gain.exponentialRampToValueAtTime(0.001, 0.12);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(0);
  osc.stop(0.12);

  // Noise generator
  const bufferSize = Math.floor(sr * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sr);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1000, 0);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, 0);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, duration);

  noiseSource.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(0);
  noiseSource.stop(duration);

  return ctx.startRendering();
}

/** Metallic Hi-Hat */
async function synthesizeHat(sr: number, open: boolean): Promise<AudioBuffer> {
  const duration = open ? 0.35 : 0.06;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  // Square wave cluster for metallic ring
  const freqs = [325, 412, 545, 690, 890, 1120];
  const merger = ctx.createGain();
  merger.gain.setValueAtTime(0.25, 0);

  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(f, 0);
    osc.connect(merger);
    osc.start(0);
    osc.stop(duration);
  });

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(7500, 0);
  bpf.Q.setValueAtTime(2.5, 0);

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.setValueAtTime(8000, 0);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.9, 0);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  merger.connect(bpf);
  bpf.connect(hpf);
  hpf.connect(env);
  env.connect(ctx.destination);

  return ctx.startRendering();
}

/** Multi-pulse Stereo Clap */
async function synthesizeClap(sr: number): Promise<AudioBuffer> {
  const duration = 0.28;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const bufferSize = Math.floor(sr * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sr);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(1200, 0);
  bpf.Q.setValueAtTime(1.2, 0);

  const env = ctx.createGain();
  // 3 quick pre-claps then main tail
  const pulses = [0, 0.015, 0.03];
  pulses.forEach((t) => {
    env.gain.setValueAtTime(0.6, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.01);
  });
  env.gain.setValueAtTime(0.9, 0.045);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  noise.connect(bpf);
  bpf.connect(env);
  env.connect(ctx.destination);
  noise.start(0);
  noise.stop(duration);

  return ctx.startRendering();
}

/** Acoustic Wood Rimshot */
async function synthesizeRim(sr: number): Promise<AudioBuffer> {
  const duration = 0.08;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(850, 0);
  osc.frequency.exponentialRampToValueAtTime(320, duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1.0, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** Resonant Tom */
async function synthesizeTom(sr: number, pitch: number): Promise<AudioBuffer> {
  const duration = 0.32;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch * 1.8, 0);
  osc.frequency.exponentialRampToValueAtTime(pitch, 0.05);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1.0, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** Crash Cymbal */
async function synthesizeCrash(sr: number): Promise<AudioBuffer> {
  const duration = 0.8;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const bufferSize = Math.floor(sr * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sr);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.setValueAtTime(5000, 0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.8, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  noise.connect(hpf);
  hpf.connect(gain);
  gain.connect(ctx.destination);
  noise.start(0);
  noise.stop(duration);

  return ctx.startRendering();
}

/** Ride Bell */
async function synthesizeRide(sr: number): Promise<AudioBuffer> {
  const duration = 0.45;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2200, 0);
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(3450, 0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(0);
  osc2.start(0);
  osc1.stop(duration);
  osc2.stop(duration);

  return ctx.startRendering();
}

/** Perc Shaker */
async function synthesizeShaker(sr: number): Promise<AudioBuffer> {
  const duration = 0.07;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const bufferSize = Math.floor(sr * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sr);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(6500, 0);
  bpf.Q.setValueAtTime(3.0, 0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, 0);
  gain.gain.linearRampToValueAtTime(0.8, 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  noise.connect(bpf);
  bpf.connect(gain);
  gain.connect(ctx.destination);
  noise.start(0);
  noise.stop(duration);

  return ctx.startRendering();
}

/** 808 Style Cowbell */
async function synthesizeCowbell(sr: number): Promise<AudioBuffer> {
  const duration = 0.22;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(540, 0);
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(800, 0);

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(700, 0);
  bpf.Q.setValueAtTime(2.5, 0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc1.connect(bpf);
  osc2.connect(bpf);
  bpf.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(0);
  osc2.start(0);
  osc1.stop(duration);
  osc2.stop(duration);

  return ctx.startRendering();
}

/** Deep Sub Bass Note */
async function synthesizeSubBass(sr: number): Promise<AudioBuffer> {
  const duration = 0.7;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(32.7, 0); // C1

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1.0, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** Polyphonic FM-Style Chord Hit */
async function synthesizeChord(sr: number, notes: number[]): Promise<AudioBuffer> {
  const duration = 0.55;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.4 / notes.length, 0);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2400, 0);
  filter.frequency.exponentialRampToValueAtTime(400, duration);

  notes.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, 0);
    osc.connect(filter);
    osc.start(0);
    osc.stop(duration);
  });

  const env = ctx.createGain();
  env.gain.setValueAtTime(1.0, 0);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  filter.connect(env);
  env.connect(master);
  master.connect(ctx.destination);

  return ctx.startRendering();
}

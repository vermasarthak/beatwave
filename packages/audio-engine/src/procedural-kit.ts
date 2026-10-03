/**
 * Procedural Audio Kit Generator.
 * Synthesizes high-quality drum/instrument samples using native Web Audio / OfflineAudioContext.
 * Zero external copyright-restricted assets; completely deterministic and local-first.
 * Features signature kits inspired by iconic hip-hop and electronic production:
 * - Flashing Lights (Graduation 2007)
 * - POWER (My Beautiful Dark Twisted Fantasy 2010)
 * - Runaway (MBDTF 2010)
 * - 808s & Heartbreak (2008)
 * - Classic 808 (Standard MPC Drum Machine)
 */

export interface ProceduralSampleMeta {
  readonly id: string;
  readonly name: string;
  readonly category: 'kick' | 'snare' | 'hihat' | 'percussion' | 'melodic' | 'vocal' | 'synth';
  readonly chokeGroup?: number;
  readonly defaultGain: number;
  readonly color?: string;
  readonly note?: string;
  readonly lyrics?: string;
  readonly audioUrl?: string;
}

export interface KanyeKitDefinition {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly album: string;
  readonly year: number;
  readonly bpm: number;
  readonly themeColor: string;
  readonly accentColor: string;
  readonly description: string;
  readonly backingTrackUrl?: string;
  readonly samples: readonly ProceduralSampleMeta[];
}

// ---------------------------------------------------------------------------
// 1. GRADUATION: FLASHING LIGHTS (VOCALS & STEMS)
// ---------------------------------------------------------------------------
export const FLASHING_LIGHTS_KIT: KanyeKitDefinition = {
  id: 'flashing_lights',
  name: 'Flashing Lights',
  subtitle: 'Graduation (2007)',
  album: 'Graduation',
  year: 2007,
  bpm: 90,
  themeColor: '#e879f9', // Neon purple
  accentColor: '#38bdf8', // Electric cyan
  description: 'Original vocal hooks & lyrics over full instrumental backing track.',
  backingTrackUrl: '/audio/backing/flashing_lights_instrumental.wav',
  samples: [
    { id: 'fl_vocal_0', name: 'Flashing...', category: 'vocal', defaultGain: 1.0, note: '"Flashing"', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_0.wav', color: '#c084fc' },
    { id: 'fl_vocal_1', name: '...Lights', category: 'vocal', defaultGain: 1.0, note: '"Lights"', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_1.wav', color: '#d946ef' },
    { id: 'fl_vocal_2', name: 'She don\'t believe in shooting stars', category: 'vocal', defaultGain: 1.0, note: 'Shooting Stars', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_2.wav', color: '#e879f9' },
    { id: 'fl_vocal_3', name: 'Inside our lives, until daylight', category: 'vocal', defaultGain: 1.0, note: 'Until Daylight', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_3.wav', color: '#f472b6' },
    { id: 'fl_vocal_4', name: 'Flashing lights, flashing lights', category: 'vocal', defaultGain: 1.0, note: 'Chorus Hook', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_4.wav', color: '#fb7185' },
    { id: 'fl_vocal_5', name: 'Only girl in the world', category: 'vocal', defaultGain: 1.0, note: 'Only Girl', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_5.wav', color: '#38bdf8' },
    { id: 'fl_vocal_6', name: 'Club on a Thursday?', category: 'vocal', defaultGain: 1.0, note: 'Thursday', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_6.wav', color: '#818cf8' },
    { id: 'fl_vocal_7', name: 'Her girl birthday', category: 'vocal', defaultGain: 1.0, note: 'Birthday', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_7.wav', color: '#6366f1' },
    { id: 'fl_vocal_8', name: 'Champagne still thirsty', category: 'vocal', defaultGain: 1.0, note: 'Champagne', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_8.wav', color: '#a855f7' },
    { id: 'fl_vocal_9', name: 'Forever 21 turned thirty', category: 'vocal', defaultGain: 1.0, note: 'Turned 30', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_9.wav', color: '#c084fc' },
    { id: 'fl_vocal_10', name: 'Don\'t call your friends', category: 'vocal', defaultGain: 1.0, note: 'Call Friends', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_10.wav', color: '#e879f9' },
    { id: 'fl_vocal_11', name: 'Tell \'em you done with me', category: 'vocal', defaultGain: 1.0, note: 'Done With Me', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_11.wav', color: '#f43f5e' },
    { id: 'fl_vocal_12', name: 'Flashing lights (Whisper)', category: 'vocal', defaultGain: 0.9, note: 'Whisper', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_12.wav', color: '#94a3b8' },
    { id: 'fl_vocal_13', name: 'Hey! Hey! Hey!', category: 'vocal', defaultGain: 1.0, note: 'Hey Adlib', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_13.wav', color: '#facc15' },
    { id: 'fl_vocal_14', name: 'Dreams come true', category: 'vocal', defaultGain: 1.0, note: 'Dreams', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_14.wav', color: '#67e8f9' },
    { id: 'fl_vocal_15', name: 'Until daylight!', category: 'vocal', defaultGain: 1.0, note: 'Daylight Hit', audioUrl: '/audio/vocals/flashing_lights/fl_vocal_15.wav', color: '#38bdf8' }
  ]
};

// ---------------------------------------------------------------------------
// 2. MBDTF: POWER (VOCALS & STEMS)
// ---------------------------------------------------------------------------
export const POWER_KIT: KanyeKitDefinition = {
  id: 'power',
  name: 'POWER',
  subtitle: 'My Beautiful Dark Twisted Fantasy (2010)',
  album: 'MBDTF',
  year: 2010,
  bpm: 154,
  themeColor: '#ef4444', // Crimson red
  accentColor: '#eab308', // Imperial gold
  description: 'King Crimson chants, iconic verses, and "All that POWER" hooks over the tribal drum break.',
  backingTrackUrl: '/audio/backing/power_instrumental.wav',
  samples: [
    { id: 'pow_vocal_0', name: 'No one man should have all that POWER', category: 'vocal', defaultGain: 1.0, note: 'All That POWER', audioUrl: '/audio/vocals/power/pow_vocal_0.wav', color: '#ef4444' },
    { id: 'pow_vocal_1', name: 'Clock\'s ticking, I count hours', category: 'vocal', defaultGain: 1.0, note: 'Count Hours', audioUrl: '/audio/vocals/power/pow_vocal_1.wav', color: '#f97316' },
    { id: 'pow_vocal_2', name: 'Trippin\' off the powder', category: 'vocal', defaultGain: 1.0, note: 'Off Powder', audioUrl: '/audio/vocals/power/pow_vocal_2.wav', color: '#f59e0b' },
    { id: 'pow_vocal_3', name: '\'Til then, the world\'s ours', category: 'vocal', defaultGain: 1.0, note: 'World\'s Ours', audioUrl: '/audio/vocals/power/pow_vocal_3.wav', color: '#eab308' },
    { id: 'pow_vocal_4', name: 'And then they, and then they...', category: 'vocal', defaultGain: 1.0, note: 'And Then They', audioUrl: '/audio/vocals/power/pow_vocal_4.wav', color: '#fbbf24' },
    { id: 'pow_vocal_5', name: '21st Century Schizoid Man!', category: 'vocal', defaultGain: 1.0, note: 'Schizoid Man!', audioUrl: '/audio/vocals/power/pow_vocal_5.wav', color: '#dc2626' },
    { id: 'pow_vocal_6', name: 'HEY!', category: 'vocal', defaultGain: 1.0, note: 'Chant "HEY!"', audioUrl: '/audio/vocals/power/pow_vocal_6.wav', color: '#b91c1c' },
    { id: 'pow_vocal_7', name: 'HAH!', category: 'vocal', defaultGain: 1.0, note: 'Chant "HAH!"', audioUrl: '/audio/vocals/power/pow_vocal_7.wav', color: '#991b1b' },
    { id: 'pow_vocal_8', name: 'Superhero need theme music', category: 'vocal', defaultGain: 1.0, note: 'Theme Music', audioUrl: '/audio/vocals/power/pow_vocal_8.wav', color: '#f59e0b' },
    { id: 'pow_vocal_9', name: 'POWER!', category: 'vocal', defaultGain: 1.0, note: 'POWER Shout', audioUrl: '/audio/vocals/power/pow_vocal_9.wav', color: '#ef4444' },
    { id: 'pow_vocal_10', name: 'Screams from haters nice ring to it', category: 'vocal', defaultGain: 1.0, note: 'Nice Ring', audioUrl: '/audio/vocals/power/pow_vocal_10.wav', color: '#f97316' },
    { id: 'pow_vocal_11', name: 'Every superhero theme music', category: 'vocal', defaultGain: 1.0, note: 'Superhero', audioUrl: '/audio/vocals/power/pow_vocal_11.wav', color: '#eab308' },
    { id: 'pow_vocal_12', name: '21st Century!', category: 'vocal', defaultGain: 1.0, note: '21st Century', audioUrl: '/audio/vocals/power/pow_vocal_12.wav', color: '#dc2626' },
    { id: 'pow_vocal_13', name: 'Schizoid Man!', category: 'vocal', defaultGain: 1.0, note: 'Schizoid Chop', audioUrl: '/audio/vocals/power/pow_vocal_13.wav', color: '#b91c1c' },
    { id: 'pow_vocal_14', name: 'All that power!', category: 'vocal', defaultGain: 1.0, note: 'All Power', audioUrl: '/audio/vocals/power/pow_vocal_14.wav', color: '#ef4444' },
    { id: 'pow_vocal_15', name: 'Make your life so exciting!', category: 'vocal', defaultGain: 1.0, note: 'Exciting!', audioUrl: '/audio/vocals/power/pow_vocal_15.wav', color: '#f59e0b' }
  ]
};

// ---------------------------------------------------------------------------
// 3. MBDTF: RUNAWAY (VOCALS & STEMS)
// ---------------------------------------------------------------------------
export const RUNAWAY_KIT: KanyeKitDefinition = {
  id: 'runaway',
  name: 'Runaway',
  subtitle: 'My Beautiful Dark Twisted Fantasy (2010)',
  album: 'MBDTF',
  year: 2010,
  bpm: 85,
  themeColor: '#f59e0b', // Amber / Gold
  accentColor: '#38bdf8', // Ice Cyan
  description: 'Rick James chops, "Toast to the Douchebags" verses, and outro vocoder solo.',
  backingTrackUrl: '/audio/backing/runaway_instrumental.wav',
  samples: [
    { id: 'run_vocal_0', name: 'Look at ya, look at ya!', category: 'vocal', defaultGain: 1.0, note: '"Look At Ya!"', audioUrl: '/audio/vocals/runaway/run_vocal_0.wav', color: '#f59e0b' },
    { id: 'run_vocal_1', name: 'Ladies and gentlemen...', category: 'vocal', defaultGain: 1.0, note: 'Ladies & Gents', audioUrl: '/audio/vocals/runaway/run_vocal_1.wav', color: '#fbbf24' },
    { id: 'run_vocal_2', name: 'Always find something wrong', category: 'vocal', defaultGain: 1.0, note: 'Find Wrong', audioUrl: '/audio/vocals/runaway/run_vocal_2.wav', color: '#d97706' },
    { id: 'run_vocal_3', name: 'Putting up with my shit too long', category: 'vocal', defaultGain: 1.0, note: 'Too Long', audioUrl: '/audio/vocals/runaway/run_vocal_3.wav', color: '#b45309' },
    { id: 'run_vocal_4', name: 'Finding what I don\'t like', category: 'vocal', defaultGain: 1.0, note: 'Don\'t Like', audioUrl: '/audio/vocals/runaway/run_vocal_4.wav', color: '#92400e' },
    { id: 'run_vocal_5', name: 'Time for us to have a toast', category: 'vocal', defaultGain: 1.0, note: 'Have A Toast', audioUrl: '/audio/vocals/runaway/run_vocal_5.wav', color: '#f59e0b' },
    { id: 'run_vocal_6', name: 'Toast for the douchebags', category: 'vocal', defaultGain: 1.0, note: 'Douchebags', audioUrl: '/audio/vocals/runaway/run_vocal_6.wav', color: '#fbbf24' },
    { id: 'run_vocal_7', name: 'Toast for the assholes', category: 'vocal', defaultGain: 1.0, note: 'Assholes', audioUrl: '/audio/vocals/runaway/run_vocal_7.wav', color: '#f59e0b' },
    { id: 'run_vocal_8', name: 'Toast for the scumbags', category: 'vocal', defaultGain: 1.0, note: 'Scumbags', audioUrl: '/audio/vocals/runaway/run_vocal_8.wav', color: '#d97706' },
    { id: 'run_vocal_9', name: 'Every one of them that I know', category: 'vocal', defaultGain: 1.0, note: 'That I Know', audioUrl: '/audio/vocals/runaway/run_vocal_9.wav', color: '#b45309' },
    { id: 'run_vocal_10', name: 'Toast for the jerkoffs', category: 'vocal', defaultGain: 1.0, note: 'Jerkoffs', audioUrl: '/audio/vocals/runaway/run_vocal_10.wav', color: '#f59e0b' },
    { id: 'run_vocal_11', name: 'That\'ll never take work off', category: 'vocal', defaultGain: 1.0, note: 'Never Work Off', audioUrl: '/audio/vocals/runaway/run_vocal_11.wav', color: '#fbbf24' },
    { id: 'run_vocal_12', name: 'Baby, I got a plan', category: 'vocal', defaultGain: 1.0, note: 'Got A Plan', audioUrl: '/audio/vocals/runaway/run_vocal_12.wav', color: '#d97706' },
    { id: 'run_vocal_13', name: 'Run away as fast as you can!', category: 'vocal', defaultGain: 1.0, note: 'Fast As You Can', audioUrl: '/audio/vocals/runaway/run_vocal_13.wav', color: '#ef4444' },
    { id: 'run_vocal_14', name: 'Run away from me, baby', category: 'vocal', defaultGain: 1.0, note: 'From Me Baby', audioUrl: '/audio/vocals/runaway/run_vocal_14.wav', color: '#dc2626' },
    { id: 'run_vocal_15', name: 'Run away, yeah! (Outro)', category: 'vocal', defaultGain: 1.0, note: 'Vocoder Outro', audioUrl: '/audio/vocals/runaway/run_vocal_15.wav', color: '#a855f7' }
  ]
};


// ---------------------------------------------------------------------------
// 4. 808s & HEARTBREAK KIT (2008)
// ---------------------------------------------------------------------------
export const HEARTBREAK_KIT: KanyeKitDefinition = {
  id: '808s_heartbreak',
  name: '808s & Heartbreak',
  subtitle: 'Heartbreak Era (2008)',
  album: '808s & Heartbreak',
  year: 2008,
  bpm: 120,
  themeColor: '#38bdf8', // Deflated blue
  accentColor: '#f43f5e', // Neon heart pink
  description: 'Love Lockdown tribal taiko heartbeat thumps, hollow Roland 808 claps, cowbells, and robotic auto-tune vocal chords.',
  samples: [
    { id: 'hb_kick_808', name: 'Heartbreak 808 Kick', category: 'kick', defaultGain: 1.0, note: '808 Kick', color: '#0284c7' },
    { id: 'hb_taiko_low', name: 'Taiko Heartbeat Low', category: 'percussion', defaultGain: 1.0, note: 'Taiko Low', color: '#f43f5e' },
    { id: 'hb_taiko_high', name: 'Taiko Heartbeat High', category: 'percussion', defaultGain: 0.95, note: 'Taiko High', color: '#fb7185' },
    { id: 'hb_snare_808', name: 'Vintage 808 Snare', category: 'snare', defaultGain: 0.9, note: '808 Snare', color: '#38bdf8' },
    { id: 'hb_clap_808', name: 'Hollow 808 Clap', category: 'snare', defaultGain: 0.85, note: '808 Clap', color: '#e0e7ff' },
    { id: 'hb_cowbell_808', name: 'Metallic 808 Cowbell', category: 'percussion', defaultGain: 0.75, note: '808 Cowbell', color: '#93c5fd' },
    { id: 'hb_conga_lo', name: 'Roland 808 Conga Low', category: 'percussion', defaultGain: 0.8, note: 'Conga Low', color: '#0ea5e9' },
    { id: 'hb_conga_hi', name: 'Roland 808 Conga High', category: 'percussion', defaultGain: 0.8, note: 'Conga High', color: '#38bdf8' },
    { id: 'hb_maracas', name: 'Warm 808 Maracas', category: 'percussion', defaultGain: 0.7, note: 'Maracas', color: '#bae6fd' },
    { id: 'hb_autotune_csharp', name: 'Auto-Tune Choir C#4', category: 'vocal', defaultGain: 0.85, note: 'Choir C#4', color: '#ec4899' },
    { id: 'hb_autotune_e', name: 'Auto-Tune Choir E4', category: 'vocal', defaultGain: 0.85, note: 'Choir E4', color: '#f43f5e' },
    { id: 'hb_autotune_gsharp', name: 'Auto-Tune Choir G#4', category: 'vocal', defaultGain: 0.85, note: 'Choir G#4', color: '#fb7185' },
    { id: 'hb_synth_pluck', name: 'Heartless Synth Pluck', category: 'synth', defaultGain: 0.85, note: 'Synth Pluck', color: '#818cf8' },
    { id: 'hb_clave', name: 'Warm Wooden Clave', category: 'percussion', defaultGain: 0.75, note: '808 Clave', color: '#cbd5e1' },
    { id: 'hb_cl_hat', name: 'Roland 808 Closed Hat', category: 'hihat', chokeGroup: 1, defaultGain: 0.8, note: '808 Closed Hat', color: '#7dd3fc' },
    { id: 'hb_op_hat', name: 'Roland 808 Open Hat', category: 'hihat', chokeGroup: 1, defaultGain: 0.8, note: '808 Open Hat', color: '#bae6fd' }
  ]
};

// ---------------------------------------------------------------------------
// 5. CLASSIC 808 KIT (Original)
// ---------------------------------------------------------------------------
export const CLASSIC_808_KIT: KanyeKitDefinition = {
  id: 'classic_808',
  name: 'Classic 808 Drum Machine',
  subtitle: 'Vintage Hardware Mode',
  album: 'Standard MPC',
  year: 1980,
  bpm: 120,
  themeColor: '#38bdf8',
  accentColor: '#818cf8',
  description: 'Pure vintage analog 808 drum machine with punchy kicks, snares, toms, and FM chords.',
  samples: [
    { id: 'proc_kick', name: 'Deep 808 Kick', category: 'kick', defaultGain: 1.0, note: 'Kick', color: '#38bdf8' },
    { id: 'proc_snare', name: 'Crisp Snare', category: 'snare', defaultGain: 0.9, note: 'Snare', color: '#818cf8' },
    { id: 'proc_cl_hat', name: 'Closed Hi-Hat', category: 'hihat', chokeGroup: 1, defaultGain: 0.8, note: 'Closed Hat', color: '#67e8f9' },
    { id: 'proc_op_hat', name: 'Open Hi-Hat', category: 'hihat', chokeGroup: 1, defaultGain: 0.8, note: 'Open Hat', color: '#bae6fd' },
    { id: 'proc_clap', name: 'Stereo Clap', category: 'snare', defaultGain: 0.85, note: 'Clap', color: '#c084fc' },
    { id: 'proc_rim', name: 'Acoustic Rim', category: 'percussion', defaultGain: 0.75, note: 'Rimshot', color: '#a855f7' },
    { id: 'proc_tom_lo', name: 'Low Tom', category: 'percussion', defaultGain: 0.85, note: 'Low Tom', color: '#38bdf8' },
    { id: 'proc_tom_hi', name: 'High Tom', category: 'percussion', defaultGain: 0.85, note: 'High Tom', color: '#60a5fa' },
    { id: 'proc_crash', name: 'Crash Cymbal', category: 'hihat', defaultGain: 0.7, note: 'Crash', color: '#facc15' },
    { id: 'proc_ride', name: 'Ride Bell', category: 'hihat', defaultGain: 0.7, note: 'Ride', color: '#fde047' },
    { id: 'proc_shaker', name: 'Perc Shaker', category: 'percussion', defaultGain: 0.75, note: 'Shaker', color: '#93c5fd' },
    { id: 'proc_cowbell', name: '808 Cowbell', category: 'percussion', defaultGain: 0.7, note: 'Cowbell', color: '#f59e0b' },
    { id: 'proc_sub_bass', name: 'Sub Bass C1', category: 'melodic', defaultGain: 0.95, note: 'Sub C1', color: '#6366f1' },
    { id: 'proc_chord_c', name: 'FM Chord Cmin', category: 'melodic', defaultGain: 0.8, note: 'Chord Cmin', color: '#ec4899' },
    { id: 'proc_chord_eb', name: 'FM Chord EbMaj', category: 'melodic', defaultGain: 0.8, note: 'Chord Eb', color: '#f43f5e' },
    { id: 'proc_chord_g', name: 'FM Chord Gmin', category: 'melodic', defaultGain: 0.8, note: 'Chord Gmin', color: '#e11d48' }
  ]
};

export const ALL_KITS: readonly KanyeKitDefinition[] = [
  FLASHING_LIGHTS_KIT,
  POWER_KIT,
  RUNAWAY_KIT,
  HEARTBREAK_KIT,
  CLASSIC_808_KIT
];

export const PROCEDURAL_KIT_METADATA: readonly ProceduralSampleMeta[] = [
  ...FLASHING_LIGHTS_KIT.samples,
  ...POWER_KIT.samples,
  ...RUNAWAY_KIT.samples,
  ...HEARTBREAK_KIT.samples,
  ...CLASSIC_808_KIT.samples
];

export async function generateProceduralSample(
  id: string,
  sampleRate: number = 44100
): Promise<AudioBuffer> {
  if (id.startsWith('fl_vocal_')) {
    const idx = parseInt(id.replace('fl_vocal_', '')) || 0;
    return synthesizeFormantVocal(sampleRate, 340 + (idx % 8) * 20, [750, 1250, 2600], 0.6, 'flash');
  }
  if (id.startsWith('pow_vocal_')) {
    const idx = parseInt(id.replace('pow_vocal_', '')) || 0;
    return synthesizeFormantVocal(sampleRate, 200 + (idx % 8) * 15, [800, 1300, 2500], 0.6, 'hey');
  }
  if (id.startsWith('run_vocal_')) {
    const idx = parseInt(id.replace('run_vocal_', '')) || 0;
    return synthesizeFormantVocal(sampleRate, 280 + (idx % 8) * 18, [500, 950, 2400], 0.6, 'lookatya');
  }

  switch (id) {
    // Flashing Lights Kit
    case 'fl_kick':
      return synthesizePunchKick(sampleRate, 130, 48, 0.38);
    case 'fl_snare':
      return synthesizeGatedSnare(sampleRate, 0.28);
    case 'fl_cl_hat':
      return synthesizeHat(sampleRate, false, 8500);
    case 'fl_op_hat':
      return synthesizeHat(sampleRate, true, 8000);
    case 'fl_clap':
      return synthesizeClap(sampleRate, 1400);
    case 'fl_string_fsharp':
      return synthesizeViolinStaccato(sampleRate, 739.99, 0.35); // F#5
    case 'fl_string_e':
      return synthesizeViolinStaccato(sampleRate, 659.25, 0.35); // E5
    case 'fl_string_csharp':
      return synthesizeViolinStaccato(sampleRate, 554.37, 0.35); // C#5
    case 'fl_string_b':
      return synthesizeViolinStaccato(sampleRate, 493.88, 0.35); // B4
    case 'fl_string_riff':
      return synthesizeStringsRiff(sampleRate);
    case 'fl_synth_brass':
      return synthesizeAnalogBrass(sampleRate, [369.99, 440.0, 554.37], 0.45); // F# minor brass
    case 'fl_electro_bass':
      return synthesizeFrenchElectroBass(sampleRate, 92.5, 0.3); // F#2 pluck
    case 'fl_bell_arp':
      return synthesizeCrystalBell(sampleRate, [1479.98, 2217.46], 0.45);
    case 'fl_vocal_flashing':
      return synthesizeFormantVocal(sampleRate, 370, [750, 1250, 2600], 0.38, 'flash');
    case 'fl_vocal_lights':
      return synthesizeFormantVocal(sampleRate, 440, [850, 1800, 2800], 0.42, 'lights');
    case 'fl_sub_bass':
      return synthesizeSubBass(sampleRate, 41.2, 0.7); // E1 sub

    // POWER Kit
    case 'pow_kick':
      return synthesizeSchizoidStompKick(sampleRate);
    case 'pow_snare':
      return synthesizePunchSnare(sampleRate);
    case 'pow_clap':
      return synthesizeStadiumClap(sampleRate);
    case 'pow_tambourine':
      return synthesizeTambourine(sampleRate);
    case 'pow_tom_floor':
      return synthesizeTom(sampleRate, 65, 0.45);
    case 'pow_tom_rack':
      return synthesizeTom(sampleRate, 115, 0.35);
    case 'pow_chant_hey':
      return synthesizeFormantVocal(sampleRate, 220, [800, 1300, 2500], 0.3, 'hey');
    case 'pow_chant_hah':
      return synthesizeFormantVocal(sampleRate, 180, [850, 1200, 2400], 0.25, 'hah');
    case 'pow_schizoid_21st':
      return synthesizeVocoderSpeech(sampleRate, 233.08, '21st'); // Bb3
    case 'pow_schizoid_man':
      return synthesizeVocoderSpeech(sampleRate, 207.65, 'schizoid'); // G#3
    case 'pow_brass_bb':
      return synthesizeDistortedBrass(sampleRate, [233.08, 293.66, 349.23]); // Bb major
    case 'pow_brass_db':
      return synthesizeDistortedBrass(sampleRate, [277.18, 349.23, 415.3]); // Db major
    case 'pow_fuzz_bass':
      return synthesizeFuzzBass(sampleRate, 58.27); // Bb1
    case 'pow_crash_choke':
      return synthesizeCrash(sampleRate, 0.45);
    case 'pow_anvil':
      return synthesizeAnvilClang(sampleRate);
    case 'pow_808_sub':
      return synthesizeDistorted808Sub(sampleRate, 46.25, 0.65); // Bb0

    // Runaway Kit
    case 'run_piano_e6':
      return synthesizePianoNote(sampleRate, 1318.51, 1.2, true); // High E6 note with delay!
    case 'run_kick_dist':
      return synthesizeDistorted808Sub(sampleRate, 38.89, 0.75); // Eb0
    case 'run_snare':
      return synthesizePunchSnare(sampleRate);
    case 'run_rimshot':
      return synthesizeRim(sampleRate);
    case 'run_piano_eb6':
      return synthesizePianoNote(sampleRate, 1244.51, 0.8, false);
    case 'run_piano_csharp6':
      return synthesizePianoNote(sampleRate, 1108.73, 0.8, false);
    case 'run_piano_a5':
      return synthesizePianoNote(sampleRate, 880.0, 0.8, false);
    case 'run_vocal_lookatya':
      return synthesizeFormantVocal(sampleRate, 310, [500, 950, 2400], 0.5, 'lookatya');
    case 'run_vocal_ladies':
      return synthesizeFormantVocal(sampleRate, 260, [650, 1400, 2500], 0.45, 'ladies');
    case 'run_vocoder_solo':
      return synthesizeVocoderLead(sampleRate, 329.63, 0.8); // E4 vocoder
    case 'run_acoustic_clap':
      return synthesizeClap(sampleRate, 1100);
    case 'run_cl_hat':
      return synthesizeHat(sampleRate, false, 7500);
    case 'run_op_hat':
      return synthesizeHat(sampleRate, true, 7200);
    case 'run_rev_cymbal':
      return synthesizeReverseCymbal(sampleRate, 0.7);
    case 'run_sub_glide':
      return synthesizeSubGlide(sampleRate, 36.71, 41.2, 0.7);
    case 'run_piano_chord':
      return synthesizePianoChord(sampleRate, [739.99, 880.0, 1108.73], 1.2); // F#m9 chord

    // 808s & Heartbreak Kit
    case 'hb_kick_808':
      return synthesizeKick(sampleRate);
    case 'hb_taiko_low':
      return synthesizeTaiko(sampleRate, 52, 0.55);
    case 'hb_taiko_high':
      return synthesizeTaiko(sampleRate, 88, 0.45);
    case 'hb_snare_808':
      return synthesizeSnare(sampleRate);
    case 'hb_clap_808':
      return synthesizeClap(sampleRate, 900);
    case 'hb_cowbell_808':
      return synthesizeCowbell(sampleRate);
    case 'hb_conga_lo':
      return synthesizeTom(sampleRate, 95, 0.25);
    case 'hb_conga_hi':
      return synthesizeTom(sampleRate, 160, 0.22);
    case 'hb_maracas':
      return synthesizeShaker(sampleRate);
    case 'hb_autotune_csharp':
      return synthesizeFormantVocal(sampleRate, 277.18, [700, 1200, 2600], 0.6, 'choir');
    case 'hb_autotune_e':
      return synthesizeFormantVocal(sampleRate, 329.63, [700, 1200, 2600], 0.6, 'choir');
    case 'hb_autotune_gsharp':
      return synthesizeFormantVocal(sampleRate, 415.3, [700, 1200, 2600], 0.6, 'choir');
    case 'hb_synth_pluck':
      return synthesizeFrenchElectroBass(sampleRate, 220, 0.25);
    case 'hb_clave':
      return synthesizeRim(sampleRate);
    case 'hb_cl_hat':
      return synthesizeHat(sampleRate, false, 8000);
    case 'hb_op_hat':
      return synthesizeHat(sampleRate, true, 8000);

    // Classic 808 kit
    case 'proc_kick':
      return synthesizeKick(sampleRate);
    case 'proc_snare':
      return synthesizeSnare(sampleRate);
    case 'proc_cl_hat':
      return synthesizeHat(sampleRate, false, 7500);
    case 'proc_op_hat':
      return synthesizeHat(sampleRate, true, 7500);
    case 'proc_clap':
      return synthesizeClap(sampleRate, 1200);
    case 'proc_rim':
      return synthesizeRim(sampleRate);
    case 'proc_tom_lo':
      return synthesizeTom(sampleRate, 85, 0.32);
    case 'proc_tom_hi':
      return synthesizeTom(sampleRate, 140, 0.32);
    case 'proc_crash':
      return synthesizeCrash(sampleRate, 0.8);
    case 'proc_ride':
      return synthesizeRide(sampleRate);
    case 'proc_shaker':
      return synthesizeShaker(sampleRate);
    case 'proc_cowbell':
      return synthesizeCowbell(sampleRate);
    case 'proc_sub_bass':
      return synthesizeSubBass(sampleRate, 32.7, 0.7);
    case 'proc_chord_c':
      return synthesizeChord(sampleRate, [261.63, 311.13, 392.0]);
    case 'proc_chord_eb':
      return synthesizeChord(sampleRate, [311.13, 392.0, 466.16]);
    case 'proc_chord_g':
      return synthesizeChord(sampleRate, [392.0, 466.16, 587.33]);
    default:
      return synthesizePunchKick(sampleRate, 130, 50, 0.4);
  }
}

// ===========================================================================
// Web Audio DSP Synthesis Primitives
// ===========================================================================

/** The iconic Runaway Solo Piano Note (E6 ~1318.51 Hz) with acoustic hammer strike & ping delay */
async function synthesizePianoNote(sr: number, freq: number, duration: number, withDelay: boolean): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  // Hammer strike percussive noise transient
  const noiseLen = Math.floor(sr * 0.008); // 8ms hammer click
  const noiseBuf = ctx.createBuffer(1, noiseLen, sr);
  const nData = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) {
    nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.002));
  }
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = noiseBuf;

  const hammerFilter = ctx.createBiquadFilter();
  hammerFilter.type = 'bandpass';
  hammerFilter.frequency.setValueAtTime(freq * 1.5, 0);
  hammerFilter.Q.setValueAtTime(2.0, 0);

  // Harmonic piano string resonance (fundamental + 2nd + 3rd partials)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, 0);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2.003, 0); // slight inharmonicity of piano strings

  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(freq * 3.01, 0);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.7, 0);
  oscGain.gain.exponentialRampToValueAtTime(0.001, duration * 0.95);

  const g1 = ctx.createGain(); g1.gain.value = 0.7;
  const g2 = ctx.createGain(); g2.gain.value = 0.2;
  const g3 = ctx.createGain(); g3.gain.value = 0.08;

  osc1.connect(g1); g1.connect(oscGain);
  osc2.connect(g2); g2.connect(oscGain);
  osc3.connect(g3); g3.connect(oscGain);

  noiseSrc.connect(hammerFilter);
  hammerFilter.connect(oscGain);

  if (withDelay) {
    // Feedback delay line emulation
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.28; // ~quarter note slap at 85 bpm
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 2800;

    oscGain.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delayFilter.connect(ctx.destination);
  }

  oscGain.connect(ctx.destination);

  osc1.start(0); osc2.start(0); osc3.start(0); noiseSrc.start(0);
  osc1.stop(duration); osc2.stop(duration); osc3.stop(duration); noiseSrc.stop(0.01);

  return ctx.startRendering();
}

/** Staccato Orchestral Violin Strings for Flashing Lights */
async function synthesizeViolinStaccato(sr: number, freq: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  // Ensemble detuned saw/triangle oscillators
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(freq, 0);

  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(freq * 1.004, 0); // +7 cents detune

  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(freq * 0.996, 0); // -7 cents detune

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(freq * 2.2, 0);
  bpf.Q.setValueAtTime(1.8, 0);

  const env = ctx.createGain();
  // Fast bowed staccato attack (15ms), snappy decay
  env.gain.setValueAtTime(0.01, 0);
  env.gain.linearRampToValueAtTime(0.9, 0.018);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  osc1.connect(bpf); osc2.connect(bpf); osc3.connect(bpf);
  bpf.connect(env);
  env.connect(ctx.destination);

  osc1.start(0); osc2.start(0); osc3.start(0);
  osc1.stop(duration); osc2.stop(duration); osc3.stop(duration);

  return ctx.startRendering();
}

/** Flashing Lights Full Arpeggiated String Riff Sweep */
async function synthesizeStringsRiff(sr: number): Promise<AudioBuffer> {
  const duration = 0.8;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);
  const notes = [739.99, 880.0, 1108.73, 1479.98]; // F#5, A5, C#6, F#6

  notes.forEach((freq, idx) => {
    const startT = idx * 0.06;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startT);

    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(freq * 1.8, startT);
    bpf.Q.setValueAtTime(2.0, startT);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, startT);
    env.gain.linearRampToValueAtTime(0.6, startT + 0.015);
    env.gain.exponentialRampToValueAtTime(0.001, duration);

    osc.connect(bpf);
    bpf.connect(env);
    env.connect(ctx.destination);

    osc.start(startT);
    osc.stop(duration);
  });

  return ctx.startRendering();
}

/** French Electro Pluck Bass for Flashing Lights */
async function synthesizeFrenchElectroBass(sr: number, freq: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const oscSaw = ctx.createOscillator();
  oscSaw.type = 'sawtooth';
  oscSaw.frequency.setValueAtTime(freq, 0);

  const oscSub = ctx.createOscillator();
  oscSub.type = 'sine';
  oscSub.frequency.setValueAtTime(freq / 2, 0);

  // Resonant low-pass filter envelope (snappy disco pluck)
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.Q.setValueAtTime(5.0, 0);
  lpf.frequency.setValueAtTime(2400, 0);
  lpf.frequency.exponentialRampToValueAtTime(110, duration * 0.7);

  const env = ctx.createGain();
  env.gain.setValueAtTime(1.0, 0);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  oscSaw.connect(lpf);
  oscSub.connect(env);
  lpf.connect(env);
  env.connect(ctx.destination);

  oscSaw.start(0); oscSub.start(0);
  oscSaw.stop(duration); oscSub.stop(duration);

  return ctx.startRendering();
}

/** Formant Vowel Filtered Vocal Chop ("Flashing", "Lights", "Hey!", "Look At Ya") */
async function synthesizeFormantVocal(
  sr: number,
  baseFreq: number,
  formants: [number, number, number],
  duration: number,
  type: string
): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  // Pulse/buzz oscillator for rich human vocal harmonic series
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(baseFreq, 0);
  if (type === 'flash') {
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.15, duration * 0.3);
  } else if (type === 'lights') {
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.88, duration);
  } else if (type === 'hey' || type === 'hah') {
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, duration);
  }

  // 3 Formant bandpass filters mimicking human vocal tract
  const [f1, f2, f3] = formants;
  const bp1 = ctx.createBiquadFilter(); bp1.type = 'bandpass'; bp1.frequency.value = f1; bp1.Q.value = 4.5;
  const bp2 = ctx.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = f2; bp2.Q.value = 5.0;
  const bp3 = ctx.createBiquadFilter(); bp3.type = 'bandpass'; bp3.frequency.value = f3; bp3.Q.value = 6.0;

  const g1 = ctx.createGain(); g1.gain.value = 0.6;
  const g2 = ctx.createGain(); g2.gain.value = 0.4;
  const g3 = ctx.createGain(); g3.gain.value = 0.2;

  osc.connect(bp1); bp1.connect(g1);
  osc.connect(bp2); bp2.connect(g2);
  osc.connect(bp3); bp3.connect(g3);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.01, 0);
  env.gain.linearRampToValueAtTime(0.9, 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  g1.connect(env);
  g2.connect(env);
  g3.connect(env);
  env.connect(ctx.destination);

  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** 21st Century Schizoid Man Stomp Kick for POWER */
async function synthesizeSchizoidStompKick(sr: number): Promise<AudioBuffer> {
  const duration = 0.5;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  // Heavy acoustic tone drop
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(160, 0);
  osc.frequency.exponentialRampToValueAtTime(55, 0.07);
  osc.frequency.exponentialRampToValueAtTime(35, duration);

  // Acoustic room thump noise
  const noiseLen = Math.floor(sr * 0.15);
  const nBuf = ctx.createBuffer(1, noiseLen, sr);
  const d = nBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.03));
  const nSrc = ctx.createBufferSource();
  nSrc.buffer = nBuf;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 350;

  const env = ctx.createGain();
  env.gain.setValueAtTime(1.0, 0);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(env);
  nSrc.connect(lpf);
  lpf.connect(env);
  env.connect(ctx.destination);

  osc.start(0); nSrc.start(0);
  osc.stop(duration); nSrc.stop(0.15);

  return ctx.startRendering();
}

/** Distorted Saturated 808 Sub for POWER / Runaway */
async function synthesizeDistorted808Sub(sr: number, pitch: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch * 2.5, 0);
  osc.frequency.exponentialRampToValueAtTime(pitch, 0.05);

  // Hard clipping waveshaper
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(512);
  for (let i = 0; i < 512; i++) {
    const x = (i / 256) - 1;
    curve[i] = Math.tanh(x * 3.5); // Warm saturation
  }
  shaper.curve = curve;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 650;

  const env = ctx.createGain();
  env.gain.setValueAtTime(1.0, 0);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(shaper);
  shaper.connect(lpf);
  lpf.connect(env);
  env.connect(ctx.destination);

  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** Massive Distorted Fanfare Brass for POWER */
async function synthesizeDistortedBrass(sr: number, freqs: number[]): Promise<AudioBuffer> {
  const duration = 0.55;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const master = ctx.createGain();
  master.gain.value = 0.35;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.Q.value = 4.0;
  lpf.frequency.setValueAtTime(450, 0);
  lpf.frequency.exponentialRampToValueAtTime(3200, 0.08);
  lpf.frequency.exponentialRampToValueAtTime(800, duration);

  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    osc.connect(lpf);
    osc.start(0);
    osc.stop(duration);
  });

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.01, 0);
  env.gain.linearRampToValueAtTime(1.0, 0.03);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  lpf.connect(env);
  env.connect(master);
  master.connect(ctx.destination);

  return ctx.startRendering();
}

/** Love Lockdown Tribal Taiko Drum */
async function synthesizeTaiko(sr: number, pitch: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(pitch * 1.8, 0);
  osc1.frequency.exponentialRampToValueAtTime(pitch, 0.06);

  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(pitch * 2.2, 0);
  osc2.frequency.exponentialRampToValueAtTime(pitch * 1.1, 0.08);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1.0, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(0); osc2.start(0);
  osc1.stop(duration); osc2.stop(duration);

  return ctx.startRendering();
}

/** Vocoder Speech Synthesizer */
async function synthesizeVocoderSpeech(sr: number, freq: number, text: string): Promise<AudioBuffer> {
  const duration = 0.55;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, 0);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(text === '21st' ? 1200 : 900, 0);
  filter.Q.setValueAtTime(3.5, 0);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.01, 0);
  env.gain.linearRampToValueAtTime(0.9, 0.04);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(filter);
  filter.connect(env);
  env.connect(ctx.destination);

  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** Distorted Outro Vocoder Synth Lead for Runaway */
async function synthesizeVocoderLead(sr: number, freq: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, 0);

  // Vibrato LFO
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 5.5; // 5.5Hz vibrato
  lfoGain.gain.value = 8.0;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  // Overdrive distortion
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(512);
  for (let i = 0; i < 512; i++) {
    const x = (i / 256) - 1;
    curve[i] = Math.tanh(x * 5.0);
  }
  shaper.curve = curve;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 1600;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.01, 0);
  env.gain.linearRampToValueAtTime(0.85, 0.05);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(shaper);
  shaper.connect(lpf);
  lpf.connect(env);
  env.connect(ctx.destination);

  osc.start(0); lfo.start(0);
  osc.stop(duration); lfo.stop(duration);

  return ctx.startRendering();
}

/** 80s Gated Snare for Flashing Lights */
async function synthesizeGatedSnare(sr: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  // Tone body
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(240, 0);
  osc.frequency.exponentialRampToValueAtTime(140, 0.07);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.8, 0);
  oscGain.gain.exponentialRampToValueAtTime(0.01, 0.1);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  // Gated noise burst
  const noiseLen = Math.floor(sr * duration);
  const nBuf = ctx.createBuffer(1, noiseLen, sr);
  const data = nBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) data[i] = Math.random() * 2 - 1;
  const nSrc = ctx.createBufferSource();
  nSrc.buffer = nBuf;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'highpass';
  bpf.frequency.value = 1200;

  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.9, 0);
  // Gated cutoff: abruptly drops to silence at 0.18s
  nGain.gain.setValueAtTime(0.7, 0.18);
  nGain.gain.linearRampToValueAtTime(0.0001, 0.22);

  nSrc.connect(bpf);
  bpf.connect(nGain);
  nGain.connect(ctx.destination);

  osc.start(0); nSrc.start(0);
  osc.stop(0.12); nSrc.stop(duration);

  return ctx.startRendering();
}

/** Analog Brass Chord Hit */
async function synthesizeAnalogBrass(sr: number, notes: number[], duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);
  const master = ctx.createGain();
  master.gain.value = 0.4 / notes.length;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 3.0;
  filter.frequency.setValueAtTime(400, 0);
  filter.frequency.exponentialRampToValueAtTime(3200, 0.06);
  filter.frequency.exponentialRampToValueAtTime(800, duration);

  notes.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.connect(filter);
    osc.start(0);
    osc.stop(duration);
  });

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.01, 0);
  env.gain.linearRampToValueAtTime(1.0, 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  filter.connect(env);
  env.connect(master);
  master.connect(ctx.destination);

  return ctx.startRendering();
}

/** Crystal Glockenspiel / Bells */
async function synthesizeCrystalBell(sr: number, notes: number[], duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);
  const master = ctx.createGain();
  master.gain.value = 0.35 / notes.length;

  notes.forEach((f) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine'; osc1.frequency.value = f;
    osc2.type = 'sine'; osc2.frequency.value = f * 2.76; // FM metallic ring

    const env = ctx.createGain();
    env.gain.setValueAtTime(1.0, 0);
    env.gain.exponentialRampToValueAtTime(0.001, duration);

    osc1.connect(env); osc2.connect(env);
    env.connect(master);
    osc1.start(0); osc2.start(0);
    osc1.stop(duration); osc2.stop(duration);
  });

  master.connect(ctx.destination);
  return ctx.startRendering();
}

/** Reverse Cymbal Swell */
async function synthesizeReverseCymbal(sr: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);
  const len = Math.floor(sr * duration);
  const nBuf = ctx.createBuffer(1, len, sr);
  const data = nBuf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    // Reverse exponential ramp
    const alpha = i / len;
    data[i] = (Math.random() * 2 - 1) * Math.pow(alpha, 3);
  }
  const nSrc = ctx.createBufferSource();
  nSrc.buffer = nBuf;

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 4500;

  nSrc.connect(hpf);
  hpf.connect(ctx.destination);
  nSrc.start(0);
  nSrc.stop(duration);

  return ctx.startRendering();
}

/** Sub Bass Glide */
async function synthesizeSubGlide(sr: number, startFreq: number, endFreq: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, 0);
  osc.frequency.exponentialRampToValueAtTime(endFreq, duration * 0.4);

  const env = ctx.createGain();
  env.gain.setValueAtTime(1.0, 0);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(env);
  env.connect(ctx.destination);
  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** Piano Chord Hit */
async function synthesizePianoChord(sr: number, notes: number[], duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);
  const master = ctx.createGain();
  master.gain.value = 0.5 / notes.length;

  notes.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.8, 0);
    env.gain.exponentialRampToValueAtTime(0.001, duration);

    osc.connect(env);
    env.connect(master);
    osc.start(0);
    osc.stop(duration);
  });

  master.connect(ctx.destination);
  return ctx.startRendering();
}

/** Stadium Double Clap with slapback */
async function synthesizeStadiumClap(sr: number): Promise<AudioBuffer> {
  const duration = 0.4;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const len = Math.floor(sr * duration);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 1300;
  bpf.Q.value = 1.2;

  const env = ctx.createGain();
  // 3 quick pre-claps then giant slap
  [0, 0.015, 0.035].forEach((t) => {
    env.gain.setValueAtTime(0.6, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.01);
  });
  env.gain.setValueAtTime(1.0, 0.055);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  src.connect(bpf);
  bpf.connect(env);
  env.connect(ctx.destination);

  src.start(0);
  src.stop(duration);

  return ctx.startRendering();
}

/** Tambourine */
async function synthesizeTambourine(sr: number): Promise<AudioBuffer> {
  const duration = 0.18;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const len = Math.floor(sr * duration);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 6500;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.1, 0);
  env.gain.linearRampToValueAtTime(0.8, 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  src.connect(hpf);
  hpf.connect(env);
  env.connect(ctx.destination);

  src.start(0);
  src.stop(duration);

  return ctx.startRendering();
}

/** Industrial Anvil / Clang */
async function synthesizeAnvilClang(sr: number): Promise<AudioBuffer> {
  const duration = 0.35;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = 'square'; osc1.frequency.value = 840;
  osc2.type = 'triangle'; osc2.frequency.value = 1760;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 1200;
  bpf.Q.value = 6.0;

  const env = ctx.createGain();
  env.gain.setValueAtTime(1.0, 0);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  osc1.connect(bpf); osc2.connect(bpf);
  bpf.connect(env);
  env.connect(ctx.destination);

  osc1.start(0); osc2.start(0);
  osc1.stop(duration); osc2.stop(duration);

  return ctx.startRendering();
}

/** Fuzz Bass Guitar */
async function synthesizeFuzzBass(sr: number, freq: number): Promise<AudioBuffer> {
  const duration = 0.45;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, 0);

  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(512);
  for (let i = 0; i < 512; i++) {
    const x = (i / 256) - 1;
    curve[i] = Math.max(-0.7, Math.min(0.7, x * 4.0)); // Hard fuzz clip
  }
  shaper.curve = curve;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 850;

  const env = ctx.createGain();
  env.gain.setValueAtTime(1.0, 0);
  env.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(shaper);
  shaper.connect(lpf);
  lpf.connect(env);
  env.connect(ctx.destination);

  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** Punchy Snare */
async function synthesizePunchSnare(sr: number): Promise<AudioBuffer> {
  const duration = 0.22;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, 0);
  osc.frequency.exponentialRampToValueAtTime(130, 0.08);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.7, 0);
  oscGain.gain.exponentialRampToValueAtTime(0.001, 0.12);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  const bufferSize = Math.floor(sr * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sr);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1200, 0);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.9, 0);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, duration);

  noiseSource.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  osc.start(0); noiseSource.start(0);
  osc.stop(0.12); noiseSource.stop(duration);

  return ctx.startRendering();
}

/** Punch Kick */
async function synthesizePunchKick(sr: number, startFreq: number, endFreq: number, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, 0);
  osc.frequency.exponentialRampToValueAtTime(endFreq, 0.06);
  osc.frequency.exponentialRampToValueAtTime(endFreq * 0.7, duration);

  gain.gain.setValueAtTime(1.0, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(duration);

  return ctx.startRendering();
}

/** 808 Style Pitch-Dropped Kick */
async function synthesizeKick(sr: number): Promise<AudioBuffer> {
  return synthesizePunchKick(sr, 140, 42, 0.45);
}

/** Punchy Snare */
async function synthesizeSnare(sr: number): Promise<AudioBuffer> {
  return synthesizePunchSnare(sr);
}

/** Metallic Hi-Hat */
async function synthesizeHat(sr: number, open: boolean, cutoff: number = 7500): Promise<AudioBuffer> {
  const duration = open ? 0.35 : 0.06;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

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
  bpf.frequency.setValueAtTime(cutoff, 0);
  bpf.Q.setValueAtTime(2.5, 0);

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.setValueAtTime(cutoff + 500, 0);

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
async function synthesizeClap(sr: number, filterFreq: number = 1200): Promise<AudioBuffer> {
  const duration = 0.28;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const bufferSize = Math.floor(sr * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sr);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(filterFreq, 0);
  bpf.Q.setValueAtTime(1.2, 0);

  const env = ctx.createGain();
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
async function synthesizeTom(sr: number, pitch: number, duration: number = 0.32): Promise<AudioBuffer> {
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
async function synthesizeCrash(sr: number, duration: number = 0.8): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const bufferSize = Math.floor(sr * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sr);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

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
  osc1.type = 'sine'; osc1.frequency.setValueAtTime(2200, 0);
  osc2.type = 'triangle'; osc2.frequency.setValueAtTime(3450, 0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc1.connect(gain); osc2.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(0); osc2.start(0);
  osc1.stop(duration); osc2.stop(duration);

  return ctx.startRendering();
}

/** Perc Shaker */
async function synthesizeShaker(sr: number): Promise<AudioBuffer> {
  const duration = 0.07;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const bufferSize = Math.floor(sr * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sr);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

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
  osc1.type = 'square'; osc1.frequency.setValueAtTime(540, 0);
  osc2.type = 'square'; osc2.frequency.setValueAtTime(800, 0);

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(700, 0);
  bpf.Q.setValueAtTime(2.5, 0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, duration);

  osc1.connect(bpf); osc2.connect(bpf);
  bpf.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(0); osc2.start(0);
  osc1.stop(duration); osc2.stop(duration);

  return ctx.startRendering();
}

/** Deep Sub Bass Note */
async function synthesizeSubBass(sr: number, pitch: number = 32.7, duration: number = 0.7): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * duration), sr);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch, 0);

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

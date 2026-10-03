import os
import subprocess
import numpy as np
from scipy.io import wavfile

SAMPLE_RATE = 44100

def run_cmd(cmd):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error running cmd: {cmd}\n{res.stderr}")

def generate_vocal_sample(voice, text, out_wav, rate=180, pitch_shift=1.0):
    tmp_aiff = out_wav.replace(".wav", ".aiff")
    # Use macOS say command with specific voice and speaking rate
    cmd = f'say -v "{voice}" -r {rate} -o "{tmp_aiff}" "{text}"'
    run_cmd(cmd)
    
    if os.path.exists(tmp_aiff):
        cmd_convert = f'afconvert -f WAVE -d LEI16 "{tmp_aiff}" "{out_wav}"'
        run_cmd(cmd_convert)
        if os.path.exists(tmp_aiff):
            os.remove(tmp_aiff)
        
        # Read wav and apply normalize and trim silence
        sr, data = wavfile.read(out_wav)
        if data.ndim > 1:
            data = data.mean(axis=1)
        data = data.astype(np.float32)
        
        # Find start and end where signal exceeds threshold
        abs_data = np.abs(data)
        thresh = np.max(abs_data) * 0.03
        indices = np.where(abs_data > thresh)[0]
        if len(indices) > 0:
            start = max(0, indices[0] - int(sr * 0.02))
            end = min(len(data), indices[-1] + int(sr * 0.05))
            data = data[start:end]
            
        # Normalize
        peak = np.max(np.abs(data))
        if peak > 0:
            data = (data / peak) * 0.95
            
        # Fade out end 20ms
        fade_len = int(sr * 0.02)
        if len(data) > fade_len:
            data[-fade_len:] *= np.linspace(1.0, 0.0, fade_len)
            
        int_data = (data * 32767).astype(np.int16)
        wavfile.write(out_wav, sr, int_data)
        print(f"Generated vocal: {out_wav} ({len(int_data)/sr:.2f}s)")

# ---------------------------------------------------------------------------
# Generate Vocal Chops & Lyrics
# ---------------------------------------------------------------------------
def generate_all_vocals():
    # 1. Flashing Lights Vocals
    fl_dir = "apps/studio/public/audio/vocals/flashing_lights"
    fl_vocals = [
        ("fl_vocal_0", "Samantha", "Flashing", 140),
        ("fl_vocal_1", "Samantha", "Lights", 140),
        ("fl_vocal_2", "Flo (English (US))", "She don't believe in shooting stars", 165),
        ("fl_vocal_3", "Flo (English (US))", "Inside our lives, until daylight", 165),
        ("fl_vocal_4", "Samantha", "Flashing lights, flashing lights", 160),
        ("fl_vocal_5", "Flo (English (US))", "Feeling like the only girl in the world", 165),
        ("fl_vocal_6", "Eddy (English (US))", "What you doing in the club on a Thursday?", 180),
        ("fl_vocal_7", "Eddy (English (US))", "She say she only here for her girl birthday", 185),
        ("fl_vocal_8", "Eddy (English (US))", "They ordered champagne but still look thirsty", 185),
        ("fl_vocal_9", "Eddy (English (US))", "Rock Forever 21 but just turned thirty", 185),
        ("fl_vocal_10", "Eddy (English (US))", "I know I was wrong, but you ain't got to call your friends", 190),
        ("fl_vocal_11", "Eddy (English (US))", "Tell them you done with me", 180),
        ("fl_vocal_12", "Whisper", "Flashing lights", 130),
        ("fl_vocal_13", "Samantha", "Hey! Hey! Hey!", 170),
        ("fl_vocal_14", "Flo (English (US))", "Do you know what it means to make your dreams come true?", 175),
        ("fl_vocal_15", "Samantha", "Until daylight!", 150)
    ]
    for vid, voice, text, rate in fl_vocals:
        generate_vocal_sample(voice, text, os.path.join(fl_dir, f"{vid}.wav"), rate=rate)

    # 2. POWER Vocals
    pow_dir = "apps/studio/public/audio/vocals/power"
    pow_vocals = [
        ("pow_vocal_0", "Rocko (English (US))", "No one man should have all that power", 175),
        ("pow_vocal_1", "Rocko (English (US))", "The clock's ticking, I just count the hours", 175),
        ("pow_vocal_2", "Rocko (English (US))", "Stop tripping, I'm tripping off the powder", 175),
        ("pow_vocal_3", "Rocko (English (US))", "Till then, fuck that, the world's ours", 175),
        ("pow_vocal_4", "Rocko (English (US))", "And then they, and then they, and then they...", 180),
        ("pow_vocal_5", "Bad News", "21st Century Schizoid Man!", 140),
        ("pow_vocal_6", "Rocko (English (US))", "HEY!", 200),
        ("pow_vocal_7", "Rocko (English (US))", "HAH!", 200),
        ("pow_vocal_8", "Eddy (English (US))", "I guess every superhero need his theme music", 185),
        ("pow_vocal_9", "Rocko (English (US))", "POWER!", 160),
        ("pow_vocal_10", "Eddy (English (US))", "Screams from the haters got a nice ring to it", 180),
        ("pow_vocal_11", "Eddy (English (US))", "I guess every superhero need his theme music", 180),
        ("pow_vocal_12", "Zarvox", "21st Century!", 150),
        ("pow_vocal_13", "Zarvox", "Schizoid Man!", 150),
        ("pow_vocal_14", "Rocko (English (US))", "No one man should have all that power!", 180),
        ("pow_vocal_15", "Eddy (English (US))", "Got the power to make your life so exciting!", 180)
    ]
    for vid, voice, text, rate in pow_vocals:
        generate_vocal_sample(voice, text, os.path.join(pow_dir, f"{vid}.wav"), rate=rate)

    # 3. Runaway Vocals
    run_dir = "apps/studio/public/audio/vocals/runaway"
    run_vocals = [
        ("run_vocal_0", "Rocko (English (US))", "Look at ya, look at ya, look at ya!", 190),
        ("run_vocal_1", "Eddy (English (US))", "Ladies and gentlemen...", 150),
        ("run_vocal_2", "Rocko (English (US))", "And I always find, yeah I always find something wrong", 165),
        ("run_vocal_3", "Rocko (English (US))", "You've been putting up with my shit just way too long", 165),
        ("run_vocal_4", "Rocko (English (US))", "I'm so gifted at finding what I don't like the most", 165),
        ("run_vocal_5", "Rocko (English (US))", "So I think it's time for us to have a toast", 165),
        ("run_vocal_6", "Rocko (English (US))", "Let's have a toast for the douchebags", 165),
        ("run_vocal_7", "Rocko (English (US))", "Let's have a toast for the assholes", 165),
        ("run_vocal_8", "Rocko (English (US))", "Let's have a toast for the scumbags", 165),
        ("run_vocal_9", "Rocko (English (US))", "Every one of them that I know", 165),
        ("run_vocal_10", "Rocko (English (US))", "Let's have a toast for the jerkoffs", 165),
        ("run_vocal_11", "Rocko (English (US))", "That'll never take work off", 165),
        ("run_vocal_12", "Rocko (English (US))", "Baby, I got a plan", 155),
        ("run_vocal_13", "Rocko (English (US))", "Run away as fast as you can!", 165),
        ("run_vocal_14", "Rocko (English (US))", "Run away from me, baby", 150),
        ("run_vocal_15", "Cellos", "Run away, yeah, run away!", 130)
    ]
    for vid, voice, text, rate in run_vocals:
        generate_vocal_sample(voice, text, os.path.join(run_dir, f"{vid}.wav"), rate=rate)

# ---------------------------------------------------------------------------
# Render Authentic Backing Instrumental Loops
# ---------------------------------------------------------------------------
def synthesize_drum_hit(sr, hit_type):
    if hit_type == "kick":
        dur = 0.35
        t = np.linspace(0, dur, int(sr * dur), False)
        freq = 130 * np.exp(-t * 22) + 45
        sig = np.sin(2 * np.pi * np.cumsum(freq) / sr) * np.exp(-t * 8)
        return sig
    elif hit_type == "snare":
        dur = 0.25
        t = np.linspace(0, dur, int(sr * dur), False)
        tone = np.sin(2 * np.pi * 220 * t) * np.exp(-t * 25)
        noise = (np.random.rand(len(t)) * 2 - 1) * np.exp(-t * 12)
        return tone * 0.4 + noise * 0.6
    elif hit_type == "clap":
        dur = 0.25
        t = np.linspace(0, dur, int(sr * dur), False)
        noise = np.random.rand(len(t)) * 2 - 1
        env = np.exp(-t * 15)
        # 3 micro impulses
        imp1 = np.exp(-((t - 0.01)**2) / 0.0001)
        imp2 = np.exp(-((t - 0.025)**2) / 0.0001)
        return noise * (env * 0.7 + imp1 * 0.5 + imp2 * 0.5)
    elif hit_type == "hat":
        dur = 0.06
        t = np.linspace(0, dur, int(sr * dur), False)
        noise = np.random.rand(len(t)) * 2 - 1
        return noise * np.exp(-t * 60)
    return np.zeros(100)

def generate_flashing_lights_instrumental():
    # 90 BPM, 4/4 time. 1 beat = 60/90 = 0.6667s. 4 bars (16 beats) = 10.6667s.
    bpm = 90
    beat_sec = 60.0 / bpm
    total_beats = 16
    total_duration = total_beats * beat_sec
    total_samples = int(SAMPLE_RATE * total_duration)
    mix = np.zeros(total_samples, dtype=np.float32)

    # 1. Four-on-the-floor electro Kick on every beat
    kick = synthesize_drum_hit(SAMPLE_RATE, "kick")
    for beat in range(total_beats):
        pos = int(beat * beat_sec * SAMPLE_RATE)
        end = min(total_samples, pos + len(kick))
        mix[pos:end] += kick[:end - pos] * 0.9

    # 2. Gated Snare & Disco Clap on beats 2, 4, 6, 8, 10, 12, 14, 16
    clap = synthesize_drum_hit(SAMPLE_RATE, "clap")
    snare = synthesize_drum_hit(SAMPLE_RATE, "snare")
    for beat in range(1, total_beats, 2):
        pos = int(beat * beat_sec * SAMPLE_RATE)
        end = min(total_samples, pos + len(clap))
        mix[pos:end] += (clap[:end - pos] * 0.6 + snare[:end - pos] * 0.5)

    # 3. 16th note sizzle Hi-Hats
    hat = synthesize_drum_hit(SAMPLE_RATE, "hat")
    for step in range(total_beats * 4):
        pos = int(step * (beat_sec / 4) * SAMPLE_RATE)
        end = min(total_samples, pos + len(hat))
        gain = 0.4 if (step % 2 == 0) else 0.25
        mix[pos:end] += hat[:end - pos] * gain

    # 4. Flashing Lights Iconic High Strings Ostinato Melody (F#5, E5, C#5, B4)
    # Notes in Hz: F#5=740, E5=659, C#5=554, B4=494
    string_notes = [
        (740, 0.0), (659, 0.5), (554, 1.0), (494, 1.5),
        (740, 2.0), (659, 2.5), (554, 3.0), (494, 3.5)
    ]
    for rep in range(2): # 2 blocks of 8 beats
        offset_beat = rep * 8
        for freq, b in string_notes:
            start_pos = int((offset_beat + b) * beat_sec * SAMPLE_RATE)
            dur = int(0.4 * SAMPLE_RATE)
            t = np.linspace(0, 0.4, dur, False)
            # Lush string ensemble (sawtooth + detuned saw + octave)
            saw1 = 2 * (t * freq - np.floor(0.5 + t * freq))
            saw2 = 2 * (t * freq * 1.004 - np.floor(0.5 + t * freq * 1.004))
            env = np.minimum(t / 0.02, 1.0) * np.exp(-t * 3.5)
            synth = (saw1 * 0.5 + saw2 * 0.5) * env * 0.35
            end = min(total_samples, start_pos + dur)
            mix[start_pos:end] += synth[:end - start_pos]

    # 5. French Electro Bass Pluck (F#1=46.25Hz, F#2=92.5Hz)
    for beat in range(total_beats):
        start_pos = int(beat * beat_sec * SAMPLE_RATE)
        dur = int(0.45 * SAMPLE_RATE)
        t = np.linspace(0, 0.45, dur, False)
        saw = 2 * (t * 92.5 - np.floor(0.5 + t * 92.5))
        sub = np.sin(2 * np.pi * 46.25 * t)
        env = np.exp(-t * 6.0)
        bass = (saw * 0.5 + sub * 0.6) * env * 0.6
        end = min(total_samples, start_pos + dur)
        mix[start_pos:end] += bass[:end - start_pos]

    # Normalize mix to -0.5 dB
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix = (mix / peak) * 0.94

    out_file = "apps/studio/public/audio/backing/flashing_lights_instrumental.wav"
    wavfile.write(out_file, SAMPLE_RATE, (mix * 32767).astype(np.int16))
    print(f"Generated backing: {out_file} ({total_duration:.2f}s, {bpm} BPM)")

def generate_power_instrumental():
    # 154 BPM, 1 beat = 60/154 = 0.3896s. 16 beats = 6.2338s loop.
    bpm = 154
    beat_sec = 60.0 / bpm
    total_beats = 16
    total_duration = total_beats * beat_sec
    total_samples = int(SAMPLE_RATE * total_duration)
    mix = np.zeros(total_samples, dtype=np.float32)

    # 21st Century Schizoid Man Stomp Kick pattern: beat 0, 0.5, 2, 2.5, 4, 4.5, 6, 6.5
    kick = synthesize_drum_hit(SAMPLE_RATE, "kick")
    for beat in range(total_beats):
        if beat % 2 == 0:
            # Double kick
            for sub in [0.0, 0.5]:
                pos = int((beat + sub) * beat_sec * SAMPLE_RATE)
                end = min(total_samples, pos + len(kick))
                mix[pos:end] += kick[:end - pos] * 0.95

    # Heavy stadium handclap on beats 1, 3, 5, 7, 9, 11, 13, 15
    clap = synthesize_drum_hit(SAMPLE_RATE, "clap")
    for beat in range(1, total_beats, 2):
        pos = int(beat * beat_sec * SAMPLE_RATE)
        end = min(total_samples, pos + len(clap))
        mix[pos:end] += clap[:end - pos] * 0.85

    # Distorted Horn Fanfares (Bb and Db brass stabs) on beat 0 and beat 8
    for start_beat in [0, 8]:
        pos = int(start_beat * beat_sec * SAMPLE_RATE)
        dur = int(1.2 * SAMPLE_RATE)
        t = np.linspace(0, 1.2, dur, False)
        # Bb minor brass cluster (233Hz, 277Hz, 349Hz)
        brass = (np.sin(2 * np.pi * 233.08 * t) + np.sin(2 * np.pi * 277.18 * t) + np.sin(2 * np.pi * 349.23 * t)) / 3.0
        # Overdrive distortion
        brass = np.tanh(brass * 3.5) * np.exp(-t * 2.5) * 0.5
        end = min(total_samples, pos + dur)
        mix[pos:end] += brass[:end - pos]

    # Normalize
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix = (mix / peak) * 0.94

    out_file = "apps/studio/public/audio/backing/power_instrumental.wav"
    wavfile.write(out_file, SAMPLE_RATE, (mix * 32767).astype(np.int16))
    print(f"Generated backing: {out_file} ({total_duration:.2f}s, {bpm} BPM)")

def generate_runaway_instrumental():
    # 85 BPM, 1 beat = 60/85 = 0.7059s. 16 beats = 11.294s loop.
    bpm = 85
    beat_sec = 60.0 / bpm
    total_beats = 16
    total_duration = total_beats * beat_sec
    total_samples = int(SAMPLE_RATE * total_duration)
    mix = np.zeros(total_samples, dtype=np.float32)

    # 1. The High E Piano Note (E6=1318.5Hz) on beats 0, 1, 2, 3, 4, 5, 6, 7...
    dur_piano = int(0.9 * SAMPLE_RATE)
    tp = np.linspace(0, 0.9, dur_piano, False)
    # Acoustic piano harmonic model
    piano_sample = (
        np.sin(2 * np.pi * 1318.51 * tp) * 0.7 +
        np.sin(2 * np.pi * 2637.0 * tp) * 0.2 +
        np.sin(2 * np.pi * 3955.5 * tp) * 0.08
    ) * np.exp(-tp * 3.2)
    # Add hammer transient
    hammer = np.random.rand(int(SAMPLE_RATE * 0.01)) * np.exp(-np.linspace(0, 1, int(SAMPLE_RATE * 0.01)) * 10)
    piano_sample[:len(hammer)] += hammer * 0.4

    for beat in range(total_beats):
        pos = int(beat * beat_sec * SAMPLE_RATE)
        end = min(total_samples, pos + dur_piano)
        mix[pos:end] += piano_sample[:end - pos] * 0.75

    # 2. Room-shaking Distorted 808 Sub Drop on beat 8 (start of second half)
    dur_808 = int(2.5 * SAMPLE_RATE)
    t8 = np.linspace(0, 2.5, dur_808, False)
    freq_808 = 41.2 * np.exp(-t8 * 0.5)
    sub = np.sin(2 * np.pi * np.cumsum(freq_808) / SAMPLE_RATE)
    sub_dist = np.tanh(sub * 3.0) * np.exp(-t8 * 1.2) * 0.8
    pos_808 = int(8 * beat_sec * SAMPLE_RATE)
    end_808 = min(total_samples, pos_808 + dur_808)
    mix[pos_808:end_808] += sub_dist[:end_808 - pos_808]

    # 3. Hip-hop Snare & Rim on beat 9, 11, 13, 15
    snare = synthesize_drum_hit(SAMPLE_RATE, "snare")
    for beat in [9, 11, 13, 15]:
        pos = int(beat * beat_sec * SAMPLE_RATE)
        end = min(total_samples, pos + len(snare))
        mix[pos:end] += snare[:end - pos] * 0.65

    # Normalize
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix = (mix / peak) * 0.94

    out_file = "apps/studio/public/audio/backing/runaway_instrumental.wav"
    wavfile.write(out_file, SAMPLE_RATE, (mix * 32767).astype(np.int16))
    print(f"Generated backing: {out_file} ({total_duration:.2f}s, {bpm} BPM)")

if __name__ == "__main__":
    print("Synthesizing Kanye West backing instrumentals and vocal chops...")
    generate_flashing_lights_instrumental()
    generate_power_instrumental()
    generate_runaway_instrumental()
    generate_all_vocals()
    print("All audio assets generated successfully!")

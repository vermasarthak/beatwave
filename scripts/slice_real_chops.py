#!/usr/bin/env python3
"""
Slices authentic Kanye West studio stems into MPC pad vocal chops.
Normalizes and applies anti-click envelopes.
"""
import os
import subprocess
import numpy as np
from scipy.io import wavfile

ROOT = "/Users/sarthak/.gemini/antigravity/scratch/beatwave"
PUBLIC_VOCALS = os.path.join(ROOT, "apps/studio/public/audio/vocals")

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def process_and_save(audio_data, rate, start_sec, end_sec, out_path, normalize_db=-0.5, fade_in_ms=8, fade_out_ms=25):
    start_sample = max(0, int(start_sec * rate))
    end_sample = min(len(audio_data), int(end_sec * rate))
    
    slice_data = audio_data[start_sample:end_sample].copy()
    if slice_data.ndim > 1:
        # Convert to mono or keep stereo? MPC samples are great in stereo, but let's keep stereo
        channels = slice_data.shape[1]
    else:
        channels = 1
        slice_data = slice_data[:, np.newaxis]
        
    slice_float = slice_data.astype(np.float64) / 32768.0
    
    # Anti-click fades
    fade_in_len = int((fade_in_ms / 1000.0) * rate)
    fade_out_len = int((fade_out_ms / 1000.0) * rate)
    
    if len(slice_float) > fade_in_len:
        fade_in = np.linspace(0.0, 1.0, fade_in_len)[:, np.newaxis]
        slice_float[:fade_in_len] *= fade_in
        
    if len(slice_float) > fade_out_len:
        fade_out = np.linspace(1.0, 0.0, fade_out_len)[:, np.newaxis]
        slice_float[-fade_out_len:] *= fade_out

    # Normalize to target dB
    peak = np.max(np.abs(slice_float))
    if peak > 1e-4:
        target_amp = 10.0 ** (normalize_db / 20.0)
        slice_float = slice_float * (target_amp / peak)
        
    slice_int16 = np.clip(slice_float * 32767.0, -32768, 32767).astype(np.int16)
    if channels == 1:
        slice_int16 = slice_int16.squeeze(1)
        
    wavfile.write(out_path, rate, slice_int16)
    print(f"  ✓ Saved {os.path.basename(out_path)} ({len(slice_int16)/rate:.2f}s, peak {peak:.3f})")

def main():
    print("=== Processing Kanye West Authentic MPC Stems ===")

    # 1. RUNAWAY
    runaway_dir = os.path.join(PUBLIC_VOCALS, "runaway")
    ensure_dir(runaway_dir)
    print("\n--- Slicing Runaway Stems ---")
    rate_run, data_run = wavfile.read(os.path.join(ROOT, "scratch_runaway_vox.wav"))
    rate_look, data_look = wavfile.read(os.path.join(ROOT, "scratch_look_at_ya.wav"))

    # Pad 0: Crisp isolated Rick James "Look at ya!"
    process_and_save(data_look, rate_look, 0.45, 1.60, os.path.join(runaway_dir, "run_vocal_0.wav"))
    # Pad 1: "Ladies and gentlemen... Look at ya!"
    process_and_save(data_run, rate_run, 5.15, 6.80, os.path.join(runaway_dir, "run_vocal_1.wav"))
    # Pad 2: "And I always find, always find something wrong"
    process_and_save(data_run, rate_run, 26.50, 34.20, os.path.join(runaway_dir, "run_vocal_2.wav"))
    # Pad 3: "You've been putting up with my shit just way too long"
    process_and_save(data_run, rate_run, 34.20, 38.00, os.path.join(runaway_dir, "run_vocal_3.wav"))
    # Pad 4: "I'm so gifted at finding what I don't like the most"
    process_and_save(data_run, rate_run, 38.00, 44.50, os.path.join(runaway_dir, "run_vocal_4.wav"))
    # Pad 5: "So I think it's time for us to have a toast"
    process_and_save(data_run, rate_run, 44.50, 47.50, os.path.join(runaway_dir, "run_vocal_5.wav"))
    # Pad 6: "Let's have a toast for the douchebags"
    process_and_save(data_run, rate_run, 47.50, 50.40, os.path.join(runaway_dir, "run_vocal_6.wav"))
    # Pad 7: "Let's have a toast for the assholes"
    process_and_save(data_run, rate_run, 50.40, 53.40, os.path.join(runaway_dir, "run_vocal_7.wav"))
    # Pad 8: "Let's have a toast for the scumbags"
    process_and_save(data_run, rate_run, 53.40, 56.40, os.path.join(runaway_dir, "run_vocal_8.wav"))
    # Pad 9: "Every one of them that I know"
    process_and_save(data_run, rate_run, 56.40, 59.40, os.path.join(runaway_dir, "run_vocal_9.wav"))
    # Pad 10: "Let's have a toast for the jerkoffs"
    process_and_save(data_run, rate_run, 59.40, 62.80, os.path.join(runaway_dir, "run_vocal_10.wav"))
    # Pad 11: "That'll never take work off"
    process_and_save(data_run, rate_run, 62.80, 66.80, os.path.join(runaway_dir, "run_vocal_11.wav"))
    # Pad 12: "Baby, I got a plan"
    process_and_save(data_run, rate_run, 66.80, 70.80, os.path.join(runaway_dir, "run_vocal_12.wav"))
    # Pad 13: "Run away as fast as you can!"
    process_and_save(data_run, rate_run, 70.80, 75.00, os.path.join(runaway_dir, "run_vocal_13.wav"))
    # Pad 14: "Run away from me baby, run away!"
    process_and_save(data_run, rate_run, 75.00, 81.00, os.path.join(runaway_dir, "run_vocal_14.wav"))
    # Pad 15: Outro Vocoder Solo
    process_and_save(data_run, rate_run, 260.00, 268.00, os.path.join(runaway_dir, "run_vocal_15.wav"))

    # 2. FLASHING LIGHTS
    flashing_dir = os.path.join(PUBLIC_VOCALS, "flashing_lights")
    ensure_dir(flashing_dir)
    print("\n--- Slicing Flashing Lights Stems ---")
    rate_fl, data_fl = wavfile.read(os.path.join(ROOT, "scratch_flashing_vox.wav"))

    # Pad 0: "Flashing..."
    process_and_save(data_fl, rate_fl, 0.00, 4.20, os.path.join(flashing_dir, "fl_vocal_0.wav"))
    # Pad 1: "...Lights"
    process_and_save(data_fl, rate_fl, 4.50, 8.80, os.path.join(flashing_dir, "fl_vocal_1.wav"))
    # Pad 2: "She don't believe in shooting stars"
    process_and_save(data_fl, rate_fl, 20.00, 24.80, os.path.join(flashing_dir, "fl_vocal_2.wav"))
    # Pad 3: "Shoes and cars, wood floors in the new apartment"
    process_and_save(data_fl, rate_fl, 24.80, 29.50, os.path.join(flashing_dir, "fl_vocal_3.wav"))
    # Pad 4: "Flashing lights, flashing lights"
    process_and_save(data_fl, rate_fl, 9.80, 15.00, os.path.join(flashing_dir, "fl_vocal_4.wav"))
    # Pad 5: "Couture from the store's department"
    process_and_save(data_fl, rate_fl, 29.50, 34.50, os.path.join(flashing_dir, "fl_vocal_5.wav"))
    # Pad 6: "Feeling like Katrina with no FEMA"
    process_and_save(data_fl, rate_fl, 34.50, 39.50, os.path.join(flashing_dir, "fl_vocal_6.wav"))
    # Pad 7: "And the weather so breezy, man"
    process_and_save(data_fl, rate_fl, 40.00, 44.80, os.path.join(flashing_dir, "fl_vocal_7.wav"))
    # Pad 8: "Why can't life always be this easy?"
    process_and_save(data_fl, rate_fl, 45.00, 49.80, os.path.join(flashing_dir, "fl_vocal_8.wav"))
    # Pad 9: "She in the mirror dancin' so sleazy"
    process_and_save(data_fl, rate_fl, 49.80, 54.00, os.path.join(flashing_dir, "fl_vocal_9.wav"))
    # Pad 10: "I get a call like where are you Yeezy?"
    process_and_save(data_fl, rate_fl, 54.00, 58.50, os.path.join(flashing_dir, "fl_vocal_10.wav"))
    # Pad 11: "Try to hit you with the O-l-d W-A-P"
    process_and_save(data_fl, rate_fl, 58.50, 63.50, os.path.join(flashing_dir, "fl_vocal_11.wav"))
    # Pad 12: "Flashing lights (Whisper)"
    process_and_save(data_fl, rate_fl, 15.00, 19.50, os.path.join(flashing_dir, "fl_vocal_12.wav"))
    # Pad 13: "What you doin' in the club on a Thursday?"
    process_and_save(data_fl, rate_fl, 73.00, 77.50, os.path.join(flashing_dir, "fl_vocal_13.wav"))
    # Pad 14: "She say she only here for her girl birthday"
    process_and_save(data_fl, rate_fl, 77.50, 82.00, os.path.join(flashing_dir, "fl_vocal_14.wav"))
    # Pad 15: "Until daylight!"
    process_and_save(data_fl, rate_fl, 16.00, 20.00, os.path.join(flashing_dir, "fl_vocal_15.wav"))

    # 3. POWER
    power_dir = os.path.join(PUBLIC_VOCALS, "power")
    ensure_dir(power_dir)
    print("\n--- Slicing POWER Stems ---")
    rate_pow, data_pow = wavfile.read(os.path.join(ROOT, "scratch_power_vox.wav"))

    # Pad 0: "No one man should have all that POWER"
    process_and_save(data_pow, rate_pow, 24.50, 28.50, os.path.join(power_dir, "pow_vocal_0.wav"))
    # Pad 1: "The clock's ticking, I just count the hours"
    process_and_save(data_pow, rate_pow, 28.50, 31.80, os.path.join(power_dir, "pow_vocal_1.wav"))
    # Pad 2: "Stop trippin', I'm trippin' off the powder"
    process_and_save(data_pow, rate_pow, 31.80, 35.00, os.path.join(power_dir, "pow_vocal_2.wav"))
    # Pad 3: "'Til then, fuck that, the world's ours"
    process_and_save(data_pow, rate_pow, 35.00, 38.50, os.path.join(power_dir, "pow_vocal_3.wav"))
    # Pad 4: "And then they, and then they..."
    process_and_save(data_pow, rate_pow, 38.50, 42.00, os.path.join(power_dir, "pow_vocal_4.wav"))
    # Pad 5: "21st Century Schizoid Man!" (Chant scream)
    process_and_save(data_pow, rate_pow, 10.00, 14.50, os.path.join(power_dir, "pow_vocal_5.wav"))
    # Pad 6: "HEY!" (Tribal chant punch)
    process_and_save(data_pow, rate_pow, 1.20, 2.20, os.path.join(power_dir, "pow_vocal_6.wav"))
    # Pad 7: "HAH!" (Tribal chant grunt)
    process_and_save(data_pow, rate_pow, 3.20, 4.20, os.path.join(power_dir, "pow_vocal_7.wav"))
    # Pad 8: "I guess every superhero need his theme music"
    process_and_save(data_pow, rate_pow, 20.50, 24.50, os.path.join(power_dir, "pow_vocal_8.wav"))
    # Pad 9: "POWER!" (Scream hit)
    process_and_save(data_pow, rate_pow, 27.00, 28.50, os.path.join(power_dir, "pow_vocal_9.wav"))
    # Pad 10: "Screams from the haters, got a nice ring to it"
    process_and_save(data_pow, rate_pow, 17.50, 21.00, os.path.join(power_dir, "pow_vocal_10.wav"))
    # Pad 11: "Do it better than anybody you've ever seen"
    process_and_save(data_pow, rate_pow, 14.50, 18.00, os.path.join(power_dir, "pow_vocal_11.wav"))
    # Pad 12: "21st Century!"
    process_and_save(data_pow, rate_pow, 10.00, 12.50, os.path.join(power_dir, "pow_vocal_12.wav"))
    # Pad 13: "Schizoid Man!"
    process_and_save(data_pow, rate_pow, 12.50, 15.00, os.path.join(power_dir, "pow_vocal_13.wav"))
    # Pad 14: "All that power!"
    process_and_save(data_pow, rate_pow, 26.00, 28.50, os.path.join(power_dir, "pow_vocal_14.wav"))
    # Pad 15: "Make your life so exciting!"
    process_and_save(data_pow, rate_pow, 42.00, 46.50, os.path.join(power_dir, "pow_vocal_15.wav"))

    print("\nAll 48 authentic Kanye vocal chops generated successfully!")

if __name__ == '__main__':
    main()

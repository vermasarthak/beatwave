# Beatwave Audio Engine

The Beatwave Audio Engine (`@beatwave/audio-engine`) is built entirely on native Web Audio primitives (`AudioContext`, `AudioBufferSourceNode`, `GainNode`, `DynamicsCompressorNode`, `BiquadFilterNode`).

## Clock & Timing Architecture
- **Clock Source**: `AudioContext.currentTime` serves as the authoritative hardware clock. `performance.now()` is synchronized on boot and resumed upon user gesture to convert DOM timestamps to audio scheduling seconds.
- **Lookahead Scheduling**: A configurable 5ms lookahead buffer guarantees jitter-free sample starts even when the main JavaScript thread experiences temporary micro-spikes.
- **Quantization**: Supports `off`, `1/4`, `1/8`, and `1/16` subdivisions derived from current BPM. A swing parameter delays odd subdivisions.

## Built-In Procedural Drum & Synth Kit
Beatwave ships with a zero-asset, license-clean 16-pad drum and musical sound generator created entirely via `OfflineAudioContext` synthesis:
- **Pads 1-4**: 808 Deep Kick, Snare, Closed Hi-Hat (choke group 1), Open Hi-Hat (choke group 1)
- **Pads 5-8**: Stereo Clap, Wood Rimshot, Low Tom, High Tom
- **Pads 9-12**: Crash Cymbal, Ride Bell, Shaker, 808 Cowbell
- **Pads 13-16**: Sub Bass C1, FM Chord Cmin, FM Chord EbMaj, FM Chord Gmin

## Voice Pool & Choke Groups
- Maximum polyphony limit (default 32 voices) steals the oldest active voice if exceeded.
- Choke groups allow sounds like the closed hi-hat to immediately trigger a fast 10ms fade-out on any currently playing open hi-hat voice.

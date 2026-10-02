# Beatwave MIDI Controller Integration

Beatwave functions as a wireless, camera-driven MIDI controller via the Web MIDI API (`navigator.requestMIDIAccess`).

## Pad Triggers to MIDI Notes
- **Channel**: Configurable (default Channel 10 for drums or Channel 1 for melodic synths).
- **Strike Velocity**: Inward Z strike velocity ($v_z$) is mapped to MIDI velocity $1\text{--}127$.
- **General MIDI Drum Map**:
  - Pad 1: Note 36 (Bass Drum 1)
  - Pad 2: Note 38 (Acoustic Snare)
  - Pad 3: Note 42 (Closed Hi-Hat)
  - Pad 4: Note 46 (Open Hi-Hat)
  - Pads 5-16: Claps, toms, cymbals, percussion notes.

## Continuous Gestures to MIDI CC
- **Pinch Distance**: Mapped to CC 74 (Filter Cutoff). Tighter pinch opens or closes filter.
- **Vertical Hand Position**: Mapped to CC 11 (Expression) or CC 7 (Channel Volume).
- **Wrist Roll / Rotation**: Mapped to CC 1 (Modulation Wheel).

## Headless / Mock Fallback
In headless environments, browsers lacking Web MIDI support (such as Safari on iOS), or automated CI tests, Beatwave gracefully activates `MockMidiAdapter`, storing all emitted events in memory for validation.

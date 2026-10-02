# Beatwave Gesture Runtime: The Air-Tap State Machine

One of the central engineering challenges of mid-air musical interaction is eliminating false triggers without introducing perceptual latency.

## The PadFSM Lifecycle

Each of the 16 launchpad pads runs an independent deterministic finite state machine (FSM):

```
┌─────────┐
│ OUTSIDE │
└────┬────┘
     │ Fingertip enters 2D bounding rect
     ▼
┌─────────┐
│  HOVER  │
└────┬────┘
     │ Forward Z-velocity > v_min AND lateral speed < v_max AND Z <= Z_hover
     ▼
┌─────────┐
│  ARMED  │
└────┬────┘
     │ Penetrates virtual contact plane (Z <= Z_contact)
     ▼
┌─────────┐ ──► Emits StrikeEvent (exactly once)
│ STRIKE  │
└────┬────┘
     │ Instantaneous transition
     ▼
┌─────────┐
│  HELD   │
└────┬────┘
     │ Retracts past Z_contact + hysteresis OR exits pad bounds
     ▼
┌─────────┐
│ RELEASE │
└────┬────┘
     │ Cooldown timer set (default 80ms)
     ▼
┌──────────┐
│ COOLDOWN │ ──► Returns to HOVER or OUTSIDE after cooldown expiry
└──────────┘
```

## Anti-Jitter & Rejection Criteria
1. **Swipe Rejection**: Hand moving horizontally across the pad bank at high planar speed ($|v_{xy}| > 1.2\text{ palm units/sec}$) is rejected from arming.
2. **Contact Plane Hysteresis**: Once struck, a pad cannot release until the finger pulls back by at least $\Delta Z_{\text{hysteresis}} = 0.018$ palm units, preventing double triggers from hand tremor.
3. **Pinch Fallback**: When lighting or camera angle makes depth ambiguous, closing index tip (8) and thumb tip (4) within $0.055$ palm units triggers a high-reliability Pinch Strike.

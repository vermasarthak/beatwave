export type QuantizeValue = 'off' | '1/4' | '1/8' | '1/16';

export class Quantizer {
  constructor(
    public quantize: QuantizeValue = 'off',
    public bpm: number = 120,
    public swingPercent: number = 0 // 0..50%
  ) {}

  /**
   * Computes the scheduled audio time for a trigger.
   * If quantize is 'off', fires immediately at current audio time + lookahead.
   * Otherwise snaps to the nearest or next musical subdivision.
   */
  public computeScheduleTime(
    currentAudioTimeSec: number,
    transportStartTimeSec: number = 0,
    lookaheadBufferSec: number = 0.005
  ): number {
    if (this.quantize === 'off') {
      return currentAudioTimeSec + lookaheadBufferSec;
    }

    const divisionBeats = this.getDivisionBeats(this.quantize);
    const secondsPerBeat = 60 / this.bpm;
    const subdivisionSec = divisionBeats * secondsPerBeat;

    const elapsed = Math.max(0, currentAudioTimeSec - transportStartTimeSec);
    const subdivisionIndex = Math.ceil(elapsed / subdivisionSec);
    let targetTime = transportStartTimeSec + subdivisionIndex * subdivisionSec;

    // Apply swing on off-beats if 1/8 or 1/16
    if (this.swingPercent > 0 && (this.quantize === '1/8' || this.quantize === '1/16')) {
      const isOdd = subdivisionIndex % 2 === 1;
      if (isOdd) {
        targetTime += (this.swingPercent / 100) * (subdivisionSec * 0.5);
      }
    }

    // Must never schedule in the past
    return Math.max(targetTime, currentAudioTimeSec + lookaheadBufferSec);
  }

  private getDivisionBeats(q: QuantizeValue): number {
    switch (q) {
      case '1/4':
        return 1.0;
      case '1/8':
        return 0.5;
      case '1/16':
        return 0.25;
      default:
        return 0.25;
    }
  }
}

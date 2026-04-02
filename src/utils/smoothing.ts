import {HYSTERESIS_MS} from './constants';

export class PitchSmoother {
  private smoothedPitch: number | null = null;
  private lastNoteChange: number = 0;
  private lastMidiNote: number | null = null;

  // 0.7 = very responsive, lets 70% of new reading through each frame
  private readonly alpha = 0.7;

  reset() {
    this.smoothedPitch = null;
    this.lastNoteChange = 0;
    this.lastMidiNote = null;
  }

  smooth(rawPitch: number): number {
    if (this.smoothedPitch === null) {
      this.smoothedPitch = rawPitch;
    } else {
      // If the pitch jumped significantly (> 1 semitone), snap immediately
      const ratio = rawPitch / this.smoothedPitch;
      if (ratio > 1.06 || ratio < 0.94) {
        this.smoothedPitch = rawPitch;
      } else {
        this.smoothedPitch =
          this.alpha * rawPitch + (1 - this.alpha) * this.smoothedPitch;
      }
    }
    return this.smoothedPitch;
  }

  shouldSwitchNote(newMidiNote: number): boolean {
    const now = Date.now();

    if (this.lastMidiNote === null) {
      this.lastMidiNote = newMidiNote;
      this.lastNoteChange = now;
      return true;
    }

    if (newMidiNote === this.lastMidiNote) {
      return true;
    }

    if (now - this.lastNoteChange >= HYSTERESIS_MS) {
      this.lastMidiNote = newMidiNote;
      this.lastNoteChange = now;
      return true;
    }

    return false;
  }
}

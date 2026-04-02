import {HYSTERESIS_MS} from './constants';

/**
 * Two-stage smoothing:
 * - Light EMA on raw pitch for jitter reduction
 * - Hysteresis on note switching to prevent flicker between adjacent notes
 */
export class PitchSmoother {
  private smoothedPitch: number | null = null;
  private lastNoteChange: number = 0;
  private lastMidiNote: number | null = null;

  // Higher alpha = more responsive (0.55 is a good balance for web)
  private readonly alpha = 0.55;

  reset() {
    this.smoothedPitch = null;
    this.lastNoteChange = 0;
    this.lastMidiNote = null;
  }

  smooth(rawPitch: number): number {
    if (this.smoothedPitch === null) {
      this.smoothedPitch = rawPitch;
    } else {
      this.smoothedPitch =
        this.alpha * rawPitch + (1 - this.alpha) * this.smoothedPitch;
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

    // Same note — always allow (cents update is important)
    if (newMidiNote === this.lastMidiNote) {
      return true;
    }

    // Different note — apply hysteresis to prevent flicker
    if (now - this.lastNoteChange >= HYSTERESIS_MS) {
      this.lastMidiNote = newMidiNote;
      this.lastNoteChange = now;
      return true;
    }

    return false;
  }
}

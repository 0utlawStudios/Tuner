import {EMA_ALPHA, HYSTERESIS_MS} from './constants';

export class PitchSmoother {
  private smoothedPitch: number | null = null;
  private lastNoteChange: number = 0;
  private lastMidiNote: number | null = null;

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
        EMA_ALPHA * rawPitch + (1 - EMA_ALPHA) * this.smoothedPitch;
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
      return true; // Same note, no switch needed
    }

    // Hysteresis: only switch if enough time has passed
    if (now - this.lastNoteChange >= HYSTERESIS_MS) {
      this.lastMidiNote = newMidiNote;
      this.lastNoteChange = now;
      return true;
    }

    return false; // Suppress switch, keep showing previous note
  }

  getCurrentMidiNote(): number | null {
    return this.lastMidiNote;
  }
}

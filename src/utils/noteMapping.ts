import {A4_FREQUENCY, NOTE_NAMES, NoteName} from './constants';

export interface NoteInfo {
  name: NoteName;
  octave: number;
  cents: number;
  frequency: number;
  midiNote: number;
}

export function frequencyToNote(freq: number): NoteInfo {
  const semitones = 12 * Math.log2(freq / A4_FREQUENCY);
  const roundedSemitones = Math.round(semitones);
  const midiNote = roundedSemitones + 69;
  const cents = (semitones - roundedSemitones) * 100;
  const noteIndex = ((midiNote % 12) + 12) % 12;
  const name = NOTE_NAMES[noteIndex]!;
  const octave = Math.floor(midiNote / 12) - 1;

  return {name, octave, cents, frequency: freq, midiNote};
}

export function noteToFrequency(name: NoteName, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(name);
  const midiNote = noteIndex + (octave + 1) * 12;
  return A4_FREQUENCY * Math.pow(2, (midiNote - 69) / 12);
}

export function formatCents(cents: number): string {
  const rounded = Math.round(cents);
  if (rounded === 0) return '0¢';
  return rounded > 0 ? `+${rounded}¢` : `${rounded}¢`;
}

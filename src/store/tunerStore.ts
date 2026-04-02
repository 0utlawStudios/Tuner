import {create} from 'zustand';
import {NoteName} from '../utils/constants';
import {Instrument, instruments} from '../data/instruments';

export interface TunerState {
  // Instrument selection
  selectedInstrumentId: string;
  selectedInstrument: Instrument;
  setInstrument: (id: string) => void;

  // Pitch detection state
  isListening: boolean;
  setIsListening: (listening: boolean) => void;

  // Current detected note
  currentNote: NoteName | null;
  currentOctave: number | null;
  currentCents: number;
  currentFrequency: number;

  // Update pitch data
  updatePitch: (note: NoteName, octave: number, cents: number, frequency: number) => void;
  clearPitch: () => void;

  // Matched string (for instrument presets)
  matchedStringIndex: number | null;
  setMatchedString: (index: number | null) => void;
}

export const useTunerStore = create<TunerState>((set) => ({
  selectedInstrumentId: 'guitar',
  selectedInstrument: instruments[1], // guitar

  setInstrument: (id: string) => {
    const instrument = instruments.find(i => i.id === id) ?? instruments[0];
    set({selectedInstrumentId: id, selectedInstrument: instrument, matchedStringIndex: null});
  },

  isListening: false,
  setIsListening: (listening: boolean) => set({isListening: listening}),

  currentNote: null,
  currentOctave: null,
  currentCents: 0,
  currentFrequency: 0,

  updatePitch: (note, octave, cents, frequency) =>
    set({currentNote: note, currentOctave: octave, currentCents: cents, currentFrequency: frequency}),

  clearPitch: () =>
    set({currentNote: null, currentOctave: null, currentCents: 0, currentFrequency: 0, matchedStringIndex: null}),

  matchedStringIndex: null,
  setMatchedString: (index) => set({matchedStringIndex: index}),
}));

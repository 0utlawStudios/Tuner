import {create} from 'zustand';
import {NoteName} from '../utils/constants';
import {Instrument, instruments} from '../data/instruments';

export interface TunerState {
  selectedInstrumentId: string;
  selectedInstrument: Instrument;
  setInstrument: (id: string) => void;

  isListening: boolean;
  setIsListening: (listening: boolean) => void;

  currentNote: NoteName | null;
  currentOctave: number | null;
  currentCents: number;
  currentFrequency: number;

  updatePitch: (note: NoteName, octave: number, cents: number, frequency: number) => void;
  clearPitch: () => void;

  matchedStringIndex: number | null;
  setMatchedString: (index: number | null) => void;
}

export const useTunerStore = create<TunerState>((set) => ({
  selectedInstrumentId: 'guitar',
  selectedInstrument: instruments[1]!,

  setInstrument: (id: string) => {
    const instrument = instruments.find(i => i.id === id) ?? instruments[0]!;
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

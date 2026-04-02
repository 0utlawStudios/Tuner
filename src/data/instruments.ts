import {NoteName} from '../utils/constants';

export interface TuningNote {
  name: NoteName;
  octave: number;
  frequency: number;
  stringNumber: number; // 1 = highest pitch string
}

export interface Instrument {
  id: string;
  name: string;
  icon: string;
  tuning: TuningNote[];
}

export const instruments: Instrument[] = [
  {
    id: 'chromatic',
    name: 'Chromatic',
    icon: '🎵',
    tuning: [], // empty = detect any note
  },
  {
    id: 'guitar',
    name: 'Guitar',
    icon: '🎸',
    tuning: [
      {name: 'E', octave: 4, frequency: 329.63, stringNumber: 1},
      {name: 'B', octave: 3, frequency: 246.94, stringNumber: 2},
      {name: 'G', octave: 3, frequency: 196.0, stringNumber: 3},
      {name: 'D', octave: 3, frequency: 146.83, stringNumber: 4},
      {name: 'A', octave: 2, frequency: 110.0, stringNumber: 5},
      {name: 'E', octave: 2, frequency: 82.41, stringNumber: 6},
    ],
  },
  {
    id: 'bass',
    name: 'Bass',
    icon: '🎸',
    tuning: [
      {name: 'G', octave: 2, frequency: 98.0, stringNumber: 1},
      {name: 'D', octave: 2, frequency: 73.42, stringNumber: 2},
      {name: 'A', octave: 1, frequency: 55.0, stringNumber: 3},
      {name: 'E', octave: 1, frequency: 41.2, stringNumber: 4},
    ],
  },
  {
    id: 'ukulele',
    name: 'Ukulele',
    icon: '🪕',
    tuning: [
      {name: 'A', octave: 4, frequency: 440.0, stringNumber: 1},
      {name: 'E', octave: 4, frequency: 329.63, stringNumber: 2},
      {name: 'C', octave: 4, frequency: 261.63, stringNumber: 3},
      {name: 'G', octave: 4, frequency: 392.0, stringNumber: 4},
    ],
  },
  {
    id: 'violin',
    name: 'Violin',
    icon: '🎻',
    tuning: [
      {name: 'E', octave: 5, frequency: 659.25, stringNumber: 1},
      {name: 'A', octave: 4, frequency: 440.0, stringNumber: 2},
      {name: 'D', octave: 4, frequency: 293.66, stringNumber: 3},
      {name: 'G', octave: 3, frequency: 196.0, stringNumber: 4},
    ],
  },
];

export const getInstrumentById = (id: string): Instrument =>
  instruments.find(i => i.id === id) ?? instruments[0];

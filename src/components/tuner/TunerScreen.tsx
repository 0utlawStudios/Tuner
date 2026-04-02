import React, {useEffect} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {theme} from '../../theme/theme';
import {useTunerStore} from '../../store/tunerStore';
import {useTunerEngine} from '../../hooks/useTunerEngine';
import {TunerGauge} from './TunerGauge';
import {NoteDisplay} from './NoteDisplay';
import {CentsDisplay} from './CentsDisplay';
import {InTuneIndicator} from './InTuneIndicator';
import {WaveformDisplay} from '../waveform/WaveformDisplay';
import {InstrumentSelector} from '../instruments/InstrumentSelector';
import {StringIndicator} from '../instruments/StringIndicator';

// Shallow selectors — each component only subscribes to what it needs
const selectCurrentNote = (s: ReturnType<typeof useTunerStore.getState>) => s.currentNote;
const selectCurrentOctave = (s: ReturnType<typeof useTunerStore.getState>) => s.currentOctave;
const selectCurrentCents = (s: ReturnType<typeof useTunerStore.getState>) => s.currentCents;
const selectCurrentFrequency = (s: ReturnType<typeof useTunerStore.getState>) => s.currentFrequency;
const selectIsListening = (s: ReturnType<typeof useTunerStore.getState>) => s.isListening;

export function TunerScreen() {
  const currentNote = useTunerStore(selectCurrentNote);
  const currentOctave = useTunerStore(selectCurrentOctave);
  const currentCents = useTunerStore(selectCurrentCents);
  const currentFrequency = useTunerStore(selectCurrentFrequency);
  const isListening = useTunerStore(selectIsListening);

  const {start, stop} = useTunerEngine();

  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, [start, stop]);

  const isActive = isListening && currentNote !== null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* In-tune glow background */}
      <InTuneIndicator cents={currentCents} isActive={isActive} />

      {/* Waveform at top */}
      <View style={styles.waveformSection}>
        <WaveformDisplay frequency={currentFrequency} isActive={isActive} />
      </View>

      {/* Gauge */}
      <View style={styles.gaugeSection}>
        <TunerGauge cents={currentCents} isActive={isActive} />
      </View>

      {/* Note display */}
      <View style={styles.noteSection}>
        <NoteDisplay
          note={currentNote}
          octave={currentOctave}
          cents={currentCents}
          isActive={isActive}
        />
        <CentsDisplay
          cents={currentCents}
          frequency={currentFrequency}
          isActive={isActive}
        />
      </View>

      {/* String indicator */}
      <View style={styles.stringsSection}>
        <StringIndicator />
      </View>

      {/* Instrument selector at bottom */}
      <View style={styles.instrumentSection}>
        <InstrumentSelector />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingBottom: 40,
  },
  waveformSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  gaugeSection: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  noteSection: {
    alignItems: 'center',
    gap: 8,
    marginTop: theme.spacing.md,
  },
  stringsSection: {
    marginTop: theme.spacing.xl,
  },
  instrumentSection: {
    marginTop: 'auto',
    paddingTop: theme.spacing.lg,
  },
});

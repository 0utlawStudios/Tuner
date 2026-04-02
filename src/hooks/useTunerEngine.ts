import {useCallback, useRef, useEffect} from 'react';
import {usePitchDetector} from './usePitchDetector';
import {useTunerStore} from '../store/tunerStore';
import {frequencyToNote} from '../utils/noteMapping';
import {PitchSmoother} from '../utils/smoothing';
import {IN_TUNE_THRESHOLD} from '../utils/constants';
import {TuningNote} from '../data/instruments';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export function useTunerEngine() {
  const smoother = useRef(new PitchSmoother()).current;
  const wasInTune = useRef(false);

  // Use refs for store actions to avoid recreating callbacks on every render
  const updatePitchRef = useRef(useTunerStore.getState().updatePitch);
  const clearPitchRef = useRef(useTunerStore.getState().clearPitch);
  const setMatchedStringRef = useRef(useTunerStore.getState().setMatchedString);
  const setIsListeningRef = useRef(useTunerStore.getState().setIsListening);

  // Keep action refs current without triggering re-renders
  useEffect(() => {
    return useTunerStore.subscribe(state => {
      updatePitchRef.current = state.updatePitch;
      clearPitchRef.current = state.clearPitch;
      setMatchedStringRef.current = state.setMatchedString;
      setIsListeningRef.current = state.setIsListening;
    });
  }, []);

  // Stable ref for the selected instrument to avoid handlePitch dependency churn
  const selectedInstrumentRef = useRef(useTunerStore.getState().selectedInstrument);
  useEffect(() => {
    return useTunerStore.subscribe(state => {
      selectedInstrumentRef.current = state.selectedInstrument;
    });
  }, []);

  // findClosestString reads from ref — no dependency on selectedInstrument in the closure
  const findClosestString = useCallback((frequency: number): number | null => {
    const tuning = selectedInstrumentRef.current.tuning;
    if (tuning.length === 0) return null;

    let closestIndex = 0;
    let closestDist = Infinity;

    tuning.forEach((note: TuningNote, index: number) => {
      const dist = Math.abs(12 * Math.log2(frequency / note.frequency));
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = index;
      }
    });

    return closestDist <= 3 ? closestIndex : null;
  }, []); // stable — reads selectedInstrumentRef at call time

  const handlePitch = useCallback(
    (rawPitch: number) => {
      const smoothedPitch = smoother.smooth(rawPitch);
      const noteInfo = frequencyToNote(smoothedPitch);

      if (!smoother.shouldSwitchNote(noteInfo.midiNote)) {
        return;
      }

      updatePitchRef.current(noteInfo.name, noteInfo.octave, noteInfo.cents, smoothedPitch);

      const stringIdx = findClosestString(smoothedPitch);
      setMatchedStringRef.current(stringIdx);

      const isInTune = Math.abs(noteInfo.cents) <= IN_TUNE_THRESHOLD;
      if (isInTune && !wasInTune.current) {
        ReactNativeHapticFeedback.trigger('impactLight');
      }
      wasInTune.current = isInTune;
    },
    [smoother, findClosestString],
  );

  const {start: startDetector, stop: stopDetector} = usePitchDetector({
    onPitch: handlePitch,
  });

  const start = useCallback(async () => {
    smoother.reset();
    wasInTune.current = false;
    await startDetector();
    setIsListeningRef.current(true);
  }, [startDetector, smoother]);

  const stop = useCallback(async () => {
    await stopDetector();
    setIsListeningRef.current(false);
    clearPitchRef.current();
    smoother.reset();
  }, [stopDetector, smoother]);

  useEffect(() => {
    return () => {
      stopDetector();
    };
  }, [stopDetector]);

  return {start, stop};
}

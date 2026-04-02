import { useTunerStore } from '../../store/tunerStore';
import { useMemo } from 'react';
import { IN_TUNE_THRESHOLD, CLOSE_THRESHOLD } from '../../utils/constants';
import { theme } from '../../theme/theme';
import styles from './NoteDisplay.module.css';

export function NoteDisplay() {
  const currentNote = useTunerStore(s => s.currentNote);
  const currentOctave = useTunerStore(s => s.currentOctave);
  const currentCents = useTunerStore(s => s.currentCents);

  const noteColor = useMemo(() => {
    if (!currentNote) return theme.colors.textDim;
    const absCents = Math.abs(currentCents);
    if (absCents <= IN_TUNE_THRESHOLD) return theme.colors.inTune;
    if (absCents <= CLOSE_THRESHOLD) return theme.colors.close;
    return theme.colors.sharp;
  }, [currentNote, currentCents]);

  return (
    <div className={styles.container}>
      <span className={styles.note} style={{ color: noteColor }}>
        {currentNote ?? '—'}
      </span>
      {currentOctave !== null && (
        <span className={styles.octave}>{currentOctave}</span>
      )}
    </div>
  );
}

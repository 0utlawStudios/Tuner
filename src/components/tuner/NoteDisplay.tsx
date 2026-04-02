import { useTunerStore } from '../../store/tunerStore';
import { useMemo } from 'react';
import { IN_TUNE_THRESHOLD, CLOSE_THRESHOLD } from '../../utils/constants';
import styles from './NoteDisplay.module.css';

export function NoteDisplay() {
  const currentNote = useTunerStore(s => s.currentNote);
  const currentOctave = useTunerStore(s => s.currentOctave);
  const currentCents = useTunerStore(s => s.currentCents);

  const noteColor = useMemo(() => {
    if (!currentNote) return 'rgba(255,255,255,0.12)';
    const a = Math.abs(currentCents);
    if (a <= IN_TUNE_THRESHOLD) return '#00FFB2';
    if (a <= CLOSE_THRESHOLD) return '#FFD700';
    return '#FF4466';
  }, [currentNote, currentCents]);

  return (
    <div className={styles.container}>
      <span className={styles.note} style={{ color: noteColor }}>
        {currentNote ?? '—'}
      </span>
      {currentOctave !== null && (
        <span className={styles.octave} style={{ color: noteColor + '50' }}>{currentOctave}</span>
      )}
    </div>
  );
}

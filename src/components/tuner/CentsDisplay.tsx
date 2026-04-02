import { useTunerStore } from '../../store/tunerStore';
import { formatCents } from '../../utils/noteMapping';
import { useMemo } from 'react';
import { IN_TUNE_THRESHOLD, CLOSE_THRESHOLD } from '../../utils/constants';
import styles from './CentsDisplay.module.css';

export function CentsDisplay() {
  const currentNote = useTunerStore(s => s.currentNote);
  const currentCents = useTunerStore(s => s.currentCents);

  const color = useMemo(() => {
    if (!currentNote) return 'rgba(255,255,255,0.15)';
    const a = Math.abs(currentCents);
    if (a <= IN_TUNE_THRESHOLD) return 'rgba(0,255,178,0.6)';
    if (a <= CLOSE_THRESHOLD) return 'rgba(255,215,0,0.6)';
    return 'rgba(255,68,102,0.6)';
  }, [currentNote, currentCents]);

  return (
    <div className={styles.cents} style={{ color }}>
      {currentNote ? formatCents(currentCents) : 'Play a note...'}
    </div>
  );
}

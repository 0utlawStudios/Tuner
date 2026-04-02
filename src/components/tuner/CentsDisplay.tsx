import { useTunerStore } from '../../store/tunerStore';
import { formatCents } from '../../utils/noteMapping';
import { useMemo } from 'react';
import { IN_TUNE_THRESHOLD, CLOSE_THRESHOLD } from '../../utils/constants';
import { theme } from '../../theme/theme';
import styles from './CentsDisplay.module.css';

export function CentsDisplay() {
  const currentNote = useTunerStore(s => s.currentNote);
  const currentCents = useTunerStore(s => s.currentCents);

  const color = useMemo(() => {
    if (!currentNote) return theme.colors.textDim;
    const absCents = Math.abs(currentCents);
    if (absCents <= IN_TUNE_THRESHOLD) return theme.colors.inTune;
    if (absCents <= CLOSE_THRESHOLD) return theme.colors.close;
    return theme.colors.sharp;
  }, [currentNote, currentCents]);

  if (!currentNote) {
    return <div className={styles.cents} style={{ color: theme.colors.textDim }}>Play a note...</div>;
  }

  return (
    <div className={styles.cents} style={{ color }}>
      {formatCents(currentCents)}
    </div>
  );
}

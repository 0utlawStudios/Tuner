import { useTunerStore } from '../../store/tunerStore';
import { IN_TUNE_THRESHOLD } from '../../utils/constants';
import styles from './InTuneIndicator.module.css';

export function InTuneIndicator() {
  const currentNote = useTunerStore(s => s.currentNote);
  const currentCents = useTunerStore(s => s.currentCents);
  const isInTune = currentNote !== null && Math.abs(currentCents) <= IN_TUNE_THRESHOLD;

  return (
    <div className={`${styles.wrap} ${isInTune ? styles.active : ''}`}>
      <div className={styles.ring} />
    </div>
  );
}

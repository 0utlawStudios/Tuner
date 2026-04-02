import { useTunerStore } from '../../store/tunerStore';
import styles from './StringIndicator.module.css';

export function StringIndicator() {
  const instrument = useTunerStore(s => s.selectedInstrument);
  const matchedIndex = useTunerStore(s => s.matchedStringIndex);

  if (instrument.tuning.length === 0) return null;

  return (
    <div className={styles.container}>
      {instrument.tuning.map((note, i) => (
        <div
          key={`${note.name}${note.octave}`}
          className={`${styles.string} ${matchedIndex === i ? styles.active : ''}`}
        >
          <div className={styles.dot} />
          <span className={styles.label}>
            {note.name}{note.octave}
          </span>
        </div>
      ))}
    </div>
  );
}

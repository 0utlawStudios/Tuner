import { useTunerStore } from '../../store/tunerStore';
import { instruments } from '../../data/instruments';
import styles from './InstrumentSelector.module.css';

export function InstrumentSelector() {
  const selectedId = useTunerStore(s => s.selectedInstrumentId);
  const setInstrument = useTunerStore(s => s.setInstrument);

  return (
    <div className={styles.container}>
      {instruments.map(inst => (
        <button
          key={inst.id}
          className={`${styles.chip} ${selectedId === inst.id ? styles.active : ''}`}
          onClick={() => setInstrument(inst.id)}
        >
          <span className={styles.icon}>{inst.icon}</span>
          <span className={styles.label}>{inst.name}</span>
        </button>
      ))}
    </div>
  );
}

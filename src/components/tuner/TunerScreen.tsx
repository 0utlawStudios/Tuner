import { useEffect } from 'react';
import { useTunerStore } from '../../store/tunerStore';
import { useTunerEngine } from '../../hooks/useTunerEngine';
import { NoteDisplay } from './NoteDisplay';
import { CentsDisplay } from './CentsDisplay';
import { TunerGauge } from './TunerGauge';
import { InTuneIndicator } from './InTuneIndicator';
import { WaveformDisplay } from '../waveform/WaveformDisplay';
import { InstrumentSelector } from '../instruments/InstrumentSelector';
import { StringIndicator } from '../instruments/StringIndicator';
import styles from './TunerScreen.module.css';

export function TunerScreen() {
  const { start, stop } = useTunerEngine();
  const isListening = useTunerStore(s => s.isListening);
  const currentNote = useTunerStore(s => s.currentNote);
  const currentCents = useTunerStore(s => s.currentCents);
  const currentFrequency = useTunerStore(s => s.currentFrequency);

  useEffect(() => {
    start();
    return () => { stop(); };
  }, [start, stop]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="0utlawStudios" className={styles.logo} />
          <span className={styles.brandName}>0utlawStudios</span>
        </div>
        <span className={`${styles.badge} ${isListening ? styles.badgeActive : ''}`}>
          {isListening ? 'LIVE' : 'IDLE'}
        </span>
      </header>

      <div className={styles.main}>
        <div className={styles.gaugeCard}>
          <TunerGauge cents={currentNote ? currentCents : 0} />
          <InTuneIndicator />
          <div className={styles.noteArea}>
            <NoteDisplay />
            <CentsDisplay />
            {currentNote && (
              <div className={styles.frequency}>
                {currentFrequency.toFixed(1)} Hz
              </div>
            )}
          </div>
        </div>

        <div className={styles.vizCard}>
          <WaveformDisplay />
        </div>
      </div>

      <div className={styles.bottom}>
        <StringIndicator />
        <InstrumentSelector />
      </div>
    </div>
  );
}

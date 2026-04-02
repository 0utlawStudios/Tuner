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
        <span className={styles.brand}>TUNER</span>
        <span className={styles.badge} data-active={isListening}>
          {isListening ? 'LISTENING' : 'IDLE'}
        </span>
      </header>

      <div className={styles.gaugeSection}>
        <TunerGauge cents={currentNote ? currentCents : 0} />
      </div>

      <InTuneIndicator />

      <div className={styles.noteSection}>
        <NoteDisplay />
        <CentsDisplay />
        {currentNote && (
          <div className={styles.frequency}>
            {currentFrequency.toFixed(1)} Hz
          </div>
        )}
      </div>

      <div className={styles.waveformSection}>
        <WaveformDisplay />
      </div>

      <div className={styles.bottomSection}>
        <StringIndicator />
        <InstrumentSelector />
      </div>
    </div>
  );
}

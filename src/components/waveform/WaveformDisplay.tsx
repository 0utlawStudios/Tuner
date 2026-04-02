import { useRef, useEffect } from 'react';
import { useTunerStore } from '../../store/tunerStore';
import { IN_TUNE_THRESHOLD, CLOSE_THRESHOLD } from '../../utils/constants';
import styles from './WaveformDisplay.module.css';

const BAR_COUNT = 40;

export function WaveformDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const barsRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(BAR_COUNT));

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(draw); return; }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) { rafRef.current = requestAnimationFrame(draw); return; }
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      const { currentFrequency, isListening, currentNote, currentCents } = useTunerStore.getState();

      ctx.clearRect(0, 0, w, h);
      const bars = barsRef.current;
      const barW = Math.max(2, (w / BAR_COUNT) * 0.55);
      const gap = (w - barW * BAR_COUNT) / (BAR_COUNT - 1);

      // Pick color
      let color = 'rgba(255,255,255,0.06)';
      if (currentNote) {
        const a = Math.abs(currentCents);
        if (a <= IN_TUNE_THRESHOLD) color = '#00FFB2';
        else if (a <= CLOSE_THRESHOLD) color = '#FFD700';
        else color = '#FF4466';
      }

      const now = Date.now();

      for (let i = 0; i < BAR_COUNT; i++) {
        let target: number;
        if (!isListening || !currentNote) {
          target = 0.04 + 0.02 * Math.sin(now * 0.0008 + i * 0.4);
        } else {
          const freq = Math.max(60, Math.min(1200, currentFrequency));
          const n = (freq - 60) / 1140;
          const center = BAR_COUNT / 2;
          const d = Math.abs(i - center) / center;
          const env = Math.exp(-d * d * 3);
          const w1 = Math.sin(now * 0.004 + i * 0.3 + n * 5) * 0.5 + 0.5;
          const w2 = Math.sin(now * 0.006 + i * 0.5 - n * 3) * 0.3 + 0.5;
          target = (w1 * 0.6 + w2 * 0.4) * env * 0.85 + 0.05;
        }
        bars[i] = bars[i]! * 0.85 + target * 0.15;

        const barH = Math.max(2, bars[i]! * h * 0.8);
        const x = i * (barW + gap);
        const y = (h - barH) / 2;
        const alpha = 0.15 + bars[i]! * 0.85;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

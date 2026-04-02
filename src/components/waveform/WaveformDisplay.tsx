import { useRef, useEffect, useCallback } from 'react';
import { useTunerStore } from '../../store/tunerStore';
import { theme } from '../../theme/theme';
import styles from './WaveformDisplay.module.css';

export function WaveformDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const { currentFrequency, isListening, currentNote } = useTunerStore.getState();

    ctx.clearRect(0, 0, w, h);

    if (!isListening || !currentNote) {
      // Idle: draw a flat dim line
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.strokeStyle = theme.colors.surfaceLight;
      ctx.lineWidth = 1;
      ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    // Animate waveform
    phaseRef.current += 0.06;
    const amplitude = h * 0.35;
    const freq = Math.max(80, Math.min(800, currentFrequency));
    const waveLen = w / (freq / 80);
    const segments = 200;

    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * w;
      const y = h / 2 + amplitude * Math.sin((x / waveLen) * Math.PI * 2 + phaseRef.current)
        * Math.sin((x / w) * Math.PI); // envelope
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = theme.colors.waveformStroke;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = theme.colors.primaryGlow;
    ctx.stroke();
    ctx.shadowBlur = 0;

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

import { useEffect, useRef, useCallback } from 'react';
import { PitchDetectorEngine } from '../audio/pitchDetector';

interface UsePitchDetectorOptions {
  onPitch: (pitch: number) => void;
}

export function usePitchDetector({ onPitch }: UsePitchDetectorOptions) {
  const engineRef = useRef<PitchDetectorEngine | null>(null);
  const onPitchRef = useRef(onPitch);
  onPitchRef.current = onPitch;

  const start = useCallback(async () => {
    if (engineRef.current) return;
    engineRef.current = new PitchDetectorEngine((pitch) => onPitchRef.current(pitch));
    await engineRef.current.start();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  return { start, stop };
}

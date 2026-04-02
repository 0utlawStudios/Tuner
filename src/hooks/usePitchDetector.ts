import {useEffect, useRef, useCallback} from 'react';
import Pitchy from 'react-native-pitchy';

interface UsePitchDetectorOptions {
  onPitch: (pitch: number) => void;
  bufferSize?: number;
}

export function usePitchDetector({onPitch, bufferSize = 4096}: UsePitchDetectorOptions) {
  const isActive = useRef(false);
  const onPitchRef = useRef(onPitch);
  const subscriptionRef = useRef<ReturnType<typeof Pitchy.addListener> | null>(null);
  onPitchRef.current = onPitch;

  const start = useCallback(async () => {
    if (isActive.current) return;

    Pitchy.init({
      bufferSize,
      minVolume: -60,
      algorithm: 'ACF2+',
    });

    subscriptionRef.current = Pitchy.addListener(({pitch}) => {
      if (pitch > 0) {
        onPitchRef.current(pitch);
      }
    });

    await Pitchy.start();
    isActive.current = true;
  }, [bufferSize]);

  const stop = useCallback(async () => {
    if (!isActive.current) return;
    await Pitchy.stop();
    // Remove the listener subscription on stop
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    isActive.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (isActive.current) {
        Pitchy.stop();
        if (subscriptionRef.current) {
          subscriptionRef.current.remove();
          subscriptionRef.current = null;
        }
        isActive.current = false;
      }
    };
  }, []);

  return {start, stop};
}

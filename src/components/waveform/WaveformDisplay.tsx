import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Canvas, Path as SkiaPath, Skia, BlurMask} from '@shopify/react-native-skia';
import {useSharedValue, useDerivedValue, useFrameCallback} from 'react-native-reanimated';
import {theme} from '../../theme/theme';

interface WaveformDisplayProps {
  frequency: number;
  isActive: boolean;
}

const WIDTH = 360;
const HEIGHT = 100;
const WAVE_Y = HEIGHT / 2;
const TWO_PI = Math.PI * 2;

function buildSkiaPath(freq: number, isActive: boolean, phase: number) {
  'worklet';
  const path = Skia.Path.Make();
  if (!isActive || freq <= 0) {
    path.moveTo(0, WAVE_Y);
    path.lineTo(WIDTH, WAVE_Y);
    return path;
  }

  const wavelength = Math.max(20, Math.min(80, 8000 / freq));
  const amplitude = 20;

  path.moveTo(0, WAVE_Y);
  for (let x = 2; x <= WIDTH; x += 2) {
    const y =
      WAVE_Y +
      amplitude *
        Math.sin((x / wavelength) * TWO_PI + phase) *
        Math.sin((x / WIDTH) * Math.PI);
    path.lineTo(x, y);
  }
  return path;
}

export const WaveformDisplay = React.memo(function WaveformDisplay({
  frequency,
  isActive,
}: WaveformDisplayProps) {
  const phase = useSharedValue(0);
  const freqSv = useSharedValue(frequency);
  const isActiveSv = useSharedValue(isActive);

  // Keep shared values in sync with props
  freqSv.value = frequency;
  isActiveSv.value = isActive;

  // Animate phase forward on every frame when active
  useFrameCallback(frameInfo => {
    if (isActiveSv.value) {
      // Advance phase ~1 full cycle per second regardless of freq
      phase.value = (phase.value + (frameInfo.timeSincePreviousFrame ?? 16) * 0.004) % TWO_PI;
    }
  });

  // Recompute the Skia path on the UI thread whenever phase or inputs change
  const animatedPath = useDerivedValue(() => {
    return buildSkiaPath(freqSv.value, isActiveSv.value, phase.value);
  });

  const strokeColor = useMemo(
    () => (isActive ? theme.colors.waveformStroke : theme.colors.textDim),
    [isActive],
  );

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* Glow layer */}
        <SkiaPath
          path={animatedPath}
          color={strokeColor}
          style="stroke"
          strokeWidth={4}
          strokeCap="round">
          <BlurMask blur={12} style="normal" />
        </SkiaPath>
        {/* Main stroke */}
        <SkiaPath
          path={animatedPath}
          color={strokeColor}
          style="stroke"
          strokeWidth={2}
          strokeCap="round"
        />
      </Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  canvas: {
    width: WIDTH,
    height: HEIGHT,
  },
});

import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {theme} from '../../theme/theme';
import {IN_TUNE_THRESHOLD} from '../../utils/constants';

interface InTuneIndicatorProps {
  cents: number;
  isActive: boolean;
}

export const InTuneIndicator = React.memo(function InTuneIndicator({cents, isActive}: InTuneIndicatorProps) {
  const glowOpacity = useSharedValue(0);
  const isInTune = isActive && Math.abs(cents) <= IN_TUNE_THRESHOLD;

  useEffect(() => {
    if (isInTune) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 600, easing: Easing.inOut(Easing.ease)}),
          withTiming(0.4, {duration: 600, easing: Easing.inOut(Easing.ease)}),
        ),
        -1,
        true,
      );
    } else {
      glowOpacity.value = withTiming(0, {duration: 300});
    }
  }, [isInTune, glowOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.glow, animatedStyle]} pointerEvents="none" />
  );
});

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primaryGlow,
  },
});

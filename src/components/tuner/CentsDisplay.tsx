import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../theme/theme';
import {formatCents} from '../../utils/noteMapping';
import {IN_TUNE_THRESHOLD, CLOSE_THRESHOLD} from '../../utils/constants';

interface CentsDisplayProps {
  cents: number;
  frequency: number;
  isActive: boolean;
}

export const CentsDisplay = React.memo(function CentsDisplay({cents, frequency, isActive}: CentsDisplayProps) {
  if (!isActive) {
    return (
      <View style={styles.container}>
        <Text style={[styles.cents, {color: theme.colors.textDim}]}>—</Text>
        <Text style={[styles.frequency, {color: theme.colors.textDim}]}>— Hz</Text>
      </View>
    );
  }

  const absCents = Math.abs(cents);
  const color =
    absCents <= IN_TUNE_THRESHOLD
      ? theme.colors.inTune
      : absCents <= CLOSE_THRESHOLD
      ? theme.colors.close
      : theme.colors.sharp;

  return (
    <View style={styles.container}>
      <Text style={[styles.cents, {color}]}>{formatCents(cents)}</Text>
      <Text style={[styles.frequency, {color: theme.colors.textSecondary}]}>
        {frequency.toFixed(1)} Hz
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  cents: {
    fontSize: theme.fonts.cents.fontSize,
    fontWeight: theme.fonts.cents.fontWeight,
    letterSpacing: theme.fonts.cents.letterSpacing,
  },
  frequency: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});

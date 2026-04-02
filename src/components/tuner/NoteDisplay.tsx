import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../theme/theme';
import {IN_TUNE_THRESHOLD, CLOSE_THRESHOLD} from '../../utils/constants';

interface NoteDisplayProps {
  note: string | null;
  octave: number | null;
  cents: number;
  isActive: boolean;
}

function getNoteColor(cents: number, isActive: boolean): string {
  if (!isActive) return theme.colors.textDim;
  const absCents = Math.abs(cents);
  if (absCents <= IN_TUNE_THRESHOLD) return theme.colors.inTune;
  if (absCents <= CLOSE_THRESHOLD) return theme.colors.close;
  return theme.colors.sharp;
}

export const NoteDisplay = React.memo(function NoteDisplay({note, octave, cents, isActive}: NoteDisplayProps) {
  const color = getNoteColor(cents, isActive);

  return (
    <View style={styles.container}>
      <View style={styles.noteRow}>
        <Text style={[styles.noteName, {color}]}>
          {note ?? '—'}
        </Text>
        {octave !== null && (
          <Text style={[styles.octave, {color: theme.colors.textSecondary}]}>
            {octave}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  noteName: {
    fontSize: theme.fonts.noteName.fontSize,
    fontWeight: theme.fonts.noteName.fontWeight,
    letterSpacing: theme.fonts.noteName.letterSpacing,
  },
  octave: {
    fontSize: theme.fonts.octave.fontSize,
    fontWeight: theme.fonts.octave.fontWeight,
    marginLeft: 4,
  },
});

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../theme/theme';
import {useTunerStore} from '../../store/tunerStore';

export const StringIndicator = React.memo(function StringIndicator() {
  const selectedInstrument = useTunerStore(s => s.selectedInstrument);
  const matchedStringIndex = useTunerStore(s => s.matchedStringIndex);

  if (selectedInstrument.tuning.length === 0) return null;

  return (
    <View style={styles.container}>
      {selectedInstrument.tuning.map((note, index) => {
        const isMatched = matchedStringIndex === index;
        return (
          <View
            key={`${note.name}${note.octave}-${note.stringNumber}`}
            style={[styles.stringDot, isMatched && styles.stringDotActive]}>
            <Text
              style={[
                styles.stringText,
                isMatched && styles.stringTextActive,
              ]}>
              {note.name}
              <Text style={styles.stringOctave}>{note.octave}</Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: theme.spacing.lg,
  },
  stringDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceLight,
  },
  stringDotActive: {
    backgroundColor: 'rgba(0, 255, 178, 0.15)',
    borderColor: theme.colors.primary,
  },
  stringText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  stringTextActive: {
    color: theme.colors.primary,
  },
  stringOctave: {
    fontSize: 10,
    fontWeight: '400',
  },
});

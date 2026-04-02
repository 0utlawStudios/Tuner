import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {theme} from '../../theme/theme';
import {instruments} from '../../data/instruments';
import {useTunerStore} from '../../store/tunerStore';

export const InstrumentSelector = React.memo(function InstrumentSelector() {
  const selectedInstrumentId = useTunerStore(s => s.selectedInstrumentId);
  const setInstrument = useTunerStore(s => s.setInstrument);

  const handlePress = useCallback(
    (id: string) => {
      setInstrument(id);
    },
    [setInstrument],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>INSTRUMENT</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {instruments.map(instrument => {
          const isSelected = instrument.id === selectedInstrumentId;
          return (
            <InstrumentChip
              key={instrument.id}
              id={instrument.id}
              icon={instrument.icon}
              name={instrument.name}
              isSelected={isSelected}
              onPress={handlePress}
            />
          );
        })}
      </ScrollView>
    </View>
  );
});

interface InstrumentChipProps {
  id: string;
  icon: string;
  name: string;
  isSelected: boolean;
  onPress: (id: string) => void;
}

const InstrumentChip = React.memo(function InstrumentChip({
  id,
  icon,
  name,
  isSelected,
  onPress,
}: InstrumentChipProps) {
  const handlePress = useCallback(() => {
    onPress(id);
  }, [onPress, id]);

  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={handlePress}
      activeOpacity={0.7}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    ...theme.fonts.label,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: 'rgba(0, 255, 178, 0.1)',
    borderColor: theme.colors.primary,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    ...theme.fonts.instrumentChip,
    color: theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: theme.colors.primary,
  },
});

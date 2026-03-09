import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import MuscleChip from '@/components/MuscleChip';
import Button from '@/components/Button';
import { createWorkout } from '@/db/workouts';

const MUSCOLI = [
  'Petto', 'Schiena', 'Spalle', 'Bicipiti',
  'Tricipiti', 'Gambe', 'Addome', 'Glutei',
];

export default function Palestra() {
  const { sport } = useLocalSearchParams<{ sport: string }>();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (m: string) => {
    setSelected(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const handleStart = () => {
    const workoutId = createWorkout({
      sport: sport ?? 'Palestra',
      muscoli: selected,
    });
    router.push({
      pathname: '/nuovo-allenamento/esercizi',
      params: { workoutId: String(workoutId), muscoli: selected.join(',') },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerCancel}>← Indietro</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sport ?? 'Palestra'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Muscoli allenati</Text>
          <View style={styles.grid}>
            {MUSCOLI.map(m => (
              <View key={m} style={styles.chipWrap}>
                <MuscleChip
                  label={m}
                  selected={selected.includes(m)}
                  onPress={() => toggle(m)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <Button
            label="Inizia allenamento"
            onPress={handleStart}
            disabled={selected.length === 0}
            arrow
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCancel: { fontFamily: fonts.sans, fontSize: 15, color: colors.gray3 },
  headerTitle: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.white },
  headerSpacer: { width: 60 },

  scroll: { padding: spacing.lg, paddingBottom: 60 },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.gray3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipWrap: { width: '47.5%' },

  ctaWrap: { marginTop: spacing.sm },
});
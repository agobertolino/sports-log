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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Indietro</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{sport ?? 'Palestra'}</Text>

        <Text style={styles.sectionLabel}>Quali muscoli alleni oggi?</Text>

        <View style={styles.grid}>
          {MUSCOLI.map((m, i) => (
            <View key={m} style={styles.chipWrap}>
              <MuscleChip
                label={m}
                selected={selected.includes(m)}
                onPress={() => toggle(m)}
              />
            </View>
          ))}
        </View>

        <Button label="Inizia allenamento" onPress={handleStart} disabled={selected.length === 0} arrow />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 40 },
  back: { marginBottom: spacing.lg },
  backText: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.white, marginBottom: spacing.xl },
  sectionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.gray3,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.xl,
  },
  chipWrap: { width: '47.5%' },
  startBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: 20,
    alignItems: 'center',
  },
  startBtnDisabled: { opacity: 0.3 },
  startBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.bg },
});

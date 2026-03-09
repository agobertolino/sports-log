import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getAllWorkouts, type Workout } from '@/db/workouts';

export default function Storico() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useFocusEffect(
    useCallback(() => {
      setWorkouts(getAllWorkouts());
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Storico</Text>

        {workouts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nessun allenamento</Text>
            <Text style={styles.emptySubtitle}>I tuoi allenamenti appariranno qui.</Text>
          </View>
        ) : (
          workouts.map(w => <WorkoutRow key={w.id} workout={w} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkoutRow({ workout }: { workout: Workout }) {
  const dateStr = new Date(workout.data).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const muscoli = workout.muscoli ? workout.muscoli.split(',').join(' · ') : '';

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/(tabs)/storico/${workout.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowSport}>{workout.sport}</Text>
        {muscoli ? <Text style={styles.rowMuscoli}>{muscoli}</Text> : null}
        <Text style={styles.rowDate}>{capitalize(dateStr)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.white, marginBottom: spacing.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontFamily: fonts.sansMedium, fontSize: 18, color: colors.gray2, marginBottom: 8 },
  emptySubtitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
  row: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flex: 1 },
  rowSport: { fontFamily: fonts.sansMedium, fontSize: 17, color: colors.white, marginBottom: 4 },
  rowMuscoli: { fontFamily: fonts.sans, fontSize: 13, color: colors.gray3, marginBottom: 4 },
  rowDate: { fontFamily: fonts.sans, fontSize: 12, color: colors.gray3, letterSpacing: 0.3 },
  chevron: { fontSize: 20, color: colors.gray3, marginLeft: 12 },
});

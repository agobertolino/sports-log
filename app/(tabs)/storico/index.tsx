import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getAllWorkouts, type Workout } from '@/db/workouts';
import i18n from '@/i18n';

export default function Storico() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useFocusEffect(
    useCallback(() => {
      setWorkouts(getAllWorkouts());
    }, [])
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{i18n.t('storico.title')}</Text>

        {workouts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{i18n.t('storico.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>{i18n.t('storico.emptySub')}</Text>
          </View>
        ) : (
          workouts.map(w => (
            <WorkoutCard key={w.id} workout={w} formatDate={formatDate} capitalize={capitalize} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkoutCard({ workout, formatDate, capitalize }: {
  workout: Workout;
  formatDate: (dateStr: string) => string;
  capitalize: (s: string) => string;
}) {
  const muscoli = workout.muscoli ? workout.muscoli.split(',').join(' · ') : null;
  const durata = workout.durata_secondi
    ? `${Math.floor(workout.durata_secondi / 60)} ${i18n.t('storico.min')}`
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/storico/${workout.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.sport}>{workout.sport}</Text>
        <Text style={styles.date}>{capitalize(formatDate(workout.data))}</Text>
        <View style={styles.metaRow}>
          {durata && <Text style={styles.meta}>{durata}</Text>}
          {muscoli && <Text style={styles.meta}>{muscoli}</Text>}
        </View>
      </View>
      <Text style={styles.chevron}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 38,
    color: colors.white,
    marginBottom: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.gray2,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray3,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: { flex: 1 },
  sport: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.white,
    marginBottom: 4,
  },
  date: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray3,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.gray2,
    backgroundColor: colors.gray4,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chevron: {
    fontSize: 20,
    color: colors.gray3,
    marginLeft: 12,
  },
});

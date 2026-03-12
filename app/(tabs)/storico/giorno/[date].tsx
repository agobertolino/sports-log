import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getAllWorkouts, type Workout } from '@/db/workouts';
import i18n from '@/i18n';

export default function DayDetail() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (!date) return;
    const all = getAllWorkouts();
    const filtered = all.filter(w => {
      const wDate = new Date(w.data);
      const wKey = `${wDate.getFullYear()}-${String(wDate.getMonth() + 1).padStart(2, '0')}-${String(wDate.getDate()).padStart(2, '0')}`;
      return wKey === date;
    });
    setWorkouts(filtered);
  }, [date]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(i18n.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (!date) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>{i18n.t('storico.invalidDate')}</Text>
      </SafeAreaView>
    );
  }

  const displayDate = new Date(date + 'T12:00:00'); // avoid timezone issues

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← {i18n.t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{capitalize(formatDate(displayDate.toISOString()))}</Text>
          <View style={{ width: 60 }} />
        </View>

        {workouts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{i18n.t('storico.noWorkoutsToday')}</Text>
            <Text style={styles.emptySubtitle}>{i18n.t('storico.noWorkoutsTodaySub')}</Text>
          </View>
        ) : (
          workouts.map(w => (
            <WorkoutCard key={w.id} workout={w} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkoutCard({ workout }: { workout: Workout }) {
  const muscoli = workout.muscoli ? workout.muscoli.split(',').join(' · ') : null;
  const durata = workout.durata_secondi
    ? `${Math.floor(workout.durata_secondi / 60)} ${i18n.t('storico.min')}`
    : null;

  const sportColor = () => {
    switch (workout.sport) {
      case 'Palestra': return '#4CAF50';
      case 'Corsa': return '#2196F3';
      case 'Nuoto': return '#FF9800';
      default: return colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/storico/${workout.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cardLeft}>
        <View style={styles.sportRow}>
          <View style={[styles.sportDot, { backgroundColor: sportColor() }]} />
          <Text style={styles.sport}>{i18n.t(`common.sports.${workout.sport}`) || workout.sport}</Text>
        </View>
        {muscoli && <Text style={styles.muscoli}>{muscoli}</Text>}
        {durata && <Text style={styles.durata}>{durata}</Text>}
      </View>
      <Text style={styles.chevron}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backText: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
  headerTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    flex: 1,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.gray3,
    textAlign: 'center',
    marginTop: 100,
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
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  sportDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sport: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.white,
  },
  muscoli: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.gray3,
    marginBottom: 4,
  },
  durata: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.gray2,
    backgroundColor: colors.gray4,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  chevron: {
    fontSize: 20,
    color: colors.gray3,
    marginLeft: 12,
  },
});

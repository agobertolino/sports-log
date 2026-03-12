import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getUser } from '@/db/users';
import { getAllWorkouts, getActiveWorkout, type Workout } from '@/db/workouts';
import Button from '@/components/Button';
import i18n from '@/i18n';

export default function Home() {
  const [nome, setNome] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  useFocusEffect(
    useCallback(() => {
      const user = getUser();
      setNome(user?.nome ?? '');
      setWorkouts(getAllWorkouts());
      setActiveWorkout(getActiveWorkout());
    }, [])
  );

  const today = new Date().toLocaleDateString(i18n.locale, {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const lastWorkout = workouts[0];
  const lastWorkoutLabel = lastWorkout
    ? new Date(lastWorkout.data).toLocaleDateString(i18n.locale, { weekday: 'long' }) + ' — ' + (i18n.t(`common.sports.${lastWorkout.sport}`) || lastWorkout.sport)
    : i18n.t('home.noWorkoutsYet');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Greeting */}
        <Text style={styles.dateLabel}>{capitalize(today)}</Text>
        <Text style={styles.greeting}>
          Ciao,{'\n'}<Text style={styles.greetingItalic}>{nome || i18n.t('common.athlete')}.</Text>
        </Text>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{workouts.length}</Text>
            <Text style={styles.statLabel}>{i18n.t('home.workouts')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getWeeksActive(workouts)}</Text>
            <Text style={styles.statLabel}>{i18n.t('home.weeks')}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWide]}>
            <Text style={styles.statLastLabel}>{i18n.t('home.lastWorkout')}</Text>
            <Text style={styles.statLastValue}>{lastWorkoutLabel}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {activeWorkout ? (
            <Button 
              label={i18n.t('home.continueWorkout')} 
              onPress={() => router.push({
                pathname: '/nuovo-allenamento/esercizi',
                params: { workoutId: activeWorkout.id, sport: activeWorkout.sport, isResume: '1' }
              })} 
              arrow 
            />
          ) : (
            <Button label={i18n.t('home.newWorkout')} onPress={() => router.push('/nuovo-allenamento')} arrow />
          )}
          <Button label={i18n.t('home.pastWorkouts')} onPress={() => router.push('/(tabs)/storico')} variant="secondary" arrow />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getWeeksActive(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const dates = workouts.map(w => new Date(w.data).getTime());
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  return Math.max(1, Math.ceil((max - min) / (7 * 24 * 60 * 60 * 1000)));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  dateLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.gray3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 42,
    color: colors.white,
    lineHeight: 50,
    marginBottom: spacing.xl,
  },
  greetingItalic: {
    fontFamily: fonts.serifItalic,
    color: colors.gray2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 20,
  },
  statCardWide: { minWidth: '100%' },
  statNumber: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.gray3,
    letterSpacing: 0.5,
  },
  statLastLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.gray3,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statLastValue: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.white,
  },
  actions: { gap: 12 },
  btnPrimary: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnPrimaryText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.bg },
  btnSecondary: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnSecondaryText: { fontFamily: fonts.sans, fontSize: 16, color: colors.gray2 },
});

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getWorkoutById, getSetsForWorkout, deleteWorkout, type Workout, type WorkoutSet } from '@/db/workouts';
import i18n from '@/i18n';

type GroupedSets = { esercizio: string; muscolo: string | null; sets: WorkoutSet[] }[];

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [grouped, setGrouped] = useState<GroupedSets>([]);

  useEffect(() => {
    const wid = parseInt(id ?? '0');
    const w = getWorkoutById(wid);
    setWorkout(w);

    const sets = getSetsForWorkout(wid);
    const map = new Map<string, WorkoutSet[]>();
    sets.forEach(s => {
      const key = s.esercizio;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    setGrouped(Array.from(map.entries()).map(([esercizio, sets]) => ({
      esercizio,
      muscolo: sets[0]?.muscolo ?? null,
      sets,
    })));
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      i18n.t('storico.deleteWorkout'),
      i18n.t('storico.deleteConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'), style: 'destructive',
          onPress: () => {
            deleteWorkout(parseInt(id ?? '0'));
            router.back();
          },
        },
      ]
    );
  };

  if (!workout) return null;

  const date = new Date(workout.data).toLocaleDateString(i18n.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const muscoli = workout.muscoli?.split(',').join(' · ') ?? '';
  const durata = workout.durata_secondi
    ? `${Math.floor(workout.durata_secondi / 60)} ${i18n.t('storico.min')}`
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← {i18n.t('common.back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>{i18n.t('common.delete')}</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.sport}>{i18n.t(`common.sports.${workout.sport}`) || workout.sport}</Text>
        <Text style={styles.date}>{capitalize(date)}</Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          {muscoli ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{muscoli}</Text>
            </View>
          ) : null}
          {durata ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{durata}</Text>
            </View>
          ) : null}
        </View>

        {/* Exercises */}
        {grouped.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{i18n.t('storico.noExercisesRecorded')}</Text>
          </View>
        ) : (
          grouped.map(g => (
            <View key={g.esercizio} style={styles.esCard}>
              <Text style={styles.esName}>{g.esercizio}</Text>
              {g.muscolo ? <Text style={styles.esMuscolo}>{g.muscolo}</Text> : null}

              {/* Column headers */}
              <View style={styles.setHeaderRow}>
                <Text style={[styles.setHeader, { width: 32 }]}>{i18n.t('esercizi.set')}</Text>
                <Text style={[styles.setHeader, { flex: 1 }]}>{i18n.t('esercizi.kg')}</Text>
                <Text style={[styles.setHeader, { flex: 1 }]}>{i18n.t('esercizi.reps')}</Text>
              </View>

              {g.sets.map((s, i) => (
                <View key={s.id} style={styles.setRow}>
                  <View style={styles.setNum}>
                    <Text style={styles.setNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.setVal, { flex: 1 }]}>
                    {s.peso_kg != null ? `${s.peso_kg}` : '–'}
                  </Text>
                  <Text style={[styles.setVal, { flex: 1 }]}>
                    {s.reps != null ? `${s.reps}` : '–'}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 60 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backText: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
  deleteText: { fontFamily: fonts.sans, fontSize: 14, color: '#FF6B6B' },
  sport: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.white,
    marginBottom: 6,
  },
  date: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray3,
    marginBottom: spacing.md,
  },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: spacing.xl },
  metaBadge: {
    backgroundColor: colors.gray4,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  metaText: { fontFamily: fonts.sans, fontSize: 13, color: colors.gray2 },
  empty: { paddingTop: 40, alignItems: 'center' },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
  esCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
  },
  esName: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    color: colors.white,
    marginBottom: 4,
  },
  esMuscolo: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.gray3,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  setHeader: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.gray3,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  setNum: {
    width: 32,
    height: 32,
    backgroundColor: colors.gray4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.gray2 },
  setVal: { fontFamily: fonts.sans, fontSize: 15, color: colors.white, textAlign: 'center' },
});

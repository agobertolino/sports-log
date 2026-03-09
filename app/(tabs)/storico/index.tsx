import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getAllWorkouts, type Workout } from '@/db/workouts';
import db from '@/db/database';

// ── Query analisi ─────────────────────────────────────────────
function getWeeklyVolumePalestra(): { label: string; value: number }[] {
  const rows = db.getAllSync<{ week: string; volume: number }>(`
    SELECT 
      strftime('%Y-W%W', w.data) as week,
      ROUND(SUM(s.reps * s.peso_kg), 1) as volume
    FROM workouts w
    JOIN workout_sets s ON s.workout_id = w.id
    WHERE w.sport = 'Palestra'
      AND s.reps IS NOT NULL AND s.peso_kg IS NOT NULL
    GROUP BY week
    ORDER BY week ASC
    LIMIT 10
  `);
  return rows.map(r => ({ label: 'W' + (r.week.split('-W')[1] ?? r.week), value: r.volume ?? 0 }));
}

function getEserciziPalestra(): string[] {
  const rows = db.getAllSync<{ esercizio: string }>(`
    SELECT DISTINCT s.esercizio
    FROM workout_sets s
    JOIN workouts w ON w.id = s.workout_id
    WHERE w.sport = 'Palestra'
    ORDER BY s.esercizio ASC
  `);
  return rows.map(r => r.esercizio);
}

function getEsercizioVolume(nome: string): { label: string; value: number }[] {
  const rows = db.getAllSync<{ data: string; volume: number }>(`
    SELECT 
      w.data,
      ROUND(SUM(s.reps * s.peso_kg) / 10.0, 1) as volume
    FROM workout_sets s
    JOIN workouts w ON w.id = s.workout_id
    WHERE s.esercizio = ? AND s.reps IS NOT NULL AND s.peso_kg IS NOT NULL
    GROUP BY w.id
    ORDER BY w.data ASC
    LIMIT 12
  `, [nome]);
  return rows.map(r => ({
    label: new Date(r.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric' }),
    value: r.volume ?? 0,
  }));
}


// ── Query corsa ───────────────────────────────────────────────
function getWeeklyPaceCorsa(): { label: string; value: number; display: string }[] {
  const rows = db.getAllSync<{ week: string; passo: string; km: number }>(`
    SELECT 
      strftime('%Y-W%W', w.data) as week,
      s.muscolo as passo,
      s.peso_kg as km
    FROM workouts w
    JOIN workout_sets s ON s.workout_id = w.id
    WHERE w.sport = 'Corsa'
      AND s.muscolo IS NOT NULL
      AND s.peso_kg IS NOT NULL
    ORDER BY w.data ASC
  `);

  const weekMap = new Map<string, { totalSec: number; totalKm: number }>();
  for (const r of rows) {
    const parts = (r.passo ?? '').split(':');
    if (parts.length !== 2) continue;
    const sec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    if (isNaN(sec) || sec <= 0) continue;
    const km = r.km ?? 1;
    const existing = weekMap.get(r.week) ?? { totalSec: 0, totalKm: 0 };
    weekMap.set(r.week, {
      totalSec: existing.totalSec + sec * km,
      totalKm: existing.totalKm + km,
    });
  }

  return Array.from(weekMap.entries()).map(([week, { totalSec, totalKm }]) => {
    const avgSec = totalKm > 0 ? totalSec / totalKm : 0;
    const min = Math.floor(avgSec / 60);
    const sec = Math.round(avgSec % 60);
    const display = `${min}:${sec.toString().padStart(2, '0')}`;
    // Invertiamo: barre alte = passo veloce (migliore)
    const value = Math.max(0, Math.round(600 - avgSec));
    return { label: 'W' + (week.split('-W')[1] ?? week), value, display };
  });
}

// ── Grafico a barre ───────────────────────────────────────────
function BarChart({ data, color = colors.white }: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  if (data.length === 0) return (
    <View style={chartStyles.empty}>
      <Text style={chartStyles.emptyText}>Nessun dato disponibile</Text>
    </View>
  );
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <View style={chartStyles.wrap}>
      <View style={chartStyles.barsRow}>
        {data.map((d, i) => (
          <View key={i} style={chartStyles.barWrap}>
            <Text style={chartStyles.barValue} numberOfLines={1}>
              {d.value > 0 ? d.value : ''}
            </Text>
            <View style={chartStyles.barBg}>
              <View style={[
                chartStyles.barFill,
                { height: `${Math.max((d.value / max) * 100, 2)}%`, backgroundColor: color }
              ]} />
            </View>
            <Text style={chartStyles.barLabel} numberOfLines={1}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Tab toggle ────────────────────────────────────────────────
function TabToggle({ active, onChange }: { active: 'lista' | 'analisi'; onChange: (v: 'lista' | 'analisi') => void }) {
  return (
    <View style={toggleStyles.wrap}>
      {(['lista', 'analisi'] as const).map(tab => (
        <TouchableOpacity
          key={tab}
          style={[toggleStyles.btn, active === tab && toggleStyles.btnActive]}
          onPress={() => onChange(tab)}
        >
          <Text style={[toggleStyles.label, active === tab && toggleStyles.labelActive]}>
            {tab === 'lista' ? 'Allenamenti' : 'Analisi'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Analisi Palestra ──────────────────────────────────────────
function AnalisiPalestra() {
  const [esercizioSelezionato, setEsercizioSelezionato] = useState<string | null>(null);
  const weeklyData = getWeeklyVolumePalestra();
  const esercizi = getEserciziPalestra();
  const esVolumeData = esercizioSelezionato ? getEsercizioVolume(esercizioSelezionato) : [];
  const locked = weeklyData.length < 2;

  return (
    <View>
      <View style={analisiStyles.card}>
        <Text style={analisiStyles.cardTitle}>Kg totali per settimana</Text>
        <Text style={analisiStyles.cardSub}>Somma di reps × kg per tutte le serie</Text>
        {locked ? (
          <View style={analisiStyles.locked}>
            <Text style={analisiStyles.lockedIcon}>🔒</Text>
            <Text style={analisiStyles.lockedText}>
              Questo trend si sblocca dopo almeno 2 settimane di allenamenti — continua così!
            </Text>
          </View>
        ) : (
          <BarChart data={weeklyData} />
        )}
      </View>

      <View style={analisiStyles.card}>
        <Text style={analisiStyles.cardTitle}>Trend per esercizio</Text>
        <Text style={analisiStyles.cardSub}>Volume = reps × kg / 10</Text>
        {esercizi.length === 0 ? (
          <Text style={analisiStyles.noData}>Nessun esercizio registrato</Text>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 14, marginBottom: 4 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {esercizi.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[analisiStyles.chip, esercizioSelezionato === e && analisiStyles.chipActive]}
                  onPress={() => setEsercizioSelezionato(e === esercizioSelezionato ? null : e)}
                >
                  <Text style={[analisiStyles.chipText, esercizioSelezionato === e && analisiStyles.chipTextActive]}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {esercizioSelezionato && (
              <View style={{ marginTop: 16 }}>
                <BarChart data={esVolumeData} color={colors.gray1} />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

// ── Analisi Corsa ────────────────────────────────────────────
function AnalisiCorsa() {
  const paceData = getWeeklyPaceCorsa();
  const locked = paceData.length < 2;

  return (
    <View>
      <View style={analisiStyles.card}>
        <Text style={analisiStyles.cardTitle}>Passo medio a settimana</Text>
        <Text style={analisiStyles.cardSub}>min/km — barre più alte = passo più veloce</Text>
        {locked ? (
          <View style={analisiStyles.locked}>
            <Text style={analisiStyles.lockedIcon}>🔒</Text>
            <Text style={analisiStyles.lockedText}>
              Questo trend si sblocca dopo almeno 2 settimane di corse — forza!
            </Text>
          </View>
        ) : (
          <>
            <BarChart data={paceData} color={colors.white} />
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              {paceData.map((d, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 9, color: colors.gray2 }}>
                    {d.display}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ── Selezione sport + Analisi ─────────────────────────────────
const SPORT_ANALISI = [
  { id: 'Palestra', icon: '🏋️' },
  { id: 'Corsa', icon: '🏃' },
];

function Analisi() {
  const [sport, setSport] = useState<string | null>(null);

  if (!sport) {
    return (
      <View>
        <Text style={analisiStyles.sectionLabel}>Seleziona sport</Text>
        {SPORT_ANALISI.map(s => (
          <TouchableOpacity
            key={s.id}
            style={analisiStyles.sportCard}
            onPress={() => setSport(s.id)}
            activeOpacity={0.8}
          >
            <View style={analisiStyles.sportCardLeft}>
              <View style={analisiStyles.sportIconWrap}>
                <Text style={{ fontSize: 22 }}>{s.icon}</Text>
              </View>
              <Text style={analisiStyles.sportCardLabel}>{s.id}</Text>
            </View>
            <Text style={analisiStyles.sportChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity style={analisiStyles.backBtn} onPress={() => setSport(null)}>
        <Text style={analisiStyles.backText}>← Indietro</Text>
      </TouchableOpacity>
      <Text style={analisiStyles.sportTitle}>{sport}</Text>
      {sport === 'Palestra' && <AnalisiPalestra />}
      {sport === 'Corsa' && <AnalisiCorsa />}
    </View>
  );
}

// ── Schermata principale ──────────────────────────────────────
export default function Storico() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [tab, setTab] = useState<'lista' | 'analisi'>('lista');

  useFocusEffect(
    useCallback(() => {
      setWorkouts(getAllWorkouts());
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Storico</Text>
        <TabToggle active={tab} onChange={setTab} />
        {tab === 'lista' ? (
          workouts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nessun allenamento</Text>
              <Text style={styles.emptySubtitle}>I tuoi allenamenti appariranno qui.</Text>
            </View>
          ) : (
            workouts.map(w => <WorkoutRow key={w.id} workout={w} />)
          )
        ) : (
          <Analisi />
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

// ── Stili ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.white, marginBottom: spacing.lg },
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

const toggleStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    padding: 4,
  },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  btnActive: { backgroundColor: colors.white },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.gray3 },
  labelActive: { color: colors.bg },
});

const analisiStyles = StyleSheet.create({
  sectionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.gray3,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  sportCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sportCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sportIconWrap: {
    width: 44, height: 44,
    backgroundColor: colors.gray4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportCardLabel: { fontFamily: fonts.sansMedium, fontSize: 17, color: colors.white },
  sportChevron: { fontSize: 20, color: colors.gray3 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  backText: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
  sportTitle: { fontFamily: fonts.serifItalic, fontSize: 26, color: colors.white, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 14,
  },
  cardTitle: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.white, marginBottom: 4 },
  cardSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.gray3, marginBottom: 4 },
  noData: { fontFamily: fonts.sans, fontSize: 13, color: colors.gray3, marginTop: 12, textAlign: 'center' },
  locked: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  lockedIcon: { fontSize: 28 },
  lockedText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.gray3,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  backBtn: {
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  chip: {
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.white, borderColor: colors.white },
  chipText: { fontFamily: fonts.sans, fontSize: 13, color: colors.gray3 },
  chipTextActive: { color: colors.bg, fontFamily: fonts.sansMedium },
});

const chartStyles = StyleSheet.create({
  wrap: { marginTop: 16 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 120 },
  barWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValue: { fontFamily: fonts.sansMedium, fontSize: 9, color: colors.gray3, marginBottom: 3, textAlign: 'center' },
  barBg: { width: '100%', flex: 1, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4, minHeight: 3 },
  barLabel: { fontFamily: fonts.sans, fontSize: 9, color: colors.gray3, marginTop: 5, textAlign: 'center' },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontFamily: fonts.sans, fontSize: 13, color: colors.gray3 },
});
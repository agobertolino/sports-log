import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { addSet, finishWorkout, deleteWorkout, createWorkout, getWorkoutById, getSetsForWorkout } from '@/db/workouts';
import db from '@/db/database';
import i18n from '@/i18n';

const ESERCIZI_COMUNI = [
  // Chest
<<<<<<< HEAD
  'Bench Press', 'Incline Bench Press', 'Decline Bench Press',
  'Dumbbell Fly', 'Cable Fly', 'Push-Up', 'Dips', 'Chest Press Machine',
  'Pec Deck', 'Landmine Press',

  // Back
  'Lat Pulldown', 'Barbell Row', 'Dumbbell Row',
  'Pull-Up', 'Chin-Up', 'Face Pull', 'Cable Row', 'Seated Cable Row',
  'T-Bar Row', 'Meadows Row', 'Straight-Arm Pulldown', 'Shrugs',

  // Shoulders
  'Overhead Press', 'Dumbbell Shoulder Press', 'Arnold Press',
  'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Upright Row',
  'Cable Lateral Raise', 'Machine Shoulder Press',

  // Biceps
  'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl',
  'Preacher Curl', 'Cable Curl', 'Concentration Curl',
  'Incline Dumbbell Curl', 'Spider Curl', 'Reverse Curl',

  // Triceps
  'Tricep Pushdown', 'French Press', 'Kickback',
  'Overhead Tricep Extension', 'Close-Grip Bench Press',
  'Skull Crusher', 'Cable Overhead Extension', 'Diamond Push-Up',

  // Legs
  'Squat', 'Front Squat', 'Goblet Squat', 'Hack Squat',
  'Leg Press', 'Lunge', 'Bulgarian Split Squat',
  'Deadlift', 'Romanian Deadlift', 'Sumo Deadlift', 'Stiff-Leg Deadlift',
  'Leg Curl', 'Leg Extension', 'Calf Raise', 'Seated Calf Raise',
  'Hip Thrust', 'Glute Bridge', 'Step-Up', 'Box Jump',
  'Nordic Curl', 'Leg Press Calf Raise',

  // Core
  'Plank', 'Side Plank', 'Crunch', 'Russian Twist', 'Ab Wheel',
  'Hanging Leg Raise', 'Cable Crunch', 'Bicycle Crunch',
  'Dead Bug', 'Pallof Press', 'Dragon Flag', 'Toes to Bar',

  // Olympic / Compound
  'Clean and Press', 'Power Clean', 'Snatch', 'Thruster',
  'Farmer Walk', 'Sled Push', 'Battle Ropes', 'Kettlebell Swing',
=======
  'Barbell bench press', 'Incline barbell bench press', 'Decline barbell bench press',
  'Dumbbell bench press', 'Incline dumbbell press', 'Decline dumbbell press',
  'Dumbbell flyes', 'Incline dumbbell flyes', 'Cable flyes', 'Cable crossover',
  'Push-up', 'Wide push-up', 'Diamond push-up', 'Archer push-up', 'Decline push-up',
  'Dips', 'Chest dips', 'Machine chest press', 'Pec deck',

  // Back
  'Pull-up', 'Chin-up', 'Wide-grip pull-up', 'Neutral-grip pull-up', 'Weighted pull-up',
  'Lat pulldown', 'Close-grip lat pulldown', 'Behind-the-neck pulldown',
  'Barbell row', 'Dumbbell row', 'Cable row', 'Seated cable row', 'Pendlay row',
  'T-bar row', 'Chest-supported row', 'Meadows row', 'Inverted row',
  'Face pull', 'Straight-arm pulldown', 'Single-arm cable pulldown',
  'Hyperextension', 'Good morning',

  // Shoulders
  'Overhead press', 'Seated dumbbell press', 'Arnold press', 'Push press',
  'Lateral raise', 'Cable lateral raise', 'Bent-over lateral raise',
  'Front raise', 'Plate front raise', 'Cable front raise',
  'Upright row', 'Shrugs', 'Cable face pull',

  // Biceps
  'Barbell curl', 'EZ-bar curl', 'Dumbbell curl', 'Hammer curl',
  'Concentration curl', 'Preacher curl', 'Incline dumbbell curl',
  'Cable curl', 'Rope hammer curl', 'Reverse curl', 'Spider curl',

  // Triceps
  'Tricep pushdown', 'Tricep rope pushdown', 'Overhead tricep extension',
  'French press', 'Close-grip bench press', 'Skull crushers',
  'Tricep kickback', 'Cable overhead extension',

  // Legs
  'Squat', 'Front squat', 'Box squat', 'Pause squat', 'Goblet squat',
  'Leg press', 'Hack squat', 'Bulgarian split squat', 'Lunge', 'Walking lunge',
  'Romanian deadlift', 'Stiff-leg deadlift', 'Sumo deadlift', 'Conventional deadlift',
  'Leg curl', 'Lying leg curl', 'Seated leg curl', 'Leg extension', 'Nordic curl',
  'Hip thrust', 'Glute bridge', 'Cable kickback', 'Abductor machine', 'Adductor machine',
  'Calf raise', 'Standing calf raise', 'Seated calf raise', 'Donkey calf raise', 'Single-leg calf raise',
  'Step-up', 'Sissy squat',

  // Core
  'Plank', 'Side plank', 'RKC plank',
  'Crunch', 'Cable crunch', 'Decline crunch', 'Reverse crunch',
  'Leg raise', 'Hanging leg raise', 'Hanging knee raise',
  'Ab wheel rollout', 'Dragon flag', 'L-sit',
  'Russian twist', 'Pallof press', 'Dead bug', 'Bird dog',
  'Oblique crunch', 'Bicycle crunch', 'Windshield wiper',

  // Olympic / Compound
  'Deadlift', 'Power clean', 'Clean and jerk', 'Snatch',
  'Farmer carry', 'Suitcase carry', 'Trap bar deadlift',
>>>>>>> fb3a49dae8c7325e949c8cf5ecf9adda5ff663aa
];


// ── Tipi ─────────────────────────────────────────────────────
type SetRow = { id: string; reps: string; peso: string };
type EsercizioBlock = { id: string; nome: string; sets: SetRow[]; collapsed: boolean };

function makeId() { return Math.random().toString(36).slice(2, 9); }
function emptySet(prev?: SetRow): SetRow {
  return { id: makeId(), reps: prev?.reps ?? '', peso: prev?.peso ?? '' };
}
function newEsercizio(): EsercizioBlock {
  return { id: makeId(), nome: '', sets: [emptySet()], collapsed: false };
}

export default function Esercizi() {
  const { sport, workoutId: paramWorkoutId, isResume } = useLocalSearchParams<{ sport: string, workoutId?: string, isResume?: string }>();
  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const [esercizi, setEsercizi] = useState<EsercizioBlock[]>([newEsercizio()]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [pastNames, setPastNames] = useState<string[]>([]);
  const startTime = useRef(Date.now());

  // Caricamento / Ripristino
  useEffect(() => {
    if (!sport && !paramWorkoutId) return;
    if (workoutId !== null) return;

    if (paramWorkoutId) {
      const id = parseInt(paramWorkoutId);
      setWorkoutId(id);
      
      if (isResume === '1') {
        // Ripristina da SQLite reale (tabella workout_sets)
        const setsFromDb = getSetsForWorkout(id);
        if (setsFromDb.length > 0) {
          const grouped: Record<string, SetRow[]> = {};
          const order: string[] = [];
          
          setsFromDb.forEach(row => {
            if (!grouped[row.esercizio]) {
              grouped[row.esercizio] = [];
              order.push(row.esercizio);
            }
            grouped[row.esercizio].push({
              id: makeId(),
              reps: row.reps !== null ? String(row.reps) : '',
              peso: row.peso_kg !== null ? String(row.peso_kg) : ''
            });
          });
          
          const loadedEsercizi = order.map(nome => ({
            id: makeId(),
            nome,
            sets: grouped[nome],
            collapsed: true // Li teniamo collassati per pulizia visiva
          }));
          
          // Espandi l'ultimo se esiste
          if (loadedEsercizi.length > 0) {
            loadedEsercizi[loadedEsercizi.length - 1].collapsed = false;
          }
          
          setEsercizi(loadedEsercizi);
        }
      }
    } else {
      const id = createWorkout({ sport: sport ?? i18n.t('esercizi.palestra'), muscoli: [] });
      setWorkoutId(id);
    }
  }, [paramWorkoutId, sport, isResume, workoutId]);

  // Sincronizzazione continua in SQL
  // "tutte le volte che scrivo qualcosa in un esercizio devi scriverlo su sql"
  useEffect(() => {
    if (!workoutId) return;
    const t = setTimeout(() => {
      try {
        db.withTransactionSync(() => {
          // Rimuovi vecchi set
          db.runSync('DELETE FROM workout_sets WHERE workout_id = ?', [workoutId]);
          // Inserisci i nuovi (solo quelli con un nome esercizio compilato)
          esercizi.forEach(es => {
            if (!es.nome.trim()) return;
            es.sets.forEach((s, i) => {
              // Salviamo anche se vuoto, così manteniamo il numero di serie
              db.runSync(
                'INSERT INTO workout_sets (workout_id, esercizio, serie, reps, peso_kg) VALUES (?, ?, ?, ?, ?)',
                [workoutId, es.nome.trim(), i + 1, s.reps ? parseInt(s.reps) : null, s.peso ? parseFloat(s.peso) : null]
              );
            });
          });
        });
      } catch (e) {
        console.error('Salvataggio live fallito:', e);
      }
    }, 600); // Debounce di 600ms per non bloccare la UI mentre si digita
    
    return () => clearTimeout(t);
  }, [esercizi, workoutId]);

  // Carica nomi esercizi dal DB (storico)
  useEffect(() => {
    try {
      const rows = db.getAllSync<{ esercizio: string }>(
        `SELECT DISTINCT esercizio FROM workout_sets ORDER BY id DESC LIMIT 100`
      );
      setPastNames(rows.map(r => r.esercizio));
    } catch {}
  }, []);

  const allSuggestions = [...new Set([...pastNames, ...ESERCIZI_COMUNI])];

  const getSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return allSuggestions.filter(s => s.toLowerCase().includes(q)).slice(0, 6);
  };

  const addEsercizio = () => {
    const hasEmpty = esercizi.some(es => 
      !es.nome.trim() && es.sets.every(s => !s.reps.trim() && !s.peso.trim())
    );

    if (hasEmpty) {
      Alert.alert(i18n.t('esercizi.attention'), i18n.t('esercizi.emptyExercise'));
      return;
    }

    setEsercizi(prev => [
      newEsercizio(),
      ...prev.map(e => ({ ...e, collapsed: true })),
    ]);
  };

  const toggleCollapse = (id: string) => {
    setEsercizi(prev => prev.map(e =>
      e.id === id ? { ...e, collapsed: !e.collapsed } : e
    ));
  };

  const updateNome = (id: string, nome: string) => {
    setEsercizi(prev => prev.map(e => e.id === id ? { ...e, nome } : e));
    setSuggestions(getSuggestions(nome));
    setActiveInput(id);
  };

  const selectSuggestion = (esId: string, nome: string) => {
    setEsercizi(prev => prev.map(e => e.id === esId ? { ...e, nome } : e));
    setSuggestions([]);
    setActiveInput(null);
  };

  const updateSet = (esId: string, setId: string, field: 'reps' | 'peso', value: string) => {
    setEsercizi(prev => prev.map(e => {
      if (e.id !== esId) return e;
      return { ...e, sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) };
    }));
  };

  const addSetToEsercizio = (esId: string) => {
    setEsercizi(prev => prev.map(e => {
      if (e.id !== esId) return e;
      const lastSet = e.sets[e.sets.length - 1];
      if (!lastSet.reps.trim() && !lastSet.peso.trim()) return e;
      return { ...e, sets: [...e.sets, emptySet(lastSet)] };
    }));
  };

  const removeSet = (esId: string, setId: string) => {
    setEsercizi(prev => prev.map(e => {
      if (e.id !== esId || e.sets.length === 1) return e;
      return { ...e, sets: e.sets.filter(s => s.id !== setId) };
    }));
  };

  const handleFinish = () => {
    if (!workoutId) return;
    const hasAny = esercizi.some(
      es => es.nome.trim() && es.sets.some(s => s.reps.trim() || s.peso.trim())
    );
    if (!hasAny) {
      Alert.alert(i18n.t('esercizi.emptyWorkout'), i18n.t('esercizi.addAtLeastOne'));
      return;
    }
    
    // Non serve ri-salvare i sets qui, lo fa già il sync in background.
    // Dobbiamo solo marcare il workout come completato settando la durata.
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    finishWorkout(workoutId, elapsed);
    router.replace('/(tabs)');
  };

  const handleDiscard = () => {
    Alert.alert(
      i18n.t('esercizi.cancelWorkout'),
      i18n.t('esercizi.cancelConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('esercizi.cancelWorkout'), style: 'destructive',
          onPress: () => {
            if (workoutId) deleteWorkout(workoutId);
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.headerCancel}>{i18n.t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sport ?? i18n.t('esercizi.palestra')}</Text>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={styles.headerCancelRed}>{i18n.t('esercizi.deleteBtn')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.addEsercizioBtn} onPress={addEsercizio}>
          <Text style={styles.addEsercizioBtnText}>{i18n.t('esercizi.addExercise')}</Text>
        </TouchableOpacity>

        {esercizi.map((es) => (
          <View key={es.id}>
            {es.collapsed ? (
              <TouchableOpacity
                style={styles.collapsedCard}
                onPress={() => toggleCollapse(es.id)}
                activeOpacity={0.7}
              >
                <View style={styles.collapsedRow}>
                  <Text style={styles.collapsedName} numberOfLines={1}>
                    {es.nome || i18n.t('esercizi.unnamedExercise')}
                  </Text>
                  <Text style={styles.collapsedChevron}>›</Text>
                </View>
                <Text style={styles.collapsedMeta}>
                  {es.sets.length} {es.sets.length === 1 ? i18n.t('esercizi.series') : i18n.t('esercizi.series')}
                  {es.sets[0]?.peso ? ` · ${es.sets[0].peso} kg` : ''}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.esercizioCard}>
                <TextInput
                  style={styles.esercizioNome}
                  placeholder={i18n.t('esercizi.exerciseName')}
                  placeholderTextColor={colors.gray3}
                  value={es.nome}
                  onChangeText={v => updateNome(es.id, v)}
                  onFocus={() => {
                    setSuggestions(getSuggestions(es.nome));
                    setActiveInput(es.id);
                  }}
                  onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                  returnKeyType="done"
                />

                {activeInput === es.id && suggestions.length > 0 && (
                  <View style={styles.suggestionsBox}>
                    {suggestions.map((s, i) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.suggestionItem,
                          i === suggestions.length - 1 && { borderBottomWidth: 0 },
                        ]}
                        onPress={() => selectSuggestion(es.id, s)}
                      >
                        <Text style={styles.suggestionText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={styles.setHeaderRow}>
                  <Text style={[styles.setHeaderCell, { width: 32 }]}>{i18n.t('esercizi.set')}</Text>
                  <Text style={[styles.setHeaderCell, { flex: 1 }]}>{i18n.t('esercizi.kg')}</Text>
                  <Text style={[styles.setHeaderCell, { flex: 1 }]}>{i18n.t('esercizi.reps')}</Text>
                  <View style={{ width: 24 }} />
                </View>

                {es.sets.map((s, sIndex) => (
                  <View key={s.id} style={styles.setRow}>
                    <View style={styles.setNumber}>
                      <Text style={styles.setNumberText}>{sIndex + 1}</Text>
                    </View>
                    <TextInput
                      style={[styles.setInput, { flex: 1 }]}
                      placeholder="—"
                      placeholderTextColor={colors.gray3}
                      value={s.peso}
                      onChangeText={v => updateSet(es.id, s.id, 'peso', v)}
                      keyboardType="decimal-pad"
                    />
                    <TextInput
                      style={[styles.setInput, { flex: 1 }]}
                      placeholder="—"
                      placeholderTextColor={colors.gray3}
                      value={s.reps}
                      onChangeText={v => updateSet(es.id, s.id, 'reps', v)}
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity
                      onPress={() => removeSet(es.id, s.id)}
                      hitSlop={10}
                      style={styles.removeSetBtn}
                    >
                      <Text style={styles.removeSetIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addSetBtn}
                  onPress={() => addSetToEsercizio(es.id)}
                >
                  <Text style={styles.addSetText}>{i18n.t('esercizi.addSet')}</Text>
                </TouchableOpacity>

                {esercizi.length > 1 && (
                  <TouchableOpacity
                    style={styles.collapseBtn}
                    onPress={() => toggleCollapse(es.id)}
                  >
                    <Text style={styles.collapseBtnText}>{i18n.t('esercizi.collapse')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
        <View style={styles.finishWrap}>
          <TouchableOpacity style={styles.finishBigBtn} onPress={handleFinish}>
            <Text style={styles.finishBigBtnText}>{i18n.t('esercizi.finishWorkout')}</Text>
          </TouchableOpacity>
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
  finishBtn: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  finishBtnText: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.bg },

  scroll: { padding: spacing.lg, paddingBottom: 60 },

  headerCancelRed: { fontFamily: fonts.sans, fontSize: 15, color: '#FF3B30' },
  finishWrap: { marginTop: spacing.md, marginBottom: 20 },
  finishBigBtn: { backgroundColor: colors.white, paddingVertical: 18, borderRadius: radius.lg, alignItems: 'center' },
  finishBigBtnText: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.bg },
  addEsercizioBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: 14,
  },
  addEsercizioBtnText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.white },

  collapsedCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 10,
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsedName: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.white,
    flex: 1,
  },
  collapsedChevron: { color: colors.gray3, fontSize: 20, marginLeft: 8 },
  collapsedMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.gray3, marginTop: 4 },

  esercizioCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 10,
  },
  esercizioNome: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    color: colors.white,
    paddingVertical: 4,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  suggestionsBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: { fontFamily: fonts.sans, fontSize: 14, color: colors.white },

  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    marginTop: 10,
  },
  setHeaderCell: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.gray3,
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  setNumber: {
    width: 32, height: 36,
    backgroundColor: colors.bg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.gray2 },
  setInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.white,
    textAlign: 'center',
  },
  removeSetBtn: { width: 24, alignItems: 'center', justifyContent: 'center' },
  removeSetIcon: { fontSize: 12, color: '#FF3B30', paddingHorizontal: 4 },

  addSetBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  addSetText: { fontFamily: fonts.sans, fontSize: 13, color: colors.gray3 },

  collapseBtn: { marginTop: 12, alignItems: 'center' },
  collapseBtnText: { fontFamily: fonts.sans, fontSize: 12, color: colors.gray3 },
});

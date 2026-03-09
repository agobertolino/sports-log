import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { addSet, finishWorkout, deleteWorkout, createWorkout } from '@/db/workouts';
import db from '@/db/database';

const ESERCIZI_COMUNI = [
  // Chest
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

// ── Componente principale ─────────────────────────────────────
export default function Esercizi() {
  const { sport } = useLocalSearchParams<{ sport: string }>();
  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const [esercizi, setEsercizi] = useState<EsercizioBlock[]>([newEsercizio()]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [pastNames, setPastNames] = useState<string[]>([]);
  const startTime = useRef(Date.now());

  // Crea workout nel DB al mount
  useEffect(() => {
    const id = createWorkout({ sport: sport ?? 'Palestra', muscoli: [] });
    setWorkoutId(id);
  }, []);

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

  // ── Esercizio handlers ───────────────────────────────────────
  const addEsercizio = () => {
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

  // ── Set handlers ─────────────────────────────────────────────
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
      if (!lastSet.reps.trim() && !lastSet.peso.trim()) return e; // blocca se vuota
      return { ...e, sets: [...e.sets, emptySet(lastSet)] };
    }));
  };

  const removeSet = (esId: string, setId: string) => {
    setEsercizi(prev => prev.map(e => {
      if (e.id !== esId || e.sets.length === 1) return e;
      return { ...e, sets: e.sets.filter(s => s.id !== setId) };
    }));
  };

  // ── Fine allenamento ──────────────────────────────────────────
  const handleFinish = () => {
    if (!workoutId) return;
    const hasAny = esercizi.some(
      es => es.nome.trim() && es.sets.some(s => s.reps.trim() || s.peso.trim())
    );
    if (!hasAny) {
      Alert.alert('Allenamento vuoto', 'Aggiungi almeno un esercizio con una serie.');
      return;
    }
    esercizi.forEach(es => {
      if (!es.nome.trim()) return;
      es.sets.forEach((s, i) => {
        addSet({
          workout_id: workoutId,
          esercizio: es.nome.trim(),
          serie: i + 1,
          reps: s.reps ? parseInt(s.reps) : undefined,
          peso_kg: s.peso ? parseFloat(s.peso) : undefined,
        });
      });
    });
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    finishWorkout(workoutId, elapsed);
    router.replace('/(tabs)');
  };

  const handleDiscard = () => {
    Alert.alert(
      'Annulla allenamento',
      "Sei sicuro? L'allenamento non verrà salvato.",
      [
        { text: 'Continua', style: 'cancel' },
        {
          text: 'Annulla allenamento', style: 'destructive',
          onPress: () => {
            if (workoutId) deleteWorkout(workoutId);
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={styles.headerCancel}>Annulla</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sport ?? 'Palestra'}</Text>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>Fine</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Aggiungi esercizio (in cima) ── */}
        <TouchableOpacity style={styles.addEsercizioBtn} onPress={addEsercizio}>
          <Text style={styles.addEsercizioBtnText}>+ Aggiungi esercizio</Text>
        </TouchableOpacity>

        {/* ── Lista esercizi ── */}
        {esercizi.map((es) => (
          <View key={es.id}>
            {es.collapsed ? (
              // ── Card collassata ──
              <TouchableOpacity
                style={styles.collapsedCard}
                onPress={() => toggleCollapse(es.id)}
                activeOpacity={0.7}
              >
                <View style={styles.collapsedRow}>
                  <Text style={styles.collapsedName} numberOfLines={1}>
                    {es.nome || 'Esercizio senza nome'}
                  </Text>
                  <Text style={styles.collapsedChevron}>›</Text>
                </View>
                <Text style={styles.collapsedMeta}>
                  {es.sets.length} {es.sets.length === 1 ? 'serie' : 'serie'}
                  {es.sets[0]?.peso ? ` · ${es.sets[0].peso} kg` : ''}
                </Text>
              </TouchableOpacity>
            ) : (
              // ── Card espansa ──
              <View style={styles.esercizioCard}>
                {/* Nome + autocomplete */}
                <TextInput
                  style={styles.esercizioNome}
                  placeholder="Nome esercizio"
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

                {/* Suggerimenti autocomplete */}
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

                {/* Header colonne serie */}
                <View style={styles.setHeaderRow}>
                  <Text style={[styles.setHeaderCell, { width: 32 }]}>SET</Text>
                  <Text style={[styles.setHeaderCell, { flex: 1 }]}>KG</Text>
                  <Text style={[styles.setHeaderCell, { flex: 1 }]}>REPS</Text>
                  <View style={{ width: 24 }} />
                </View>

                {/* Serie */}
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

                {/* Aggiungi serie */}
                <TouchableOpacity
                  style={styles.addSetBtn}
                  onPress={() => addSetToEsercizio(es.id)}
                >
                  <Text style={styles.addSetText}>+ Aggiungi serie</Text>
                </TouchableOpacity>

                {/* Collassa */}
                {esercizi.length > 1 && (
                  <TouchableOpacity
                    style={styles.collapseBtn}
                    onPress={() => toggleCollapse(es.id)}
                  >
                    <Text style={styles.collapseBtnText}>Riduci ↑</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Stili ─────────────────────────────────────────────────────
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

  // Aggiungi esercizio (top)
  addEsercizioBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: 14,
  },
  addEsercizioBtnText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.white },

  // Card collassata
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

  // Card espansa
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

  // Autocomplete
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

  // Header colonne
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

  // Riga serie
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
  removeSetIcon: { fontSize: 12, color: colors.gray4 },

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
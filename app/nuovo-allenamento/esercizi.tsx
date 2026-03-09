import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { addSet, finishWorkout, deleteWorkout } from '@/db/workouts';

type SetRow = {
  id: string;
  serie: string;
  reps: string;
  peso: string;
};

type EsercizioBlock = {
  id: string;
  nome: string;
  muscolo: string;
  sets: SetRow[];
};

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function emptySet(): SetRow {
  return { id: makeId(), serie: '1', reps: '', peso: '' };
}

function emptyEsercizio(muscolo: string): EsercizioBlock {
  return { id: makeId(), nome: '', muscolo, sets: [emptySet()] };
}

export default function Esercizi() {
  const { workoutId, muscoli } = useLocalSearchParams<{
    workoutId: string;
    muscoli: string;
  }>();

  const muscoliList = muscoli ? muscoli.split(',') : [];
  const firstMuscolo = muscoliList[0] ?? '';

  const [esercizi, setEsercizi] = useState<EsercizioBlock[]>([
    emptyEsercizio(firstMuscolo),
  ]);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ── Esercizio handlers ───────────────────────────────────
  const updateEsercizioNome = (id: string, nome: string) => {
    setEsercizi(prev => prev.map(e => e.id === id ? { ...e, nome } : e));
  };

  const updateEsercizioMuscolo = (id: string, muscolo: string) => {
    setEsercizi(prev => prev.map(e => e.id === id ? { ...e, muscolo } : e));
  };

  const addEsercizio = () => {
    setEsercizi(prev => [...prev, emptyEsercizio(firstMuscolo)]);
  };

  const removeEsercizio = (id: string) => {
    if (esercizi.length === 1) return;
    setEsercizi(prev => prev.filter(e => e.id !== id));
  };

  // ── Set handlers ─────────────────────────────────────────
  const updateSet = (esId: string, setId: string, field: keyof SetRow, value: string) => {
    setEsercizi(prev => prev.map(e => {
      if (e.id !== esId) return e;
      return {
        ...e,
        sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s),
      };
    }));
  };

  const addSetToEsercizio = (esId: string) => {
    setEsercizi(prev => prev.map(e => {
      if (e.id !== esId) return e;
      const lastSet = e.sets[e.sets.length - 1];
      return {
        ...e,
        sets: [...e.sets, {
          id: makeId(),
          serie: String(e.sets.length + 1),
          reps: lastSet?.reps ?? '',
          peso: lastSet?.peso ?? '',
        }],
      };
    }));
  };

  const removeSet = (esId: string, setId: string) => {
    setEsercizi(prev => prev.map(e => {
      if (e.id !== esId || e.sets.length === 1) return e;
      return { ...e, sets: e.sets.filter(s => s.id !== setId) };
    }));
  };

  // ── Finish workout ────────────────────────────────────────
  const handleFinish = () => {
    const id = parseInt(workoutId ?? '0');
    if (!id) { router.replace('/(tabs)'); return; }

    const hasAnyValidSet = esercizi.some(
      es => es.nome.trim() && es.sets.some(s => s.reps.trim() || s.peso.trim())
    );
    if (!hasAnyValidSet) {
      Alert.alert(
        'Allenamento vuoto',
        'Aggiungi almeno un esercizio con un nome e una serie prima di finire.'
      );
      return;
    }

    // Save all sets to DB
    esercizi.forEach(es => {
      if (!es.nome.trim()) return;
      es.sets.forEach(s => {
        addSet({
          workout_id: id,
          esercizio: es.nome.trim(),
          muscolo: es.muscolo || undefined,
          serie: s.serie ? parseInt(s.serie) : undefined,
          reps: s.reps ? parseInt(s.reps) : undefined,
          peso_kg: s.peso ? parseFloat(s.peso) : undefined,
        });
      });
    });

    finishWorkout(id, elapsed);
    router.replace('/(tabs)');
  };

  const handleDiscard = () => {
    Alert.alert(
      'Annulla allenamento',
      'Sei sicuro? L\'allenamento non verrà salvato.',
      [
        { text: 'Continua', style: 'cancel' },
        {
          text: 'Annulla allenamento', style: 'destructive',
          onPress: () => {
            const id = parseInt(workoutId ?? '0');
            if (id) deleteWorkout(id);
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDiscard}>
            <Text style={styles.headerDiscard}>Annulla</Text>
          </TouchableOpacity>
          <Text style={styles.headerTimer}>{formatTime(elapsed)}</Text>
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <Text style={styles.finishBtnText}>Fine</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Muscolo pills */}
          {muscoliList.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.muscoliRow}
              contentContainerStyle={{ gap: 8, paddingRight: spacing.lg }}
            >
              {muscoliList.map(m => (
                <View key={m} style={styles.muscoloPill}>
                  <Text style={styles.muscoloPillText}>{m}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Esercizi */}
          {esercizi.map((es, esIndex) => (
            <View key={es.id} style={styles.esercizioCard}>

              {/* Esercizio header */}
              <View style={styles.esercizioHeader}>
                <TextInput
                  style={styles.esercizioNome}
                  placeholder="Nome esercizio"
                  placeholderTextColor={colors.gray3}
                  value={es.nome}
                  onChangeText={v => updateEsercizioNome(es.id, v)}
                />
                {esercizi.length > 1 && (
                  <TouchableOpacity onPress={() => removeEsercizio(es.id)} hitSlop={12}>
                    <Text style={styles.removeIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Muscolo selector */}
              {muscoliList.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 16 }}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {muscoliList.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.muscSel, es.muscolo === m && styles.muscSelActive]}
                      onPress={() => updateEsercizioMuscolo(es.id, m)}
                    >
                      <Text style={[styles.muscSelText, es.muscolo === m && styles.muscSelTextActive]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Set column headers */}
              <View style={styles.setHeaderRow}>
                <Text style={[styles.setHeaderCell, { width: 36 }]}>SET</Text>
                <Text style={[styles.setHeaderCell, { flex: 1 }]}>KG</Text>
                <Text style={[styles.setHeaderCell, { flex: 1 }]}>REPS</Text>
                <View style={{ width: 28 }} />
              </View>

              {/* Sets */}
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
                    style={styles.removeSetBtn}
                    onPress={() => removeSet(es.id, s.id)}
                    hitSlop={10}
                  >
                    <Text style={styles.removeSetIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add set */}
              <TouchableOpacity
                style={styles.addSetBtn}
                onPress={() => addSetToEsercizio(es.id)}
              >
                <Text style={styles.addSetText}>+ Aggiungi serie</Text>
              </TouchableOpacity>

            </View>
          ))}

          {/* Add esercizio */}
          <TouchableOpacity style={styles.addEsercizioBtn} onPress={addEsercizio}>
            <Text style={styles.addEsercizioBtnText}>+ Aggiungi esercizio</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerDiscard: { fontFamily: fonts.sans, fontSize: 15, color: colors.gray3 },
  headerTimer: { fontFamily: fonts.serifItalic, fontSize: 22, color: colors.white },
  finishBtn: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  finishBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.bg },

  scroll: { padding: spacing.lg, paddingBottom: 60 },

  // Muscoli pills
  muscoliRow: { marginBottom: spacing.lg },
  muscoloPill: {
    backgroundColor: colors.gray4,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  muscoloPillText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.gray2 },

  // Esercizio card
  esercizioCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 14,
  },
  esercizioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  esercizioNome: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    color: colors.white,
    padding: 0,
  },
  removeIcon: { fontSize: 14, color: colors.gray3, paddingLeft: 12 },

  // Muscolo selector chips
  muscSel: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  muscSelActive: { borderColor: colors.white, backgroundColor: colors.white },
  muscSelText: { fontFamily: fonts.sans, fontSize: 12, color: colors.gray3 },
  muscSelTextActive: { color: colors.bg, fontFamily: fonts.sansSemiBold },

  // Sets
  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 2,
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
    width: 36, height: 36,
    backgroundColor: colors.gray4,
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
  removeSetBtn: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
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

  // Add esercizio
  addEsercizioBtn: {
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addEsercizioBtnText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.gray2 },
});

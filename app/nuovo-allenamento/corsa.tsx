import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { createWorkout, finishWorkout, deleteWorkout } from '@/db/workouts';
import db from '@/db/database';

function formatPasso(prev: string, next: string): string {
  const clean = next.replace(/[^\d]/g, '');
  if (clean.length >= 3) return `${clean.slice(0, 1)}:${clean.slice(1, 3)}`;
  if (clean.length === 2 && prev.length === 3) return clean.slice(0, 1);
  return clean;
}

function calcolaTempo(km: string, minKm: string): string {
  const k = parseFloat(km);
  if (!k || !minKm.includes(':')) return '';
  const [m, s] = minKm.split(':').map(Number);
  if (isNaN(m) || isNaN(s)) return '';
  const totalSec = k * (m * 60 + s);
  const h = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = Math.floor(totalSec % 60);
  return h > 0
    ? `${h}h ${min}min ${sec.toString().padStart(2, '0')}s`
    : `${min}min ${sec.toString().padStart(2, '0')}s`;
}

export default function Corsa() {
  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const [km, setKm] = useState('');
  const [minKm, setMinKm] = useState('');
  const startTime = useRef(Date.now());

  useEffect(() => {
    const id = createWorkout({ sport: 'Corsa', muscoli: [] });
    setWorkoutId(id);
  }, []);

  const tempo = calcolaTempo(km, minKm);

  const handleFinish = () => {
    if (!workoutId) return;
    if (!km.trim()) {
      Alert.alert('Distanza mancante', 'Inserisci almeno i km percorsi.');
      return;
    }
    db.runSync(
      `INSERT INTO workout_sets (workout_id, esercizio, muscolo, serie, reps, peso_kg) VALUES (?, ?, ?, ?, ?, ?)`,
      [workoutId, 'Corsa', minKm || null, 1, null, parseFloat(km) || null]
    );
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={styles.headerCancel}>Annulla</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Corsa</Text>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>Fine</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Distanza</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                placeholderTextColor={colors.gray3}
                value={km}
                onChangeText={setKm}
                keyboardType="decimal-pad"
                autoFocus
              />
              <Text style={styles.unit}>km</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Passo medio</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="5:30"
                placeholderTextColor={colors.gray3}
                value={minKm}
                onChangeText={v => setMinKm(formatPasso(minKm, v))}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Text style={styles.unit}>min/km</Text>
            </View>
          </View>
        </View>

        {tempo ? (
          <View style={styles.tempoCard}>
            <Text style={styles.tempoLabel}>Tempo stimato</Text>
            <Text style={styles.tempoValue}>{tempo}</Text>
          </View>
        ) : null}

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

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
  },
  fieldWrap: { paddingVertical: 6 },
  fieldLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.gray3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
  },
  unit: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray3,
    width: 52,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },

  tempoCard: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
  },
  tempoLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.gray3,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tempoValue: {
    fontFamily: fonts.serifItalic,
    fontSize: 26,
    color: colors.white,
  },
});
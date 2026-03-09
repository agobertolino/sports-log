import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { createWorkout, finishWorkout, deleteWorkout } from '@/db/workouts';
import db from '@/db/database';

// ── Helpers ───────────────────────────────────────────────────

function formatTempo(prev: string, next: string): string {
  const clean = next.replace(/[^\d]/g, '');
  if (clean.length >= 5) return `${clean.slice(0, 1)}:${clean.slice(1, 3)}:${clean.slice(3, 5)}`;
  if (clean.length >= 3) return `${clean.slice(0, clean.length - 2)}:${clean.slice(-2)}`;
  if (clean.length === 2 && prev.length === 3) return clean.slice(0, 1);
  return clean;
}

function tempoToSec(t: string): number | null {
  const parts = t.split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function secToString(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}

function calcolaTempo(km: string, kmh: string): string {
  const k = parseFloat(km);
  const v = parseFloat(kmh);
  if (!k || !v || v <= 0) return '1:30:00';
  return secToString((k / v) * 3600);
}

function calcolaVelocita(km: string, tempo: string): string {
  const k = parseFloat(km);
  const sec = tempoToSec(tempo);
  if (!k || !sec || sec <= 0) return '28';
  return ((k / sec) * 3600).toFixed(1);
}

// ── Componente ────────────────────────────────────────────────

export default function Ciclismo() {
  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const [km, setKm] = useState('');
  const [kmh, setKmh] = useState('');
  const [tempo, setTempo] = useState('');
  const startTime = useRef(Date.now());

  useEffect(() => {
    const id = createWorkout({ sport: 'Ciclismo', muscoli: [] });
    setWorkoutId(id);
  }, []);

  const tempoCalcolato = kmh ? calcolaTempo(km, kmh) : '';
  const velCalcolata = tempo ? calcolaVelocita(km, tempo) : '';

  const handleFinish = () => {
    if (!workoutId) return;
    if (!km.trim()) {
      Alert.alert('Distanza mancante', 'Inserisci almeno i km percorsi.');
      return;
    }
    db.runSync(
      `INSERT INTO workout_sets (workout_id, esercizio, muscolo, serie, reps, peso_kg) VALUES (?, ?, ?, ?, ?, ?)`,
      [workoutId, 'Ciclismo', kmh || tempo || null, 1, null, parseFloat(km) || null]
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
        <Text style={styles.headerTitle}>Ciclismo</Text>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>Fine</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          {/* Distanza */}
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

          {/* Velocità — disabilitato se tempo è compilato */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Velocità media</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, tempo.length > 0 && styles.inputDimmed]}
                placeholder={velCalcolata || '28'}
                placeholderTextColor={velCalcolata ? colors.gray2 : colors.gray3}
                value={kmh}
                onChangeText={v => { setKmh(v); if (v) setTempo(''); }}
                keyboardType="decimal-pad"
                editable={tempo.length === 0}
              />
              <Text style={styles.unit}>km/h</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tempo — disabilitato se velocità è compilata */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Tempo impiegato</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, kmh.length > 0 && styles.inputDimmed]}
                placeholder={tempoCalcolato || '1:30:00'}
                placeholderTextColor={tempoCalcolato ? colors.gray2 : colors.gray3}
                value={tempo}
                onChangeText={v => { setTempo(formatTempo(tempo, v)); if (v) setKmh(''); }}
                keyboardType="number-pad"
                maxLength={7}
                editable={kmh.length === 0}
              />
              <Text style={styles.unit}>h:mm:ss</Text>
            </View>
          </View>
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
  inputDimmed: {
    opacity: 0.3,
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
});
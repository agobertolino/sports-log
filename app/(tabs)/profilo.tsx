import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getUser, updateUser } from '@/db/users';
import db from '@/db/database';

export default function Profilo() {
  const [nome, setNome] = useState('');
  const [nascita, setNascita] = useState('');
  const [peso, setPeso] = useState('');
  const [altezza, setAltezza] = useState('');
  const [saved, setSaved] = useState(false);
  const [dbLog, setDbLog] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const user = getUser();
      if (user) {
        setNome(user.nome);
        setNascita(user.data_nascita ?? '');
        setPeso(user.peso?.toString() ?? '');
        setAltezza(user.altezza?.toString() ?? '');
      }
    }, [])
  );

  const handleSave = () => {
    if (!nome.trim()) { Alert.alert('Il nome è richiesto'); return; }
    updateUser({
      nome: nome.trim(),
      data_nascita: nascita || undefined,
      peso: peso ? parseFloat(peso) : undefined,
      altezza: altezza ? parseFloat(altezza) : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetDB = () => {
    Alert.alert(
      'Reset dati',
      'Tutti i dati verranno cancellati. Sei sicuro?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: () => {
            db.execSync('DELETE FROM workout_sets');
            db.execSync('DELETE FROM workouts');
            db.execSync('DELETE FROM users');
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleLogDB = () => {
    const users = db.getAllSync('SELECT * FROM users');
    const workouts = db.getAllSync('SELECT * FROM workouts');
    const sets = db.getAllSync('SELECT * FROM workout_sets');
    const output = [
      '── USERS ──',
      JSON.stringify(users, null, 2),
      '── WORKOUTS ──',
      JSON.stringify(workouts, null, 2),
      '── SETS ──',
      JSON.stringify(sets, null, 2),
    ].join('\n');
    console.log(output);
    setDbLog(output);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Profilo</Text>

        <Field label="Nome" required value={nome} onChange={setNome} placeholder="Il tuo nome" />
        <Field label="Data di nascita" value={nascita} onChange={setNascita} placeholder="GG/MM/AAAA" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Peso" value={peso} onChange={setPeso} placeholder="75" unit="kg" numeric />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Altezza" value={altezza} onChange={setAltezza} placeholder="178" unit="cm" numeric />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{saved ? 'Salvato ✓' : 'Salva modifiche'}</Text>
        </TouchableOpacity>

        {/* ── Debug DB ── */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug</Text>
          <TouchableOpacity style={styles.debugBtn} onPress={handleLogDB} activeOpacity={0.8}>
            <Text style={styles.debugBtnText}>Mostra contenuto DB</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.debugBtn, styles.debugBtnDanger]} onPress={handleResetDB} activeOpacity={0.8}>
            <Text style={styles.debugBtnDangerText}>Reset tutti i dati</Text>
          </TouchableOpacity>
          {dbLog && (
            <ScrollView style={styles.debugLog} nestedScrollEnabled>
              <Text style={styles.debugLogText}>{dbLog}</Text>
            </ScrollView>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, placeholder, unit, required = false, numeric = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; unit?: string; required?: boolean; numeric?: boolean;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <View style={fieldStyles.labelRow}>
        <Text style={fieldStyles.label}>{label}</Text>
        {required && <View style={fieldStyles.badge}><Text style={fieldStyles.badgeText}>Richiesto</Text></View>}
        {unit && <Text style={fieldStyles.unit}>{unit}</Text>}
      </View>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.gray3}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.white, marginBottom: spacing.xl },
  row: { flexDirection: 'row', gap: 12 },
  saveBtn: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    paddingVertical: 20, alignItems: 'center', marginTop: spacing.lg,
  },
  saveBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.bg },

  debugSection: {
    marginTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  debugTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.gray3,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  debugBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  debugBtnText: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
  debugBtnDanger: {
    borderColor: 'rgba(255,80,80,0.3)',
    marginTop: 8,
  },
  debugBtnDangerText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: '#FF6B6B',
  },
  debugLog: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: 14,
    maxHeight: 300,
  },
  debugLogText: {
  fontFamily: fonts.sans,
  fontSize: 11,
  color: colors.gray2,
  lineHeight: 18,
  },
 }
);

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  label: {
    fontFamily: fonts.sansMedium, fontSize: 12, color: colors.gray3,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  badge: { backgroundColor: colors.gray4, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  badgeText: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.white },
  unit: { fontFamily: fonts.sans, fontSize: 11, color: colors.gray3 },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 18,
    fontFamily: fonts.sans, fontSize: 16, color: colors.white,
  },
});
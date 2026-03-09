import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { createUser } from '@/db/users';
import Button from '@/components/Button';

type Step = 0 | 1;

export default function Onboarding() {
  const [step, setStep] = useState<Step>(0);
  const [nome, setNome] = useState('');
  const [nascita, setNascita] = useState('');
  const [peso, setPeso] = useState('');
  const [altezza, setAltezza] = useState('');
  const [error, setError] = useState(false);

  const handleNext = () => {
    if (step === 0) {
      if (!nome.trim()) { setError(true); return; }
      setError(false);
      setStep(1);
    } else {
      saveAndContinue();
    }
  };

  const saveAndContinue = () => {
    createUser({
      nome: nome.trim(),
      data_nascita: nascita || undefined,
      peso: peso ? parseFloat(peso) : undefined,
      altezza: altezza ? parseFloat(altezza) : undefined,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Progress dots */}
          <View style={styles.dots}>
            <View style={[styles.dot, step >= 0 && styles.dotActive]} />
            <View style={[styles.dot, step >= 1 && styles.dotActive]} />
          </View>

          {step === 0 ? (
            <>
              <Text style={styles.eyebrow}>Benvenuto</Text>
              <Text style={styles.title}>Come ti{'\n'}<Text style={styles.titleItalic}>chiami?</Text></Text>
              <Text style={styles.subtitle}>
                È tutto quello che ci serve.{'\n'}
                <Text style={{ color: colors.gray2 }}>Il resto è facoltativo.</Text>
              </Text>

              <View style={styles.fieldWrap}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Nome</Text>
                  <View style={styles.badge}><Text style={styles.badgeText}>Richiesto</Text></View>
                </View>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="es. Marco"
                  placeholderTextColor={colors.gray3}
                  value={nome}
                  onChangeText={t => { setNome(t); setError(false); }}
                  onSubmitEditing={handleNext}
                  returnKeyType="next"
                  autoFocus
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.eyebrow}>Profilo</Text>
              <Text style={styles.title}>Qualcosa{'\n'}su di <Text style={styles.titleItalic}>te.</Text></Text>
              <Text style={styles.subtitle}>
                Tutto opzionale —{'\n'}
                <Text style={{ color: colors.gray2 }}>puoi completare dopo nelle impostazioni.</Text>
              </Text>

              <View style={styles.fieldWrap}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Data di nascita</Text>
                  <Text style={styles.optional}>Opzionale</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="GG/MM/AAAA"
                  placeholderTextColor={colors.gray3}
                  value={nascita}
                  onChangeText={setNascita}
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <View style={styles.labelRow}>
                    <Text style={styles.fieldLabel}>Peso</Text>
                    <Text style={styles.optional}>kg</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="75"
                    placeholderTextColor={colors.gray3}
                    value={peso}
                    onChangeText={setPeso}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <View style={styles.labelRow}>
                    <Text style={styles.fieldLabel}>Altezza</Text>
                    <Text style={styles.optional}>cm</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="178"
                    placeholderTextColor={colors.gray3}
                    value={altezza}
                    onChangeText={setAltezza}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </>
          )}

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.btnPrimaryText}>
                {step === 0 ? 'Continua' : `Inizia, ${nome.trim()}`}{'  →'}
              </Text>
            </TouchableOpacity>

            {step === 1 && (
              <>
                <Button label="Salta per ora" onPress={saveAndContinue} variant="ghost" />
                <Button label="← Torna indietro" onPress={() => setStep(0)} variant="ghost" />
              </>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 36 },
  dot: { height: 3, width: 8, borderRadius: 2, backgroundColor: colors.gray4 },
  dotActive: { width: 24, backgroundColor: colors.white },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.gray3,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 38,
    color: colors.white,
    lineHeight: 46,
    marginBottom: 10,
  },
  titleItalic: {
    fontFamily: fonts.serifItalic,
    color: colors.gray2,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.gray3,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  fieldWrap: { marginBottom: spacing.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  fieldLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.gray3,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  badge: { backgroundColor: colors.gray4, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  badgeText: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.white, letterSpacing: 0.4 },
  optional: { fontFamily: fonts.sans, fontSize: 11, color: colors.gray3 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 18,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.white,
  },
  inputError: { borderColor: colors.error },
  row: { flexDirection: 'row', gap: 12 },
  actions: { marginTop: 'auto', paddingTop: spacing.xl, gap: 10 },
  btnPrimary: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: 20,
    alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.bg },
  btnGhost: { paddingVertical: 12, alignItems: 'center' },
  btnGhostText: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
});

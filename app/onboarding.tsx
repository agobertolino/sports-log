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

type Errors = {
  nome?: string;
  nascita?: string;
  peso?: string;
  altezza?: string;
};

function validateDate(val: string): string | undefined {
  if (!val.trim()) return undefined; // opzionale
  const parts = val.split('/');
  if (parts.length !== 3) return 'Formato: GG/MM/AAAA';
  const [dd, mm, yyyy] = parts.map(Number);
  if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return 'Formato: GG/MM/AAAA';
  if (yyyy < 1900 || yyyy > new Date().getFullYear()) return 'Anno non valido';
  if (mm < 1 || mm > 12) return 'Mese non valido';
  if (dd < 1 || dd > 31) return 'Giorno non valido';
  const d = new Date(yyyy, mm - 1, dd);
  if (d > new Date()) return 'Data nel futuro';
  if (d.getMonth() !== mm - 1) return 'Data non valida';
  return undefined;
}

function validatePeso(val: string): string | undefined {
  if (!val.trim()) return undefined;
  const n = parseFloat(val);
  if (isNaN(n)) return 'Inserisci un numero';
  if (n < 20 || n > 300) return 'Valore tra 20 e 300 kg';
  return undefined;
}

function validateAltezza(val: string): string | undefined {
  if (!val.trim()) return undefined;
  const n = parseFloat(val);
  if (isNaN(n)) return 'Inserisci un numero';
  if (n < 50 || n > 250) return 'Valore tra 50 e 250 cm';
  return undefined;
}

// Auto-formatta la data mentre si digita: aggiunge / dopo GG e MM
function formatDateInput(prev: string, next: string): string {
  // Rimuovi tutto tranne numeri e /
  let clean = next.replace(/[^\d]/g, '');
  if (clean.length > 8) clean = clean.slice(0, 8);
  if (clean.length >= 5) return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
  if (clean.length >= 3) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return clean;
}

export default function Onboarding() {
  const [step, setStep] = useState<Step>(0);
  const [nome, setNome] = useState('');
  const [nascita, setNascita] = useState('');
  const [peso, setPeso] = useState('');
  const [altezza, setAltezza] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const handleNext = () => {
    if (step === 0) {
      if (!nome.trim()) {
        setErrors({ nome: 'Il nome è richiesto' });
        return;
      }
      setErrors({});
      setStep(1);
    } else {
      const errs: Errors = {
        nascita: validateDate(nascita),
        peso: validatePeso(peso),
        altezza: validateAltezza(altezza),
      };
      const hasErrors = Object.values(errs).some(Boolean);
      if (hasErrors) { setErrors(errs); return; }
      setErrors({});
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
                  style={[styles.input, errors.nome && styles.inputError]}
                  placeholder="es. Marco"
                  placeholderTextColor={colors.gray3}
                  value={nome}
                  onChangeText={t => { setNome(t); setErrors(e => ({ ...e, nome: undefined })); }}
                  onSubmitEditing={handleNext}
                  returnKeyType="next"
                  autoFocus
                />
                {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
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
                  style={[styles.input, errors.nascita && styles.inputError]}
                  placeholder="GG/MM/AAAA"
                  placeholderTextColor={colors.gray3}
                  value={nascita}
                  onChangeText={v => {
                    setNascita(formatDateInput(nascita, v));
                    setErrors(e => ({ ...e, nascita: undefined }));
                  }}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {errors.nascita && <Text style={styles.errorText}>{errors.nascita}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <View style={styles.labelRow}>
                    <Text style={styles.fieldLabel}>Peso</Text>
                    <Text style={styles.optional}>kg</Text>
                  </View>
                  <TextInput
                    style={[styles.input, errors.peso && styles.inputError]}
                    placeholder="75"
                    placeholderTextColor={colors.gray3}
                    value={peso}
                    onChangeText={v => { setPeso(v); setErrors(e => ({ ...e, peso: undefined })); }}
                    keyboardType="decimal-pad"
                  />
                  {errors.peso && <Text style={styles.errorText}>{errors.peso}</Text>}
                </View>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <View style={styles.labelRow}>
                    <Text style={styles.fieldLabel}>Altezza</Text>
                    <Text style={styles.optional}>cm</Text>
                  </View>
                  <TextInput
                    style={[styles.input, errors.altezza && styles.inputError]}
                    placeholder="178"
                    placeholderTextColor={colors.gray3}
                    value={altezza}
                    onChangeText={v => { setAltezza(v); setErrors(e => ({ ...e, altezza: undefined })); }}
                    keyboardType="number-pad"
                  />
                  {errors.altezza && <Text style={styles.errorText}>{errors.altezza}</Text>}
                </View>
              </View>
            </>
          )}

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
  titleItalic: { fontFamily: fonts.serifItalic, color: colors.gray2 },
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
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 6,
    marginLeft: 2,
  },
  row: { flexDirection: 'row', gap: 12 },
  actions: { marginTop: 'auto', paddingTop: spacing.xl, gap: 10 },
  btnPrimary: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: 20,
    alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.bg },
});
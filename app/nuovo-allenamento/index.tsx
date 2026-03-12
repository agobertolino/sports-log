import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/theme';
import SportCard from '@/components/SportCard';
import { getUser } from '@/db/users';
import i18n from '@/i18n';

const SPORTS = [
  { id: 'Palestra', icon: '🏋️‍♂️', available: true, labelKey: 'nuovoAllenamento.palestra' },
  { id: 'Corsa', icon: '🏃‍♂️', available: false, labelKey: 'nuovoAllenamento.corsa' },
  { id: 'Ciclismo', icon: '🚴‍♂️', available: false, labelKey: 'nuovoAllenamento.ciclismo' },
  { id: 'Sci', icon: '⛷️', available: false, labelKey: 'nuovoAllenamento.sci' },
  { id: 'Altro', icon: '🎯', available: false, labelKey: 'nuovoAllenamento.altro' },
];

const ROUTES: Record<string, string> = {
  Palestra: '/nuovo-allenamento/esercizi',
  Corsa: '/nuovo-allenamento/corsa',
  Ciclismo: '/nuovo-allenamento/ciclismo',
};

export default function SceltaSport() {
  const user = getUser();
  const nome = user?.nome ?? i18n.t('common.athlete');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>{i18n.t('common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {i18n.t('nuovoAllenamento.whatDoWeDo')}<Text style={styles.titleItalic}>{nome}?</Text>
        </Text>

        <View style={styles.list}>
          {SPORTS.map(s => (
            <SportCard
              key={s.id}
              label={i18n.t(s.labelKey)}
              icon={s.icon}
              available={s.available}
              onPress={() => {
                if (!s.available) return;
                const pathname = ROUTES[s.id];
                if (!pathname) return;
                router.push({ pathname: pathname as any, params: { sport: s.id } });
              }}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl },
  back: { marginBottom: spacing.lg },
  backText: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray3 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.white,
    lineHeight: 40,
    marginBottom: spacing.xl,
  },
  titleItalic: { fontFamily: fonts.serifItalic, color: colors.gray2 },
  list: {},
});
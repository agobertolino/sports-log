import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/theme';
import SportCard from '@/components/SportCard';
import { getUser } from '@/db/users';

const SPORTS = [
  { id: 'Palestra', icon: '🏋️', available: true },
  { id: 'Corsa', icon: '🏃', available: false },
  { id: 'Ciclismo', icon: '🚴', available: false },
  { id: 'Sci', icon: '⛷️', available: false },
  { id: 'Altro', icon: '···', available: false },
];

export default function SceltaSport() {
  const user = getUser();
  const nome = user?.nome ?? 'atleta';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Indietro</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Cosa facciamo{'\n'}oggi, <Text style={styles.titleItalic}>{nome}?</Text>
        </Text>

        {/* Sport list */}
        <View style={styles.list}>
          {SPORTS.map(s => (
            <SportCard
              key={s.id}
              label={s.id}
              icon={s.icon}
              available={s.available}
              onPress={() => router.push({
                pathname: '/nuovo-allenamento/palestra',
                params: { sport: s.id },
              })}
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

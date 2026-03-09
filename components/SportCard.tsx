import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  label: string;
  icon: string;
  available?: boolean;
  onPress?: () => void;
};

export default function SportCard({ label, icon, available = true, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, !available && styles.disabled]}
      onPress={available ? onPress : undefined}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      {available
        ? <Text style={styles.chevron}>›</Text>
        : <View style={styles.tag}><Text style={styles.tagText}>Presto</Text></View>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  disabled: { opacity: 0.3 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 44, height: 44,
    backgroundColor: colors.gray4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  label: { fontFamily: fonts.sansMedium, fontSize: 17, color: colors.white },
  chevron: { fontSize: 20, color: colors.gray3 },
  tag: {
    backgroundColor: colors.gray4,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.gray3,
    letterSpacing: 0.4,
  },
});

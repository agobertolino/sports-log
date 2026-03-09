import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function MuscleChip({ label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray2,
  },
  selectedLabel: {
    fontFamily: fonts.sansSemiBold,
    color: colors.bg,
  },
});

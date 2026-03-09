import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  arrow?: boolean;
};

export default function Button({
  label, onPress, variant = 'primary', disabled = false, loading = false, arrow = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.white} />
        : <Text style={[styles.label, styles[`${variant}Label`]]}>
            {label}{arrow ? '  →' : ''}
          </Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.white,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.3,
  },
  label: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  primaryLabel: {
    fontFamily: fonts.sansSemiBold,
    color: colors.bg,
  },
  secondaryLabel: {
    fontFamily: fonts.sans,
    color: colors.gray2,
  },
  ghostLabel: {
    fontFamily: fonts.sans,
    color: colors.gray3,
    fontSize: 14,
  },
});

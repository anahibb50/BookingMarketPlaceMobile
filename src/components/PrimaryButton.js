import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  compact = false,
}) {
  const ghost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        ghost ? styles.ghost : styles.primary,
        compact ? styles.compact : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          ghost ? styles.ghostLabel : null,
          compact ? styles.compactLabel : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.orange,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  ghostLabel: {
    color: '#fff',
  },
  compact: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 220,
    minHeight: 42,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  compactLabel: {
    fontSize: 14,
  },
});

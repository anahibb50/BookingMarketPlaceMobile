import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/theme';

export function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.orange,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});

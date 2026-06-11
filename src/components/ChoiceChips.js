import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export function ChoiceChips({ label, options, value, onChange, error }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const selected = String(value) === String(optionValue);

          return (
            <Pressable
              key={String(optionValue)}
              onPress={() => onChange(optionValue)}
              style={[styles.chip, selected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>
                {optionLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  chipSelected: {
    borderColor: colors.orange,
    backgroundColor: '#fff4eb',
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.orange,
  },
  error: {
    color: colors.red,
    fontSize: 13,
    lineHeight: 18,
  },
});

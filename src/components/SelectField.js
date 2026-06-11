import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export function SelectField({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = 'Selecciona una opcion',
  error,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => String(option.value) === String(value));
  const displayLabel = selected?.label || placeholder;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[
          styles.input,
          error ? styles.inputError : null,
          disabled ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.value, !selected ? styles.placeholder : null]}>{displayLabel}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView style={styles.optionsList}>
              <Pressable
                style={styles.option}
                onPress={() => {
                  onValueChange('');
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{placeholder}</Text>
              </Pressable>
              {options.map((option) => {
                const active = String(option.value) === String(value);
                return (
                  <Pressable
                    key={String(option.value)}
                    style={[styles.option, active ? styles.optionActive : null]}
                    onPress={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  input: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.red,
  },
  disabled: {
    opacity: 0.6,
  },
  value: {
    color: colors.text,
    fontSize: 15,
  },
  placeholder: {
    color: colors.textSoft,
  },
  error: {
    color: colors.red,
    fontSize: 13,
    lineHeight: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  sheetTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  optionsList: {
    maxHeight: 360,
  },
  option: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  optionActive: {
    backgroundColor: '#fff4eb',
    borderWidth: 1,
    borderColor: colors.orange,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextActive: {
    color: colors.orange,
  },
});

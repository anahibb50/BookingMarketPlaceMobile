import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, radius, spacing } from '../theme/theme';
import { formatDateLabel, parseISODate, toISODateString } from '../utils/formatters';

export function DateField({
  label,
  value,
  onChange,
  minimumDate = new Date(),
  placeholder = 'Selecciona una fecha',
  error,
}) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(parseISODate(value));
  const dateValue = parseISODate(value);
  const displayLabel = value ? formatDateLabel(value) : placeholder;
  const minDateValue = toISODateString(minimumDate);

  useEffect(() => {
    if (open) {
      setTempDate(parseISODate(value));
    }
  }, [open, value]);

  const commitDate = (date) => {
    onChange(toISODateString(date));
    setOpen(false);
  };

  const handleAndroidChange = (event, selectedDate) => {
    setOpen(false);
    if (event?.type === 'dismissed' || !selectedDate) return;
    commitDate(selectedDate);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={value || ''}
          onChangeText={onChange}
          placeholder={placeholder}
          type="date"
          min={minDateValue}
          style={[styles.input, styles.webDateInput, error ? styles.inputError : null]}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.input, error ? styles.inputError : null]}
      >
        <Text style={[styles.value, !value ? styles.placeholder : null]}>{displayLabel}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="calendar"
          minimumDate={minimumDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline"
                minimumDate={minimumDate}
                onChange={(_, selectedDate) => {
                  if (selectedDate) setTempDate(selectedDate);
                }}
                style={styles.iosPicker}
              />
              <PrimaryActions onCancel={() => setOpen(false)} onConfirm={() => commitDate(tempDate)} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

function PrimaryActions({ onCancel, onConfirm }) {
  return (
    <View style={styles.actions}>
      <Pressable onPress={onCancel} style={styles.secondaryBtn}>
        <Text style={styles.secondaryBtnText}>Cancelar</Text>
      </Pressable>
      <Pressable onPress={onConfirm} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Listo</Text>
      </Pressable>
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
  webDateInput: {
    color: colors.text,
    fontSize: 15,
    outlineStyle: 'none',
  },
  inputError: {
    borderColor: colors.red,
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
  },
  sheetTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  iosPicker: {
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  secondaryBtnText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

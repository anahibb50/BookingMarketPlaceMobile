import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/theme';

const BAR_HEIGHT = 56;

export function StackScreenHeader({ title, backLabel = 'Volver', onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
        >
          <Text style={styles.backText}>← {backLabel}</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.sideSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.navy,
  },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  backButton: {
    minWidth: 88,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  sideSpacer: {
    minWidth: 88,
  },
});

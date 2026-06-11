import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme/theme';
import { formatCurrency } from '../utils/formatters';

export function VehicleCard({ item, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: item.imagenUrl }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.model}>{item.modelo}</Text>
        <Text style={styles.meta}>
          {item.categoriaNombre} · {item.localizacionNombre}
        </Text>
        <Text style={styles.specs}>
          {item.pasajeros} pasajeros · {item.maletas} maletas · {item.transmision}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{formatCurrency(item.precioPorDia)} / dia</Text>
          <Text style={styles.link}>Reservar</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceAlt,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  model: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    color: colors.orange,
    fontWeight: '700',
  },
  specs: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  link: {
    color: colors.orange,
    fontWeight: '800',
  },
});

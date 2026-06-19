import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { getVehicleById } from '../services/marketplaceService';
import { hasActiveSession } from '../services/sessionService';
import { colors, radius, shadows, spacing } from '../theme/theme';
import { formatCurrency } from '../utils/formatters';

export function VehicleDetailScreen({ navigation, route }) {
  const { vehicleId, localizacionId, fechaRecogida, horaRecogida } = route.params;
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    getVehicleById(vehicleId).then(setVehicle);
  }, [vehicleId]);

  const handleReserve = async () => {
    const loggedIn = await hasActiveSession();
    if (!loggedIn) {
      navigation.navigate('Login');
      return;
    }

    navigation.navigate('CreateReservation', {
      vehicleId: vehicle.id,
      localizacionId,
      fechaRecogida,
      horaRecogida,
    });
  };

  if (!vehicle) {
    return <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Image source={{ uri: vehicle.imagenUrl }} style={styles.image} />

      <View style={styles.summaryCard}>
        <Text style={styles.category}>{vehicle.categoriaNombre}</Text>
        <Text style={styles.title}>{vehicle.modelo}</Text>
        <Text style={styles.location}>{vehicle.localizacionNombre}</Text>
        <Text style={styles.description}>{vehicle.descripcion}</Text>
        <View style={styles.kpis}>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>{vehicle.pasajeros}</Text>
            <Text style={styles.kpiLabel}>Pasajeros</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>{vehicle.maletas}</Text>
            <Text style={styles.kpiLabel}>Maletas</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>
              {vehicle.transmision}
            </Text>
            <Text style={styles.kpiLabel}>Transmision</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          eyebrow="Tarifa"
          title={`${formatCurrency(vehicle.precioPorDia)} por dia`}
          subtitle="Misma presentacion visual del marketplace web, optimizada para pantallas mobile."
        />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Listo para reservar</Text>
      </View>

      <View style={styles.ctaWrap}>
        <PrimaryButton label="Reservar ahora" onPress={handleReserve} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: 260,
    backgroundColor: colors.surfaceAlt,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: -26,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  category: {
    color: colors.orange,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  location: {
    color: colors.navyMuted,
    fontWeight: '700',
  },
  description: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  kpis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  kpi: {
    flex: 1,
    minWidth: 88,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  kpiValue: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 22,
  },
  kpiLabel: {
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  panel: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  ctaWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
});

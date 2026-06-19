import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SectionHeader } from '../components/SectionHeader';
import { listMyReservationsNormalized } from '../services/marketplaceService';
import { hasActiveSession } from '../services/sessionService';
import { colors, radius, shadows, spacing } from '../theme/theme';
import { formatCurrency, formatDateLabel } from '../utils/formatters';

export function MyReservationsScreen({ navigation, route }) {
  const [reservations, setReservations] = useState([]);
  const createdReservationCode = route.params?.createdReservationCode;
  const loginRedirectedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const loggedIn = await hasActiveSession();
        if (!loggedIn && active && !loginRedirectedRef.current) {
          loginRedirectedRef.current = true;
          navigation.navigate('Login', { redirectTo: 'MyReservations' });
        }
        if (loggedIn) {
          loginRedirectedRef.current = false;
        }
      })();
      return () => {
        active = false;
      };
    }, [navigation])
  );

  useEffect(() => {
    listMyReservationsNormalized()
      .then((response) => {
        const next = createdReservationCode
          ? [
              {
                id: `new-${createdReservationCode}`,
                codigo: createdReservationCode,
                estado: 'CONFIRMADA',
                fechaInicio: new Date().toISOString(),
                fechaFin: new Date(Date.now() + 2 * 86400000).toISOString(),
                total: Number(route.params?.createdReservationTotal || 0),
                vehiculo: {
                  modelo: route.params?.vehiculoModelo || 'Reserva creada',
                  imagenUrl:
                    route.params?.vehiculoImagenUrl ||
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
                },
                localizacionRecogida: {
                  nombre: route.params?.localizacionRecogidaNombre || 'Recogida',
                },
                localizacionEntrega: {
                  nombre: route.params?.localizacionEntregaNombre || 'Entrega',
                },
              },
              ...response,
            ]
          : response;
        setReservations(next);
      })
      .catch((error) => {
        console.error('Error cargando reservas:', error);
      });
  }, [createdReservationCode, route.params]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <SectionHeader
          eyebrow="Cliente"
          title="Mis reservas"
          subtitle="Pantalla mobile lista para recibir el query real de reservas del cliente."
        />
        {createdReservationCode ? (
          <View style={styles.successBanner}>
            <Text style={styles.successTitle}>Reserva creada</Text>
            <Text style={styles.successText}>Codigo generado: {createdReservationCode}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.list}>
        {reservations.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.vehiculo?.imagenUrl }} style={styles.image} />
            <View style={styles.body}>
              <Text style={styles.code}>{item.codigo}</Text>
              <Text style={styles.model}>{item.vehiculo?.modelo}</Text>
              <Text style={styles.meta}>
                {formatDateLabel(item.fechaInicio)} - {formatDateLabel(item.fechaFin)}
              </Text>
              <Text style={styles.meta}>
                {item.localizacionRecogida?.nombre} -> {item.localizacionEntrega?.nombre}
              </Text>
              <View style={styles.footer}>
                <Text style={styles.status}>{item.estado}</Text>
                <Text style={styles.total}>{formatCurrency(item.total)}</Text>
              </View>
            </View>
          </View>
        ))}
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
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.md,
  },
  successBanner: {
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  successTitle: {
    color: colors.successText,
    fontWeight: '900',
    fontSize: 16,
  },
  successText: {
    color: colors.successText,
    marginTop: 2,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    width: '100%',
    height: 170,
    backgroundColor: colors.surfaceAlt,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  code: {
    color: colors.orange,
    fontWeight: '900',
  },
  model: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    color: colors.navy,
    fontWeight: '800',
  },
  total: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
});

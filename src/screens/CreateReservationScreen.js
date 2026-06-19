import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { getMarketplaceBootstrap, getVehicleById, getClienteById } from '../services/marketplaceService';
import { crearReservaConSeguimiento } from '../services/eventBus';
import { getStoredCustomerProfile, getStoredIdCliente, hasActiveSession } from '../services/sessionService';
import { normalizeCustomerProfile } from '../utils/apiHelpers';
import { colors, radius, shadows, spacing } from '../theme/theme';
import { calculateRentalDays, formatCurrency, toGraphqlDateTime } from '../utils/formatters';
import { buildGraphqlExtras, formatGraphqlError } from '../utils/apiHelpers';

const initialCustomer = {
  idCliente: '',
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  numeroIdentificacion: '',
};

const initialDriver = {
  nombres: '',
  apellidos: '',
  numeroLicencia: '',
  edad: '',
  numeroIdentificacion: '',
};

export function CreateReservationScreen({ navigation, route }) {
  const { vehicleId, localizacionId, fechaRecogida, horaRecogida } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [extras, setExtras] = useState([]);
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');
  const [sagaStatus, setSagaStatus] = useState(null);
  const [form, setForm] = useState({
    fechaInicio: '2026-06-18',
    horaInicio: '09:00',
    fechaFin: '2026-06-20',
    horaFin: '18:00',
    idLocalizacionRecogida: '',
    idLocalizacionEntrega: '',
    descripcion: '',
  });
  const [customer, setCustomer] = useState(initialCustomer);
  const [customerProfileError, setCustomerProfileError] = useState('');
  const [driver, setDriver] = useState(initialDriver);
  const [extraCounts, setExtraCounts] = useState({});
  const loginRedirectedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const loggedIn = await hasActiveSession();
        if (!loggedIn && active && !loginRedirectedRef.current) {
          loginRedirectedRef.current = true;
          navigation.navigate('Login', {
            redirectTo: 'CreateReservation',
            ...route.params,
          });
        }
        if (loggedIn) {
          loginRedirectedRef.current = false;
        }
      })();
      return () => {
        active = false;
      };
    }, [navigation, route.params])
  );

  useEffect(() => {
    let mounted = true;

    async function loadReservationData() {
      try {
        const [selectedVehicle, bootstrap, storedProfile, storedIdCliente] = await Promise.all([
          getVehicleById(vehicleId),
          getMarketplaceBootstrap({ includeExtras: true }),
          getStoredCustomerProfile(),
          getStoredIdCliente(),
        ]);

        if (!mounted) return;

        setVehicle(selectedVehicle);
        setExtras(bootstrap.extras || []);
        setLocations(bootstrap.localizaciones || []);

        let profile = normalizeCustomerProfile({
          ...(storedProfile || {}),
          idCliente: storedProfile?.idCliente || storedIdCliente || '',
        });

        const needsFetch =
          profile.idCliente &&
          (!profile.nombres || !profile.apellidos || !profile.numeroIdentificacion);

        if (needsFetch) {
          try {
            const fromApi = await getClienteById(profile.idCliente);
            profile = normalizeCustomerProfile({
              ...fromApi,
              ...profile,
              nombres: profile.nombres || fromApi.nombres,
              apellidos: profile.apellidos || fromApi.apellidos,
              correo: profile.correo || fromApi.correo,
              telefono: profile.telefono || fromApi.telefono,
              numeroIdentificacion: profile.numeroIdentificacion || fromApi.numeroIdentificacion,
            });
          } catch {
            // Si falla el fetch, usamos lo que haya en sesion.
          }
        }

        setCustomer(profile);

        if (!profile.idCliente) {
          setCustomerProfileError(
            'No encontramos tu perfil de cliente. Cierra sesion e inicia sesion de nuevo.'
          );
        } else if (!profile.nombres || !profile.apellidos || !profile.numeroIdentificacion) {
          setCustomerProfileError(
            'Tu perfil esta incompleto. Cierra sesion e inicia sesion de nuevo.'
          );
        } else {
          setCustomerProfileError('');
        }

        const pickupId = String(
          localizacionId || selectedVehicle?.idLocalizacion || bootstrap.localizaciones?.[0]?.id || ''
        );
        setForm((current) => ({
          ...current,
          fechaInicio: fechaRecogida || current.fechaInicio,
          horaInicio: horaRecogida || current.horaInicio,
          idLocalizacionRecogida: pickupId,
          idLocalizacionEntrega: pickupId,
        }));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadReservationData();

    return () => {
      mounted = false;
    };
  }, [vehicleId, localizacionId, fechaRecogida, horaRecogida]);

  const rentalDays = useMemo(
    () => calculateRentalDays(form.fechaInicio, form.fechaFin),
    [form.fechaInicio, form.fechaFin]
  );

  const extraLines = useMemo(() => {
    return extras
      .map((item) => {
        const cantidad = extraCounts[item.id] || 0;
        return {
          ...item,
          cantidad,
          subtotal: item.valorUnitario * cantidad * rentalDays,
        };
      })
      .filter((item) => item.cantidad > 0);
  }, [extraCounts, extras, rentalDays]);

  const totals = useMemo(() => {
    const tarifaBase = Number(vehicle?.precioPorDia || 0) * rentalDays;
    const extrasTotal = extraLines.reduce((acc, item) => acc + item.subtotal, 0);
    const subtotal = tarifaBase + extrasTotal;
    const iva = subtotal * 0.15;
    const total = subtotal + iva;
    return { tarifaBase, extrasTotal, subtotal, iva, total };
  }, [extraLines, rentalDays, vehicle?.precioPorDia]);

  const handleSubmit = async () => {
    if (
      customerProfileError ||
      !customer.idCliente ||
      !customer.nombres ||
      !customer.apellidos ||
      !customer.numeroIdentificacion
    ) {
      setMessage(
        customerProfileError || 'No se pudo validar tu perfil de cliente. Inicia sesion de nuevo.'
      );
      return;
    }

    if (!driver.nombres || !driver.apellidos || !driver.numeroIdentificacion) {
      setMessage('Completa los datos del conductor titular.');
      return;
    }

    const graphqlExtras = buildGraphqlExtras(extraLines);
    const selectedExtrasCount = Object.values(extraCounts).reduce(
      (sum, qty) => sum + (Number(qty) || 0),
      0
    );
    if (selectedExtrasCount > 0 && graphqlExtras.length === 0) {
      setMessage(
        'Los extras seleccionados no tienen ID valido. Recarga la pantalla (r en Expo) e intenta de nuevo.'
      );
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const pickupName = locations.find((item) => String(item.id) === form.idLocalizacionRecogida)?.nombre;
      const dropoffName = locations.find((item) => String(item.id) === form.idLocalizacionEntrega)?.nombre;

      const input = {
        idCliente: Number(customer.idCliente),
        idVehiculo: Number(vehicle.id),
        idLocalizacionRecogida: Number(form.idLocalizacionRecogida),
        idLocalizacionDevolucion: Number(form.idLocalizacionEntrega),
        fechaInicio: toGraphqlDateTime(form.fechaInicio, form.horaInicio),
        fechaFin: toGraphqlDateTime(form.fechaFin, form.horaFin),
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        observaciones: form.descripcion || null,
        conductores: [
          {
            tipoIdentificacion: 'CEDULA',
            numeroIdentificacion: driver.numeroIdentificacion,
            nombres: driver.nombres,
            apellidos: driver.apellidos,
            numeroLicencia: driver.numeroLicencia || null,
            edad: Number(driver.edad || 0) || null,
          },
        ],
        extras: graphqlExtras,
      };

      const resultado = await crearReservaConSeguimiento(input, (estadoParcial) => {
        setSagaStatus(estadoParcial);
      });

      navigation.replace('MyReservations', {
        createdReservationCode: resultado?.codigoReserva,
        createdReservationTotal: resultado?.total,
        localizacionRecogidaNombre: pickupName,
        localizacionEntregaNombre: dropoffName,
        vehiculoModelo: vehicle.modelo,
        vehiculoImagenUrl: vehicle.imagenUrl,
      });
    } catch (error) {
      setMessage(formatGraphqlError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !vehicle) {
    return <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroBar}>
        <Text style={styles.heroTitle}>{vehicle.modelo}</Text>
        <Text style={styles.heroText}>
          Reserva mobile conectada al mismo concepto visual del marketplace web.
        </Text>
      </View>

      <View style={styles.panel}>
        <SectionHeader title="Detalles de la reserva" subtitle="Recogida, devolucion y observaciones." />
        <View style={styles.formColumn}>
          <FormField
            label="Fecha inicio"
            value={form.fechaInicio}
            onChangeText={(value) => setForm((current) => ({ ...current, fechaInicio: value }))}
            placeholder="2026-06-18"
          />
          <FormField
            label="Hora inicio"
            value={form.horaInicio}
            onChangeText={(value) => setForm((current) => ({ ...current, horaInicio: value }))}
            placeholder="09:00"
          />
          <FormField
            label="Fecha fin"
            value={form.fechaFin}
            onChangeText={(value) => setForm((current) => ({ ...current, fechaFin: value }))}
            placeholder="2026-06-20"
          />
          <FormField
            label="Hora fin"
            value={form.horaFin}
            onChangeText={(value) => setForm((current) => ({ ...current, horaFin: value }))}
            placeholder="18:00"
          />
          <FormField
            label="Localizacion de recogida"
            value={form.idLocalizacionRecogida}
            onChangeText={(value) => setForm((current) => ({ ...current, idLocalizacionRecogida: value }))}
            placeholder="1"
          />
          <FormField
            label="Localizacion de entrega"
            value={form.idLocalizacionEntrega}
            onChangeText={(value) => setForm((current) => ({ ...current, idLocalizacionEntrega: value }))}
            placeholder="1"
          />
          <FormField
            label="Observaciones"
            value={form.descripcion}
            onChangeText={(value) => setForm((current) => ({ ...current, descripcion: value }))}
            placeholder="Notas opcionales"
            multiline
          />
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader
          title="Datos del cliente"
          subtitle="Datos de tu cuenta registrada. No se pueden modificar aqui."
        />
        {customerProfileError ? <Text style={styles.customerError}>{customerProfileError}</Text> : null}
        <View style={styles.formColumn}>
          <FormField
            label="Nombres"
            value={customer.nombres}
            placeholder="Andrea"
            editable={false}
          />
          <FormField
            label="Apellidos"
            value={customer.apellidos}
            placeholder="Lopez"
            editable={false}
          />
          <FormField
            label="Correo"
            value={customer.correo}
            placeholder="cliente@correo.com"
            editable={false}
          />
          <FormField
            label="Telefono"
            value={customer.telefono}
            placeholder="0999999999"
            editable={false}
          />
          <FormField
            label="Identificacion"
            value={customer.numeroIdentificacion}
            placeholder="0102030405"
            editable={false}
          />
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader title="Conductor titular" subtitle="Queda separado para el contrato de reserva real." />
        <View style={styles.formColumn}>
          <FormField
            label="Nombres"
            value={driver.nombres}
            onChangeText={(value) => setDriver((current) => ({ ...current, nombres: value }))}
            placeholder="Andrea"
          />
          <FormField
            label="Apellidos"
            value={driver.apellidos}
            onChangeText={(value) => setDriver((current) => ({ ...current, apellidos: value }))}
            placeholder="Lopez"
          />
          <FormField
            label="Numero de licencia"
            value={driver.numeroLicencia}
            onChangeText={(value) => setDriver((current) => ({ ...current, numeroLicencia: value }))}
            placeholder="LIC-12345"
          />
          <FormField
            label="Edad"
            value={driver.edad}
            onChangeText={(value) => setDriver((current) => ({ ...current, edad: value }))}
            placeholder="28"
            keyboardType="number-pad"
          />
          <FormField
            label="Identificacion"
            value={driver.numeroIdentificacion}
            onChangeText={(value) => setDriver((current) => ({ ...current, numeroIdentificacion: value }))}
            placeholder="0102030405"
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader title="Extras" subtitle="Tarifa por dia, igual que en la experiencia web." />
        <View style={styles.formColumn}>
          {extras.filter((item) => item.idExtra || item.id).map((item) => (
            <View key={String(item.idExtra ?? item.id)} style={styles.extraCard}>
              <View style={styles.extraCopy}>
                <Text style={styles.extraName}>{item.nombre}</Text>
                <Text style={styles.extraText}>{item.descripcion}</Text>
                <Text style={styles.extraPrice}>{formatCurrency(item.valorUnitario)} / dia</Text>
              </View>
              <View style={styles.counter}>
                <Pressable
                  onPress={() =>
                    setExtraCounts((current) => ({
                      ...current,
                      [item.id]: Math.max(0, (current[item.id] || 0) - 1),
                    }))
                  }
                  style={styles.counterBtn}
                >
                  <Text style={styles.counterBtnLabel}>-</Text>
                </Pressable>
                <Text style={styles.counterValue}>{extraCounts[item.id] || 0}</Text>
                <Pressable
                  onPress={() =>
                    setExtraCounts((current) => ({
                      ...current,
                      [item.id]: (current[item.id] || 0) + 1,
                    }))
                  }
                  style={styles.counterBtn}
                >
                  <Text style={styles.counterBtnLabel}>+</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de tu reserva</Text>
        {sagaStatus ? (
          <View style={styles.sagaBanner}>
            <Text style={styles.sagaTitle}>Estado de la saga</Text>
            <Text style={styles.sagaText}>Estado: {String(sagaStatus.estado || '--')}</Text>
            {sagaStatus.codigoReserva ? (
              <Text style={styles.sagaText}>Codigo: {String(sagaStatus.codigoReserva)}</Text>
            ) : null}
            {sagaStatus.motivoFallo ? (
              <Text style={styles.sagaText}>Motivo: {String(sagaStatus.motivoFallo)}</Text>
            ) : null}
          </View>
        ) : null}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehiculo</Text>
          <Text style={styles.summaryValue}>{vehicle.modelo}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Dias</Text>
          <Text style={styles.summaryValue}>{rentalDays}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tarifa base</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totals.tarifaBase)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Extras</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totals.extrasTotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>IVA</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totals.iva)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowTotal]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>{formatCurrency(totals.total)}</Text>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <PrimaryButton
          label={submitting ? 'Creando reserva...' : 'Crear reserva'}
          onPress={handleSubmit}
          disabled={submitting}
        />
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
  heroBar: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  heroText: {
    color: '#dce3f4',
    lineHeight: 22,
  },
  panel: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  formColumn: {
    gap: spacing.md,
  },
  extraCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  extraCopy: {
    flex: 1,
    gap: 2,
  },
  extraName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  extraText: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  extraPrice: {
    color: colors.orange,
    fontWeight: '700',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnLabel: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  counterValue: {
    color: colors.text,
    fontWeight: '800',
    minWidth: 22,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryLabel: {
    color: '#dce3f4',
  },
  summaryValue: {
    color: '#fff',
    fontWeight: '700',
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  summaryTotalLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },
  summaryTotalValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  sagaBanner: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sagaTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  sagaText: {
    color: '#dce3f4',
    lineHeight: 20,
  },
  message: {
    color: '#ffd1d1',
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  customerError: {
    color: colors.red,
    lineHeight: 20,
  },
});

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
import { DateField } from '../components/DateField';
import { FormField } from '../components/FormField';
import { HomeHeader } from '../components/HomeHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { SelectField } from '../components/SelectField';
import { VehicleCard } from '../components/VehicleCard';
import { getMarketplaceBootstrap } from '../services/marketplaceService';
import { hasActiveSession, logout } from '../services/sessionService';
import { colors, radius, shadows, spacing } from '../theme/theme';

const today = new Date().toISOString().slice(0, 10);

export function HomeScreen({ navigation, route }) {
  const registerSuccess = route?.params?.registerSuccess;
  const scrollRef = useRef(null);
  const vehiclesSectionOffset = useRef(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [locationsError, setLocationsError] = useState('');
  const [locationFieldError, setLocationFieldError] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [data, setData] = useState({
    categorias: [],
    localizaciones: [],
    vehiculosDisponibles: [],
  });
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filters, setFilters] = useState({
    localizacionId: '',
    fechaRecogida: today,
    horaRecogida: '09:00',
  });

  const refreshSession = useCallback(async () => {
    const active = await hasActiveSession();
    setIsLoggedIn(active);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshSession();
    }, [refreshSession])
  );

  useEffect(() => {
    let mounted = true;
    getMarketplaceBootstrap()
      .then((response) => {
        if (!mounted) return;
        setLoadError('');
        setData(response);
        if (!response.localizaciones?.length) {
          setLocationsError('No hay localizaciones disponibles.');
        } else {
          setLocationsError('');
        }
      })
      .catch((error) => {
        console.error('Error cargando datos del marketplace:', error);
        if (mounted) {
          setLoadError(
            error?.response?.data?.message ||
              error?.message ||
              'No se pudieron cargar los vehiculos del bus.'
          );
          setLocationsError('No se pudieron cargar las localizaciones.');
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const localizacionOptions = useMemo(
    () =>
      data.localizaciones.map((item) => ({
        value: String(item.id),
        label: item.nombre,
      })),
    [data.localizaciones]
  );

  const filteredVehicles = useMemo(() => {
    if (!filters.localizacionId || !searchSubmitted) return [];

    return data.vehiculosDisponibles.filter((item) => {
      const matchesCategory = selectedCategory === 'Todos' || item.categoriaNombre === selectedCategory;
      const matchesLocation = String(item.idLocalizacion) === String(filters.localizacionId);
      return matchesCategory && matchesLocation;
    });
  }, [data.vehiculosDisponibles, filters.localizacionId, searchSubmitted, selectedCategory]);

  const scrollToVehicles = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(vehiclesSectionOffset.current - 12, 0),
      animated: true,
    });
  };

  const validateSearch = () => {
    if (!filters.localizacionId) {
      setLocationFieldError('Selecciona una localizacion para buscar.');
      return false;
    }
    if (!filters.fechaRecogida) {
      return false;
    }
    setLocationFieldError('');
    return true;
  };

  const handleSearch = () => {
    if (!validateSearch()) return;
    setSearchSubmitted(true);
    requestAnimationFrame(scrollToVehicles);
  };

  const handleExplore = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    if (validateSearch()) {
      setSearchSubmitted(true);
      requestAnimationFrame(scrollToVehicles);
    }
  };

  const handleVehiclePress = (item) => {
    if (!filters.localizacionId) {
      setLocationFieldError('Selecciona una localizacion para continuar.');
      return;
    }

    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    navigation.navigate('VehicleDetail', {
      vehicleId: item.id,
      localizacionId: filters.localizacionId,
      fechaRecogida: filters.fechaRecogida,
      horaRecogida: filters.horaRecogida,
    });
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setSessionMessage('Sesion cerrada correctamente.');
  };

  const handleMyReservations = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('MyReservations');
  };

  return (
    <View style={styles.screen}>
      <HomeHeader
        isLoggedIn={isLoggedIn}
        onExplore={handleExplore}
        onMyReservations={handleMyReservations}
        onLogin={() => navigation.navigate('Login')}
        onLogout={handleLogout}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {registerSuccess ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>
              Cuenta creada correctamente. Ya puedes reservar un vehiculo.
            </Text>
          </View>
        ) : null}
        {sessionMessage ? (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>{sessionMessage}</Text>
          </View>
        ) : null}

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Conduce la experiencia premium desde tu celular</Text>
        </View>

        <View style={styles.searchCard}>
          <SectionHeader
            eyebrow="Marketplace"
            title="Encuentra tu proximo vehiculo"
            subtitle="Busca por localidad y fecha. Los datos se cargan desde el Bus de Servicios."
          />

          <View style={styles.formGrid}>
            <SelectField
              label="Localizacion de recogida"
              value={filters.localizacionId}
              onValueChange={(value) => {
                setFilters((current) => ({ ...current, localizacionId: value }));
                setLocationFieldError('');
                setSearchSubmitted(false);
              }}
              options={localizacionOptions}
              placeholder="Selecciona una localizacion"
              error={locationFieldError}
              disabled={Boolean(locationsError) || loading}
            />
            {locationsError ? <Text style={styles.fieldHint}>{locationsError}</Text> : null}
            <DateField
              label="Fecha de recogida"
              value={filters.fechaRecogida}
              onChange={(value) => {
                setFilters((current) => ({ ...current, fechaRecogida: value }));
                setSearchSubmitted(false);
              }}
              minimumDate={new Date()}
              placeholder="Selecciona una fecha"
            />
            <FormField
              label="Hora de recogida"
              value={filters.horaRecogida}
              onChangeText={(value) => {
                setFilters((current) => ({ ...current, horaRecogida: value }));
                setSearchSubmitted(false);
              }}
              placeholder="09:00"
            />
            <PrimaryButton label="Buscar" onPress={handleSearch} disabled={loading} />
          </View>
        </View>

        <View
          style={styles.section}
          onLayout={(event) => {
            vehiclesSectionOffset.current = event.nativeEvent.layout.y;
          }}
        >
          <SectionHeader title="Categorias" subtitle="Filtra por tipo de vehiculo." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {['Todos', ...data.categorias.map((item) => item.nombre)].map((name) => {
              const active = name === selectedCategory;
              return (
                <Pressable
                  key={name}
                  onPress={() => setSelectedCategory(name)}
                  style={[styles.categoryChip, active ? styles.categoryChipActive : null]}
                >
                  <Text style={[styles.categoryLabel, active ? styles.categoryLabelActive : null]}>{name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Vehiculos destacados"
            subtitle="Resultados segun tu busqueda."
          />
          {loadError ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Error al cargar vehiculos</Text>
              <Text style={styles.emptyText}>{loadError}</Text>
            </View>
          ) : null}
          {loading ? (
            <ActivityIndicator color={colors.orange} style={styles.loader} />
          ) : (
            <View style={styles.list}>
              {!searchSubmitted ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Listo para explorar</Text>
                  <Text style={styles.emptyText}>
                    Completa el formulario y pulsa Buscar para ver vehiculos disponibles.
                  </Text>
                </View>
              ) : null}
              {searchSubmitted && !filters.localizacionId ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Selecciona una localizacion</Text>
                  <Text style={styles.emptyText}>
                    Elige una sede en el formulario de busqueda para ver los vehiculos disponibles.
                  </Text>
                </View>
              ) : null}
              {searchSubmitted && filters.localizacionId
                ? filteredVehicles.map((item) => (
                    <VehicleCard key={item.id} item={item} onPress={() => handleVehiclePress(item)} />
                  ))
                : null}
              {searchSubmitted && filters.localizacionId && filteredVehicles.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No hay vehiculos con ese filtro</Text>
                  <Text style={styles.emptyText}>Cambia la localizacion o la categoria y prueba de nuevo.</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.infoStrip}>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>24/7</Text>
            <Text style={styles.infoLabel}>Atencion y soporte</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  successBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#e8f7ee',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#b9e3c8',
  },
  successText: {
    color: '#1f7a45',
    fontWeight: '700',
    lineHeight: 20,
  },
  infoBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#eef3fb',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#c9d7ef',
  },
  infoBannerText: {
    color: colors.navy,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 8,
    gap: spacing.sm,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    textAlign: 'center',
  },
  searchCard: {
    marginHorizontal: spacing.md,
    marginTop: -20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  formGrid: {
    gap: spacing.md,
  },
  fieldHint: {
    color: colors.red,
    lineHeight: 20,
    marginTop: -4,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  categoriesRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  categoryChip: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  categoryChipActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  categoryLabel: {
    color: colors.text,
    fontWeight: '700',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  list: {
    gap: spacing.md,
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 6,
    borderLeftColor: colors.orange,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 21,
  },
  infoStrip: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  infoValue: {
    color: colors.orange,
    fontSize: 24,
    fontWeight: '900',
  },
  infoLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChoiceChips } from '../components/ChoiceChips';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { SelectField } from '../components/SelectField';
import { listCiudadesNormalized, getRegisterUrl } from '../services/marketplaceService';
import { registerAndSaveSession } from '../services/sessionService';
import { formatApiError } from '../utils/apiHelpers';
import {
  GENEROS,
  TIPOS_IDENTIFICACION,
  buildRegisterPayload,
  identificacionPlaceholder,
  sanitizeIdentificacion,
  validateRegisterForm,
} from '../utils/registerValidation';
import { colors, radius, shadows, spacing } from '../theme/theme';

const initialForm = {
  username: '',
  correo: '',
  password: '',
  identificacion: '',
  tipoIdentificacion: 'CEDULA',
  nombre: '',
  apellido: '',
  idCiudad: '',
  telefono: '',
  genero: 'M',
  direccion: '',
};

export function RegisterScreen({ navigation }) {
  const [form, setForm] = useState(initialForm);
  const [ciudades, setCiudades] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    listCiudadesNormalized()
      .then((list) => {
        if (!mounted) return;
        setCiudades(list);
        if (!list.length) {
          setLoadError('No hay ciudades en el catalogo. No es posible completar el registro.');
        }
      })
      .catch((error) => {
        if (mounted) {
          setLoadError(error?.message || 'No se pudieron cargar las ciudades.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setStatusMessage('');
  };

  const handleTipoIdentificacionChange = (tipo) => {
    setForm((current) => ({
      ...current,
      tipoIdentificacion: tipo,
      identificacion: '',
    }));
    setErrors((current) => ({
      ...current,
      tipoIdentificacion: '',
      identificacion: '',
    }));
    setStatusMessage('');
  };

  const handleSubmit = async () => {
    const nextErrors = validateRegisterForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatusMessage('Revisa los campos marcados.');
      return;
    }

    if (loadError) return;

    setLoading(true);
    setStatusMessage('Creando tu cuenta...');
    setErrors({});

    try {
      const payload = buildRegisterPayload(form);
      await registerAndSaveSession(payload);
      setStatusMessage('Cuenta creada. Bienvenido.');
      navigation.replace('Home', { registerSuccess: true });
    } catch (error) {
      setStatusMessage(formatApiError(error, getRegisterUrl()));
    } finally {
      setLoading(false);
    }
  };

  const identificacionKeyboard =
    form.tipoIdentificacion === 'PASAPORTE' ? 'default' : 'number-pad';

  const ciudadOptions = useMemo(
    () =>
      ciudades.map((ciudad) => ({
        value: ciudad.id,
        label: ciudad.nombre,
      })),
    [ciudades]
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.backLink}>
          <Text style={styles.backLinkText}>Volver al login</Text>
        </Pressable>

        <SectionHeader
          eyebrow="Cliente"
          title="Crear cuenta"
          subtitle="Registrate para reservar vehiculos y ver tus reservas en el marketplace."
        />

        {loadError ? <Text style={styles.error}>{loadError}</Text> : null}

        <FormField
          label="Usuario"
          value={form.username}
          onChangeText={(value) => updateField('username', value)}
          placeholder="Sin espacios, minimo 3 caracteres"
          autoCapitalize="none"
          error={errors.username}
        />
        <FormField
          label="Correo"
          value={form.correo}
          onChangeText={(value) => updateField('correo', value)}
          placeholder="tu@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.correo}
        />
        <FormField
          label="Contrasena"
          value={form.password}
          onChangeText={(value) => updateField('password', value)}
          placeholder="Minimo 6 caracteres"
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />

        <ChoiceChips
          label="Tipo de identificacion"
          options={TIPOS_IDENTIFICACION}
          value={form.tipoIdentificacion}
          onChange={handleTipoIdentificacionChange}
        />

        <FormField
          label="Identificacion"
          value={form.identificacion}
          onChangeText={(value) =>
            updateField('identificacion', sanitizeIdentificacion(value, form.tipoIdentificacion))
          }
          placeholder={identificacionPlaceholder(form.tipoIdentificacion)}
          keyboardType={identificacionKeyboard}
          autoCapitalize="characters"
          error={errors.identificacion}
        />

        <FormField
          label="Nombre"
          value={form.nombre}
          onChangeText={(value) => updateField('nombre', value)}
          placeholder="Tu nombre"
          error={errors.nombre}
        />
        <FormField
          label="Apellido"
          value={form.apellido}
          onChangeText={(value) => updateField('apellido', value)}
          placeholder="Tu apellido"
          error={errors.apellido}
        />

        <ChoiceChips
          label="Genero"
          options={GENEROS}
          value={form.genero}
          onChange={(value) => updateField('genero', value)}
        />

        <SelectField
          label="Ciudad"
          value={form.idCiudad}
          onValueChange={(value) => updateField('idCiudad', value)}
          options={ciudadOptions}
          placeholder="Selecciona tu ciudad"
          error={errors.idCiudad}
          disabled={Boolean(loadError) || !ciudades.length}
        />

        <FormField
          label="Telefono"
          value={form.telefono}
          onChangeText={(value) =>
            updateField('telefono', value.replace(/\D/g, '').slice(0, 10))
          }
          placeholder="0999999999"
          keyboardType="phone-pad"
          error={errors.telefono}
        />
        <FormField
          label="Direccion"
          value={form.direccion}
          onChangeText={(value) => updateField('direccion', value)}
          placeholder="Opcional"
          multiline
        />

        {statusMessage ? (
          <Text
            style={[
              styles.status,
              statusMessage.includes('Bienvenido') ? styles.statusSuccess : null,
            ]}
          >
            {statusMessage}
          </Text>
        ) : null}

        <PrimaryButton
          label={loading ? 'Creando cuenta...' : 'Crear cuenta'}
          onPress={handleSubmit}
          disabled={loading || Boolean(loadError)}
        />

        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={styles.marketplaceLink}>Volver al marketplace</Text>
        </Pressable>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  backLink: {
    alignSelf: 'flex-start',
  },
  backLinkText: {
    color: colors.orange,
    fontWeight: '700',
  },
  error: {
    color: colors.red,
    lineHeight: 20,
  },
  status: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  statusSuccess: {
    color: '#1f7a45',
    fontWeight: '700',
  },
  marketplaceLink: {
    color: colors.navy,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});

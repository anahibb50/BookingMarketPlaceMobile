import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { getLoginUrl } from '../services/marketplaceService';
import { loginAndSaveSession } from '../services/sessionService';
import { formatApiError } from '../utils/apiHelpers';
import { colors, radius, shadows, spacing } from '../theme/theme';

export function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAndSaveSession(username.trim(), password);
      navigation.replace('Home');
    } catch (err) {
      setError(formatApiError(err, getLoginUrl()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <SectionHeader
          eyebrow="Cliente"
          title="Iniciar sesion"
          subtitle="Conectado al Bus de Servicios. La sesion se guarda para mis reservas y crear reserva."
        />
        <FormField
          label="Usuario"
          value={username}
          onChangeText={setUsername}
          placeholder="tu_usuario"
          autoCapitalize="none"
        />
        <FormField
          label="Contrasena"
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={loading ? 'Ingresando...' : 'Ingresar'}
          onPress={handleLogin}
          disabled={loading}
        />
        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
          <Text style={styles.linkText}>Crear cuenta</Text>
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
    paddingTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  error: {
    color: colors.red,
    lineHeight: 20,
  },
  linkWrap: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  linkText: {
    color: colors.orange,
    fontWeight: '700',
    fontSize: 15,
  },
});

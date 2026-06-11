import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { VehicleDetailScreen } from '../screens/VehicleDetailScreen';
import { CreateReservationScreen } from '../screens/CreateReservationScreen';
import { MyReservationsScreen } from '../screens/MyReservationsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.navy,
  },
  headerTintColor: '#fff',
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: colors.background,
  },
};

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Detalle del vehiculo' }} />
      <Stack.Screen name="CreateReservation" component={CreateReservationScreen} options={{ title: 'Crear reserva' }} />
      <Stack.Screen name="MyReservations" component={MyReservationsScreen} options={{ title: 'Mis reservas' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesion' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
    </Stack.Navigator>
  );
}

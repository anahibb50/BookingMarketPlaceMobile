import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './src/providers/AppProviders';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <AppNavigator />
    </AppProviders>
  );
}

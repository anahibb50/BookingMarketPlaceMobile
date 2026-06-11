import { ApolloProvider } from '@apollo/client';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { apolloClient } from '../services/graphqlClient';
import { colors } from '../theme/theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.orange,
    border: colors.line,
  },
};

export function AppProviders({ children }) {
  return (
    <ApolloProvider client={apolloClient}>
      <NavigationContainer theme={navigationTheme}>{children}</NavigationContainer>
    </ApolloProvider>
  );
}

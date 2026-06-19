import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

function normalizeGraphqlUrl(rawUrl, { ws = false } = {}) {
  const value = String(rawUrl || '').trim();
  if (!value) return '';

  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
  const normalizedWithProtocol = hasProtocol
    ? value
    : `${ws ? 'wss' : 'https'}://${value}`;

  const normalized = /\/graphql\/?$/i.test(normalizedWithProtocol)
    ? normalizedWithProtocol
    : `${normalizedWithProtocol.replace(/\/$/, '')}/graphql`;

  return normalized;
}

const graphqlUrl = normalizeGraphqlUrl(process.env.EXPO_PUBLIC_GRAPHQL_URL);
const graphqlWsUrl = normalizeGraphqlUrl(
  process.env.EXPO_PUBLIC_GRAPHQL_WS_URL ||
    (graphqlUrl
      ? graphqlUrl.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:')
      : ''),
  { ws: true }
);

export const hasGraphqlConfig = Boolean(graphqlUrl);

if (!hasGraphqlConfig && __DEV__) {
  console.warn(
    '[graphqlClient] EXPO_PUBLIC_GRAPHQL_URL vacia o invalida. Usa una URL completa, por ejemplo https://servidor/graphql.'
  );
}

const httpLink = new HttpLink({
  uri: graphqlUrl || 'https://placeholder.invalid/graphql',
});

const wsLink =
  hasGraphqlConfig && graphqlWsUrl
    ? new GraphQLWsLink(
        createClient({
          url: graphqlWsUrl,
          webSocketImpl: WebSocket,
          retryAttempts: 5,
          lazy: false,
          keepAlive: 15000,
        })
      )
    : null;

const link = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: 'network-only' },
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

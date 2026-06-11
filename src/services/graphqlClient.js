import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL;
const graphqlWsUrl =
  process.env.EXPO_PUBLIC_GRAPHQL_WS_URL ||
  (graphqlUrl
    ? graphqlUrl.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:')
    : null);

export const hasGraphqlConfig = Boolean(graphqlUrl);

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

import { apolloClient } from './graphqlClient';
import {
  CREATE_RESERVATION_MUTATION,
  RESERVATION_STATUS_SUBSCRIPTION,
} from '../graphql/documents';
import { formatGraphqlError } from '../utils/apiHelpers';

export async function crearReserva(input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_RESERVATION_MUTATION,
      variables: { input },
    });
    return data?.crearReserva;
  } catch (error) {
    throw new Error(formatGraphqlError(error));
  }
}

export function suscribirseEstadoReserva(correlationId) {
  return apolloClient.subscribe({
    query: RESERVATION_STATUS_SUBSCRIPTION,
    variables: { correlationId: String(correlationId) },
  });
}

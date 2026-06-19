import { gql } from '@apollo/client';

export const CREATE_RESERVATION_MUTATION = gql`
  mutation CreateReservation($input: CrearReservaInput!) {
    crearReserva(input: $input) {
      correlationId
      estado
      codigoReserva
      motivoFallo
      total
    }
  }
`;

export const RESERVATION_STATUS_SUBSCRIPTION = gql`
  subscription ReservationStatus($correlationId: String!) {
    estadoReserva(correlationId: $correlationId) {
      correlationId
      estado
      codigoReserva
      motivoFallo
      total
    }
  }
`;

export const RESERVATION_STATUS_QUERY = gql`
  query ReservationStatus($correlationId: String!) {
    estadoReservaActual(correlationId: $correlationId) {
      correlationId
      estado
      codigoReserva
      motivoFallo
      total
    }
  }
`;

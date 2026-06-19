import {
  consultarEstadoReserva,
  crearReserva,
  suscribirseEstadoReserva,
} from './reservationService';
import { formatGraphqlError } from '../utils/apiHelpers';

const ESTADO_COMPLETADO = 'COMPLETADO';
const ESTADO_FALLIDO = 'FALLIDO';
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 60000;

function normalizeEstado(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function createCorrelationId() {
  if (typeof globalThis?.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function isTerminalEstado(estado) {
  const normalized = normalizeEstado(estado);
  return normalized === ESTADO_COMPLETADO || normalized === ESTADO_FALLIDO;
}

export const crearReservaConSeguimiento = (input, onEstadoCambia) =>
  new Promise((resolve, reject) => {
    let subscription;
    let pollId;
    let settled = false;
    let timeoutId;
    const correlationId = createCorrelationId();

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      clearInterval(pollId);
      subscription?.unsubscribe?.();
      fn(value);
    };

    const tryTerminal = (resultado) => {
      if (!resultado) return;

      onEstadoCambia?.(resultado);

      const estado = normalizeEstado(resultado.estado);
      if (estado === ESTADO_COMPLETADO) {
        finish(resolve, resultado);
      }
      if (estado === ESTADO_FALLIDO) {
        finish(
          reject,
          new Error(resultado.motivoFallo || 'Error al crear la reserva')
        );
      }
    };

    const pollEstado = async () => {
      try {
        const estado = await consultarEstadoReserva(correlationId);
        if (estado && isTerminalEstado(estado.estado)) {
          tryTerminal(estado);
        }
      } catch {
        // Ignorar errores puntuales de polling.
      }
    };

    (async () => {
      try {
        subscription = suscribirseEstadoReserva(correlationId).subscribe({
          next: ({ data }) => {
            tryTerminal(data?.estadoReserva);
          },
          error: (error) => {
            finish(reject, new Error(formatGraphqlError(error)));
          },
        });

        pollId = setInterval(pollEstado, POLL_INTERVAL_MS);

        const mutationResult = await crearReserva({ ...input, correlationId });
        const returnedId = mutationResult?.correlationId;

        if (returnedId && String(returnedId) !== String(correlationId)) {
          throw new Error('El gateway devolvio un correlationId distinto al enviado.');
        }

        onEstadoCambia?.({
          ...mutationResult,
          estado: mutationResult?.estado || 'Procesando',
          correlationId,
        });

        await pollEstado();

        timeoutId = setTimeout(() => {
          finish(reject, new Error('Tiempo de espera agotado. Intenta nuevamente.'));
        }, TIMEOUT_MS);
      } catch (error) {
        finish(reject, error instanceof Error ? error : new Error(formatGraphqlError(error)));
      }
    })();
  });

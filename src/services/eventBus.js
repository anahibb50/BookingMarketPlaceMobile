import { crearReserva, suscribirseEstadoReserva } from './reservationService';
import { formatGraphqlError } from '../utils/apiHelpers';

const ESTADO_COMPLETADO = 'COMPLETADO';
const ESTADO_FALLIDO = 'FALLIDO';

function normalizeEstado(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export const crearReservaConSeguimiento = (input, onEstadoCambia) =>
  new Promise((resolve, reject) => {
    let subscription;
    let settled = false;
    let timeoutId;

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      subscription?.unsubscribe?.();
      fn(value);
    };

    (async () => {
      try {
        const mutationResult = await crearReserva(input);
        const correlationId = mutationResult?.correlationId;

        if (!correlationId) {
          throw new Error('El gateway no devolvio correlationId.');
        }

        onEstadoCambia?.({
          ...mutationResult,
          estado: mutationResult?.estado || 'Procesando',
          correlationId,
        });

        subscription = suscribirseEstadoReserva(correlationId).subscribe({
          next: ({ data }) => {
            const resultado = data?.estadoReserva;
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
          },
          error: (error) => {
            finish(reject, new Error(formatGraphqlError(error)));
          },
        });

        timeoutId = setTimeout(() => {
          finish(reject, new Error('Tiempo de espera agotado. Intenta nuevamente.'));
        }, 60000);
      } catch (error) {
        finish(reject, error instanceof Error ? error : new Error(formatGraphqlError(error)));
      }
    })();
  });

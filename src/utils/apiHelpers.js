export function resolveExtraId(item) {
  const raw =
    item?.idExtra ??
    item?.IdExtra ??
    item?.id ??
    item?.Id ??
    null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function buildGraphqlExtras(extraLines = []) {
  return extraLines
    .map((item) => {
      const idExtra = resolveExtraId(item);
      const cantidad = Number(item?.cantidad ?? 0);
      if (!idExtra || cantidad <= 0) return null;
      return { idExtra, cantidad };
    })
    .filter(Boolean);
}

export function extractApiData(payload) {
  if (payload == null) return null;
  if (Array.isArray(payload)) return payload;

  const envelope = payload?.data?.data !== undefined ? payload.data : payload;
  if (envelope?.data !== undefined) return envelope.data;
  if (envelope?.Data !== undefined) return envelope.Data;

  return envelope;
}

export function pickToken(node) {
  if (!node || typeof node !== 'object') return '';
  return node.token ?? node.Token ?? node.accessToken ?? node.AccessToken ?? '';
}

function extractGraphqlErrors(error) {
  if (Array.isArray(error?.graphQLErrors) && error.graphQLErrors.length) {
    return error.graphQLErrors;
  }

  const fromResult = error?.networkError?.result?.errors;
  if (Array.isArray(fromResult) && fromResult.length) return fromResult;

  const bodyText = error?.networkError?.bodyText;
  if (typeof bodyText === 'string' && bodyText.trim()) {
    try {
      const parsed = JSON.parse(bodyText);
      if (Array.isArray(parsed?.errors) && parsed.errors.length) return parsed.errors;
    } catch {
      // ignore parse errors
    }
  }

  return [];
}

export function formatGraphqlError(error) {
  const gqlErrors = extractGraphqlErrors(error);
  if (gqlErrors[0]?.message) return gqlErrors[0].message;

  const statusCode = error?.networkError?.statusCode;
  if (statusCode === 400) {
    return 'GraphQL rechazo la peticion (400). Usa fechas ISO UTC, por ejemplo 2026-06-18T09:00:00.000Z.';
  }

  const message = String(error?.message || '').trim();
  if (message && !message.startsWith('Response not successful')) return message;

  return 'No se pudo completar la operacion GraphQL.';
}

export function formatApiError(error, requestUrl = '') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.title) return error.response.data.title;
  if (error?.response?.status) {
    return `Error ${error.response.status} al llamar al bus.`;
  }
  if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
    const urlHint = requestUrl ? ` (${requestUrl})` : '';
    return `Network Error${urlHint}. El endpoint suele ser correcto; si pruebas en Expo web, el bus debe permitir CORS desde http://localhost:8081. Reinicia Expo tras cambiar .env.`;
  }
  return error?.message || 'No se pudo conectar con el bus.';
}

export function pickLoginPayload(response) {
  const body = response?.data;
  const nested = body?.data ?? body?.Data ?? body;
  if (nested && typeof nested === 'object') {
    return nested;
  }
  return {};
}

export function normalizeTipoIdentificacion(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'CED') return 'CEDULA';
  if (normalized === 'PAS') return 'PASAPORTE';
  if (normalized === 'CEDULA' || normalized === 'RUC' || normalized === 'PASAPORTE') {
    return normalized;
  }
  return 'CEDULA';
}

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { extractApiData, normalizeCustomerProfile, resolveExtraId } from '../utils/apiHelpers';

// Base debe terminar en /api/v2. Las rutas son relativas: /auth/login -> .../api/v2/auth/login
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

if (!API_BASE_URL && __DEV__) {
  console.warn(
    '[marketplaceService] EXPO_PUBLIC_API_BASE_URL vacia. Revisa .env y reinicia Expo (npm run start).'
  );
}

export function resolveApiUrl(path = '') {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${suffix}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function buildLookup(items, idKey = 'id', labelKey = 'nombre') {
  return (items || []).reduce((acc, item) => {
    const id = item?.[idKey] ?? item?.Id;
    const label = item?.[labelKey] ?? item?.Nombre ?? '';
    if (id != null) acc[String(id)] = label;
    return acc;
  }, {});
}

export function normalizeVehiculo(item, categoryMap = {}, locationMap = {}) {
  const pasajeros =
    item?.capacidadPasajeros ??
    item?.CapacidadPasajeros ??
    item?.pasajeros ??
    0;
  const maletas =
    item?.capacidadMaletas ?? item?.CapacidadMaletas ?? item?.maletas ?? 0;
  const precioBase =
    item?.precioBaseDia ??
    item?.PrecioBaseDia ??
    item?.precioPorDia ??
    item?.precio ??
    0;
  const idCategoria = item?.idCategoria ?? item?.IdCategoria ?? '';
  const idLocalizacion = item?.idLocalizacion ?? item?.IdLocalizacion ?? '';

  return {
    id: item?.id ?? item?.Id ?? '',
    modelo: item?.modelo ?? item?.Modelo ?? 'Vehiculo',
    marca: item?.marca ?? item?.Marca ?? '',
    placa: item?.placa ?? item?.Placa ?? '',
    imagenUrl: item?.imagenUrl ?? item?.ImagenUrl ?? '',
    precioPorDia: Number(precioBase) || 0,
    pasajeros: Number(pasajeros) || 0,
    maletas: Number(maletas) || 0,
    transmision:
      item?.tipoTransmision ?? item?.TipoTransmision ?? item?.transmision ?? 'Manual',
    aireAcondicionado: Boolean(item?.aireAcondicionado ?? item?.AireAcondicionado),
    idCategoria,
    idLocalizacion,
    categoriaNombre: categoryMap[String(idCategoria)] || 'Categoria general',
    localizacionNombre: locationMap[String(idLocalizacion)] || 'Localidad',
    descripcion:
      item?.observaciones ??
      item?.Observaciones ??
      `${item?.modelo ?? item?.Modelo ?? 'Vehiculo'} disponible para reserva.`,
  };
}

function normalizeLocalizacion(item) {
  return {
    id: item?.id ?? item?.Id ?? '',
    nombre: item?.nombre ?? item?.Nombre ?? '',
    ciudad: item?.ciudad ?? item?.Ciudad ?? '',
    idCiudad: item?.idCiudad ?? item?.IdCiudad ?? '',
    direccion: item?.direccion ?? item?.Direccion ?? '',
    horario: item?.horarioAtencion ?? item?.HorarioAtencion ?? '',
  };
}

function normalizeCategoria(item) {
  return {
    id: item?.id ?? item?.Id ?? '',
    nombre: item?.nombre ?? item?.Nombre ?? '',
    descripcion: item?.descripcion ?? item?.Descripcion ?? '',
  };
}

function normalizeExtra(item) {
  const resolvedId = resolveExtraId(item);
  return {
    id: resolvedId == null ? '' : String(resolvedId),
    idExtra: resolvedId,
    nombre: item?.nombre ?? item?.Nombre ?? 'Extra',
    descripcion: item?.descripcion ?? item?.Descripcion ?? '',
    valorUnitario:
      Number(
        item?.valorFijo ??
          item?.ValorFijo ??
          item?.valorUnitario ??
          item?.ValorUnitario ??
          item?.precio ??
          0
      ) || 0,
  };
}

function normalizeReserva(item) {
  return {
    id: item?.id ?? item?.Id ?? item?.codigo ?? item?.Codigo,
    codigo: item?.codigo ?? item?.Codigo ?? `RES-${item?.id ?? item?.Id ?? ''}`,
    estado: item?.estado ?? item?.Estado ?? 'PENDIENTE',
    fechaInicio: item?.fechaInicio ?? item?.FechaInicio ?? '',
    fechaFin: item?.fechaFin ?? item?.FechaFin ?? '',
    total: Number(item?.total ?? item?.Total ?? 0) || 0,
    vehiculo: {
      modelo: item?.modeloVehiculo ?? item?.ModeloVehiculo ?? 'Vehiculo',
      imagenUrl: item?.imagenUrl ?? item?.ImagenUrl ?? '',
    },
    localizacionRecogida: {
      nombre:
        item?.localizacionRecogida ??
        item?.LocalizacionRecogida ??
        item?.nombreLocalizacionRecogida ??
        'Recogida',
    },
    localizacionEntrega: {
      nombre:
        item?.localizacionEntrega ??
        item?.LocalizacionEntrega ??
        item?.nombreLocalizacionEntrega ??
        'Entrega',
    },
  };
}

// ============================================================
// AUTH
// ============================================================

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const getLoginUrl = () => resolveApiUrl('/auth/login');
export const getRegisterUrl = () => resolveApiUrl('/auth/register');

// ============================================================
// VEHÍCULOS
// ============================================================

export const getVehiculos = async () => {
  const response = await api.get('/vehiculos');
  return response.data;
};

export const getVehiculosDisponibles = async () => {
  const response = await api.get('/vehiculos/disponibles');
  return response.data;
};

export const getVehiculoPorId = async (id) => {
  const response = await api.get(`/vehiculos/${id}`);
  return response.data;
};

// ============================================================
// LOCALIZACIONES / CATÁLOGO
// ============================================================

export const getLocalizaciones = async () => {
  const response = await api.get('/localizaciones');
  return response.data;
};

export const getCiudades = async () => {
  const response = await api.get('/ciudades');
  return response.data;
};

function normalizeCiudad(item) {
  return {
    id: String(item?.id ?? item?.Id ?? ''),
    nombre: item?.nombre ?? item?.Nombre ?? '',
  };
}

export async function listCiudadesNormalized() {
  const response = await getCiudades();
  const list = extractApiData(response);
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCiudad).filter((item) => item.id);
}

export async function getClienteById(id) {
  const response = await api.get(`/clientes/${id}`);
  const data = extractApiData(response);
  return normalizeCustomerProfile(data);
}

export async function listLocalizacionesNormalized() {
  const response = await getLocalizaciones();
  const list = extractApiData(response);
  if (!Array.isArray(list)) return [];
  return list.map(normalizeLocalizacion).filter((item) => item.id);
}

export const getCategorias = async () => {
  const response = await api.get('/categorias');
  return response.data;
};

export const getExtras = async () => {
  const response = await api.get('/extras/activos');
  return response.data;
};

/** Público (sin login) — mismo catálogo que el marketplace web. */
export const getBookingExtras = async () => {
  const response = await api.get('/booking/extras', { params: { page: 1, limit: 50 } });
  return response.data;
};

// ============================================================
// RESERVAS (REST)
// ============================================================

export const getMisReservas = async () => {
  const response = await api.get('/reservas/mis-reservas');
  return response.data;
};

export const getReservaPorId = async (id) => {
  const response = await api.get(`/reservas/${id}`);
  return response.data;
};

export const verificarDisponibilidad = async (
  idVehiculo,
  fechaRecogida,
  fechaDevolucion,
  idLocalizacion
) => {
  const response = await api.get(`/booking/reservas/${idVehiculo}/disponibilidad`, {
    params: { fechaRecogida, fechaDevolucion, idLocalizacion },
  });
  return response.data;
};

// ============================================================
// HELPERS USADOS POR LAS PANTALLAS EXISTENTES
// ============================================================

export async function getMarketplaceBootstrap({ includeExtras = false } = {}) {
  const requests = [
    getVehiculosDisponibles(),
    getLocalizaciones(),
    getCategorias(),
  ];
  if (includeExtras) {
    requests.push(loadMarketplaceExtras());
  }

  const results = await Promise.all(requests);
  const [vehiculosRes, localizacionesRes, categoriasRes, extrasRes] = results;

  const categoriasRaw = extractApiData(categoriasRes) || [];
  const localizacionesRaw = extractApiData(localizacionesRes) || [];
  const extrasRaw = includeExtras ? extractBookingExtras(extrasRes) : [];
  const vehiculosRaw = extractApiData(vehiculosRes) || [];

  const categorias = categoriasRaw.map(normalizeCategoria);
  const localizaciones = localizacionesRaw.map(normalizeLocalizacion);
  const extras = extrasRaw.map(normalizeExtra);
  const categoryMap = buildLookup(categorias);
  const locationMap = buildLookup(localizaciones);

  const vehiculosDisponibles = vehiculosRaw.map((item) =>
    normalizeVehiculo(item, categoryMap, locationMap)
  );

  return { categorias, localizaciones, vehiculosDisponibles, extras };
}

async function loadMarketplaceExtras() {
  try {
    const response = await getBookingExtras();
    const bookingList = extractBookingExtras(response);
    if (bookingList.length) return bookingList;
  } catch {
    // fallback al endpoint autenticado
  }

  const token = await AsyncStorage.getItem('token');
  if (!token) return [];

  try {
    const response = await getExtras();
    const list = extractApiData(response);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function extractBookingExtras(payload) {
  const data = extractApiData(payload);
  if (Array.isArray(data)) return data;
  const list = data?.extras ?? data?.Extras ?? data?.items ?? data?.Items;
  return Array.isArray(list) ? list : [];
}

export async function getVehicleById(id) {
  const [vehicleRes, bootstrap] = await Promise.all([
    getVehiculoPorId(id),
    getMarketplaceBootstrap({ includeExtras: true }),
  ]);

  const raw = extractApiData(vehicleRes);
  if (!raw) return null;

  const categoryMap = buildLookup(bootstrap.categorias);
  const locationMap = buildLookup(bootstrap.localizaciones);
  return normalizeVehiculo(raw, categoryMap, locationMap);
}

export async function listMyReservationsNormalized() {
  const response = await getMisReservas();
  const list = extractApiData(response);
  if (!Array.isArray(list)) return [];
  return list.map(normalizeReserva);
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginRequest, register as registerRequest } from './marketplaceService';
import {
  extractCustomerProfileFromLoginPayload,
  normalizeCustomerProfile,
  pickLoginPayload,
  pickToken,
} from '../utils/apiHelpers';

const TOKEN_KEY = 'token';
const ID_CLIENTE_KEY = 'idCliente';
const USERNAME_KEY = 'username';
const CUSTOMER_PROFILE_KEY = 'customerProfile';

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredIdCliente() {
  return AsyncStorage.getItem(ID_CLIENTE_KEY);
}

export async function getStoredUsername() {
  return AsyncStorage.getItem(USERNAME_KEY);
}

export async function getStoredCustomerProfile() {
  const raw = await AsyncStorage.getItem(CUSTOMER_PROFILE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return normalizeCustomerProfile(parsed);
  } catch {
    return null;
  }
}

export async function saveSession({ token, idCliente, username, customerProfile }) {
  const tasks = [];
  if (token) tasks.push(AsyncStorage.setItem(TOKEN_KEY, token));
  if (idCliente != null && String(idCliente).trim() !== '') {
    tasks.push(AsyncStorage.setItem(ID_CLIENTE_KEY, String(idCliente)));
  }
  if (username) tasks.push(AsyncStorage.setItem(USERNAME_KEY, username));
  if (customerProfile) {
    tasks.push(
      AsyncStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(normalizeCustomerProfile(customerProfile)))
    );
  }
  await Promise.all(tasks);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, ID_CLIENTE_KEY, USERNAME_KEY, CUSTOMER_PROFILE_KEY]);
}

export async function getStoredSession() {
  const [token, idCliente, username, customerProfile] = await Promise.all([
    getStoredToken(),
    getStoredIdCliente(),
    getStoredUsername(),
    getStoredCustomerProfile(),
  ]);

  if (!token) return null;

  return { token, idCliente, username, customerProfile };
}

export async function hasActiveSession() {
  const token = await getStoredToken();
  return Boolean(token);
}

export async function logout() {
  await clearSession();
}

export async function loginAndSaveSession(username, password) {
  const response = await loginRequest(username, password);
  const payload = pickLoginPayload(response);
  const token = pickToken(payload) || pickToken(response?.data);
  const usuario = payload?.usuario ?? payload;
  const customerProfile = extractCustomerProfileFromLoginPayload(payload);
  const idCliente = customerProfile.idCliente || null;

  await saveSession({
    token,
    idCliente,
    username: usuario?.username ?? usuario?.correo ?? username,
    customerProfile,
  });

  return { token, idCliente, usuario, customerProfile };
}

export async function registerAndSaveSession(payload) {
  const response = await registerRequest(payload);
  const loginPayload = pickLoginPayload(response);
  const token = pickToken(loginPayload) || pickToken(response?.data);
  const usuario = loginPayload?.usuario ?? loginPayload;
  const customerProfile = extractCustomerProfileFromLoginPayload(loginPayload, payload);
  const idCliente = customerProfile.idCliente || null;

  if (!token) {
    throw new Error('La API no devolvio una sesion valida.');
  }

  await saveSession({
    token,
    idCliente,
    username: usuario?.username ?? payload?.username ?? usuario?.correo ?? payload?.correo,
    customerProfile,
  });

  return { token, idCliente, usuario, customerProfile };
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginRequest, register as registerRequest } from './marketplaceService';
import { pickLoginPayload, pickToken } from '../utils/apiHelpers';

const TOKEN_KEY = 'token';
const ID_CLIENTE_KEY = 'idCliente';
const USERNAME_KEY = 'username';

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredIdCliente() {
  return AsyncStorage.getItem(ID_CLIENTE_KEY);
}

export async function getStoredUsername() {
  return AsyncStorage.getItem(USERNAME_KEY);
}

export async function saveSession({ token, idCliente, username }) {
  const tasks = [];
  if (token) tasks.push(AsyncStorage.setItem(TOKEN_KEY, token));
  if (idCliente != null && String(idCliente).trim() !== '') {
    tasks.push(AsyncStorage.setItem(ID_CLIENTE_KEY, String(idCliente)));
  }
  if (username) tasks.push(AsyncStorage.setItem(USERNAME_KEY, username));
  await Promise.all(tasks);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, ID_CLIENTE_KEY, USERNAME_KEY]);
}

export async function getStoredSession() {
  const [token, idCliente, username] = await Promise.all([
    getStoredToken(),
    getStoredIdCliente(),
    getStoredUsername(),
  ]);

  if (!token) return null;

  return { token, idCliente, username };
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
  const idCliente =
    usuario?.idCliente ??
    usuario?.IdCliente ??
    payload?.idCliente ??
    payload?.IdCliente ??
    null;

  await saveSession({
    token,
    idCliente,
    username: usuario?.username ?? usuario?.correo ?? username,
  });

  return { token, idCliente, usuario };
}

export async function registerAndSaveSession(payload) {
  const response = await registerRequest(payload);
  const loginPayload = pickLoginPayload(response);
  const token = pickToken(loginPayload) || pickToken(response?.data);
  const usuario = loginPayload?.usuario ?? loginPayload;
  const idCliente =
    usuario?.idCliente ??
    usuario?.IdCliente ??
    loginPayload?.idCliente ??
    loginPayload?.IdCliente ??
    null;

  if (!token) {
    throw new Error('La API no devolvio una sesion valida.');
  }

  await saveSession({
    token,
    idCliente,
    username: usuario?.username ?? payload?.username ?? usuario?.correo ?? payload?.correo,
  });

  return { token, idCliente, usuario };
}

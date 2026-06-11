export const TIPOS_IDENTIFICACION = ['CEDULA', 'RUC', 'PASAPORTE'];
export const GENEROS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
];

export function sanitizeIdentificacion(value, tipo) {
  if (tipo === 'CEDULA') {
    return String(value || '').replace(/\D/g, '').slice(0, 10);
  }
  if (tipo === 'RUC') {
    return String(value || '').replace(/\D/g, '').slice(0, 13);
  }
  return String(value || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 20);
}

export function identificacionPlaceholder(tipo) {
  if (tipo === 'CEDULA') return '10 digitos';
  if (tipo === 'RUC') return '13 digitos';
  return '7 a 20 letras o numeros';
}

export function validateIdentificacion(raw, tipo) {
  const id = String(raw || '').trim();
  if (!id) return 'Ingresa tu identificacion.';
  if (tipo === 'CEDULA' && !/^\d{10}$/.test(id)) {
    return 'Cedula: exactamente 10 digitos.';
  }
  if (tipo === 'RUC' && !/^\d{13}$/.test(id)) {
    return 'RUC: exactamente 13 digitos.';
  }
  if (tipo === 'PASAPORTE') {
    if (id.length < 7 || id.length > 20) {
      return 'Pasaporte: entre 7 y 20 caracteres.';
    }
    if (!/^[A-Za-z0-9]+$/.test(id)) {
      return 'Pasaporte: solo letras y numeros.';
    }
  }
  return '';
}

export function validateRegisterForm(form) {
  const errors = {};

  const username = String(form.username || '').trim();
  if (!username) errors.username = 'Ingresa un nombre de usuario.';
  else if (username.length < 3) errors.username = 'Minimo 3 caracteres.';
  else if (/\s/.test(username)) errors.username = 'Sin espacios en el usuario.';

  const correo = String(form.correo || '').trim();
  if (!correo) errors.correo = 'Ingresa tu correo.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errors.correo = 'Correo no valido.';

  const password = String(form.password || '');
  if (!password) errors.password = 'Ingresa una contrasena.';
  else if (password.trim() !== password) errors.password = 'Sin espacios al inicio o al final.';
  else if (password.trim().length < 6) errors.password = 'Minimo 6 caracteres.';

  const idMsg = validateIdentificacion(form.identificacion, form.tipoIdentificacion);
  if (idMsg) errors.identificacion = idMsg;

  if (!String(form.nombre || '').trim()) errors.nombre = 'Ingresa tu nombre.';
  if (!String(form.apellido || '').trim()) errors.apellido = 'Ingresa tu apellido.';
  if (!form.idCiudad) errors.idCiudad = 'Selecciona tu ciudad.';

  const telefono = String(form.telefono || '').replace(/\D/g, '');
  if (telefono && telefono.length > 10) {
    errors.telefono = 'Telefono: maximo 10 digitos.';
  }

  return errors;
}

export function buildRegisterPayload(form) {
  const telefonoDigits = String(form.telefono || '').replace(/\D/g, '').slice(0, 10);
  const payload = {
    username: String(form.username || '').trim(),
    correo: String(form.correo || '').trim(),
    password: String(form.password || '').trim(),
    identificacion: String(form.identificacion || '').trim(),
    nombre: String(form.nombre || '').trim(),
    apellido: String(form.apellido || '').trim(),
    idCiudad: Number(form.idCiudad),
    tipoIdentificacion: form.tipoIdentificacion || 'CEDULA',
    genero: form.genero || 'M',
  };

  if (telefonoDigits) payload.telefono = telefonoDigits;
  if (String(form.direccion || '').trim()) {
    payload.direccion = String(form.direccion).trim();
  }

  return payload;
}

export const mockCategories = [
  { id: 1, nombre: 'Economico', descripcion: 'Ideal para ciudad y ahorro diario.' },
  { id: 2, nombre: 'SUV', descripcion: 'Espacio y comodidad para viajar mejor.' },
  { id: 3, nombre: 'Estandar', descripcion: 'Balance entre confort y precio.' },
  { id: 4, nombre: 'Deportivo', descripcion: 'Mas estilo para una experiencia premium.' },
];

export const mockLocations = [
  { id: 1, nombre: 'Aeropuerto Quito', ciudad: 'Quito' },
  { id: 2, nombre: 'Centro Norte Quito', ciudad: 'Quito' },
  { id: 3, nombre: 'Malecon Guayaquil', ciudad: 'Guayaquil' },
];

export const mockExtras = [
  { id: 1, nombre: 'GPS', descripcion: 'Navegacion integrada para tu viaje.', valorUnitario: 4.5 },
  { id: 2, nombre: 'Silla de bebe', descripcion: 'Seguridad extra para tu familia.', valorUnitario: 6 },
  { id: 3, nombre: 'Cobertura premium', descripcion: 'Mayor proteccion durante la renta.', valorUnitario: 12 },
];

export const mockVehicles = [
  {
    id: 101,
    modelo: 'Kia Rio 2024',
    marca: 'Kia',
    placa: 'ABC-1021',
    imagenUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    precioPorDia: 41,
    pasajeros: 5,
    maletas: 2,
    transmision: 'Automatico',
    aireAcondicionado: true,
    idCategoria: 1,
    idLocalizacion: 1,
    categoriaNombre: 'Economico',
    localizacionNombre: 'Aeropuerto Quito',
    descripcion: 'Sedan agil, bajo consumo y entrega inmediata.',
  },
  {
    id: 102,
    modelo: 'Hyundai Tucson',
    marca: 'Hyundai',
    placa: 'PBC-8874',
    imagenUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    precioPorDia: 76,
    pasajeros: 5,
    maletas: 4,
    transmision: 'Automatico',
    aireAcondicionado: true,
    idCategoria: 2,
    idLocalizacion: 2,
    categoriaNombre: 'SUV',
    localizacionNombre: 'Centro Norte Quito',
    descripcion: 'SUV comoda para ruta larga y escapadas familiares.',
  },
  {
    id: 103,
    modelo: 'Mazda 3 Grand Touring',
    marca: 'Mazda',
    placa: 'GYE-5508',
    imagenUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
    precioPorDia: 64,
    pasajeros: 5,
    maletas: 3,
    transmision: 'Automatico',
    aireAcondicionado: true,
    idCategoria: 3,
    idLocalizacion: 3,
    categoriaNombre: 'Estandar',
    localizacionNombre: 'Malecon Guayaquil',
    descripcion: 'Diseno elegante con un manejo premium.',
  },
];

export const mockReservations = [
  {
    id: 9001,
    codigo: 'RES-9001',
    estado: 'CONFIRMADA',
    fechaInicio: '2026-06-18T09:00:00',
    fechaFin: '2026-06-21T18:00:00',
    total: 221.95,
    vehiculo: { modelo: 'Hyundai Tucson', imagenUrl: mockVehicles[1].imagenUrl },
    localizacionRecogida: { nombre: 'Centro Norte Quito' },
    localizacionEntrega: { nombre: 'Centro Norte Quito' },
  },
];

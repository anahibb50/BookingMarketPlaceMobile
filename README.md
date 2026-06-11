# Booking Marketplace Mobile

App React Native (Expo) del **marketplace** de Budget Car, separada del backoffice web.

## Fuentes de datos

| Fuente | Variable | Uso |
|--------|----------|-----|
| Bus REST | `EXPO_PUBLIC_API_BASE_URL` | Login, vehículos, localidades, categorías, extras, mis reservas |
| Gateway GraphQL | `EXPO_PUBLIC_GRAPHQL_URL` / `EXPO_PUBLIC_GRAPHQL_WS_URL` | Crear reserva (mutation + subscription) |

## Configuración

1. Copia `.env.example` a `.env`.
2. Ajusta la IP del Gateway GraphQL (puerto **5114** en desarrollo).
   - Emulador Android → `10.0.2.2`
   - Dispositivo físico → IP de tu PC en la red local
3. Instala dependencias y arranca:

```bash
npm install
npm run start
```

## Sesión

- `loginAndSaveSession(username, password)` en `src/services/sessionService.js` guarda `token`, `idCliente` y `username` en AsyncStorage.
- La pantalla de crear reserva lee `idCliente` de la sesión automáticamente.
- **Mis reservas** requiere token JWT de cliente con rol `CLIENTE`.

## Estructura

- `src/screens` — pantallas (sin backoffice)
- `src/services/marketplaceService.js` — REST al bus
- `src/services/reservationService.js` — GraphQL mutation/subscription
- `src/services/eventBus.js` — flujo crear reserva + seguimiento
- `src/theme/colors.js` — paleta igual al web

## Flujo de reserva

1. `crearReserva` (GraphQL mutation) → devuelve `correlationId`
2. `estadoReserva` (subscription) → estados: `Procesando`, `ValidandoConductores`, `ObteniendoPrecios`, `VerificandoDisponibilidad`, `CreandoReserva`, `Completado` / `Fallido`

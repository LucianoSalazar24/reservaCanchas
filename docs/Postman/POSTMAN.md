# Colección de Postman — Sistema de Reservas de Canchas

Guía para probar **todos** los endpoints. Todas las llamadas pasan por el **gateway**
(no se le pega directo a cada microservicio).

---

## 0. Importar la colección lista (recomendado)

En vez de armar todo a mano, importá los dos archivos ya hechos que están en esta carpeta `docs/`:

- `Canchas.postman_collection.json` — la colección (6 carpetas, 27 requests).
- `Canchas-Local.postman_environment.json` — el environment (`baseUrl`, `token`, `clienteId`,
  `canchaId`, `reservaId`, `pagoId`).

**Pasos:**

1. Abrir Postman → botón **Import** (arriba a la izquierda).
2. Arrastrar (o seleccionar) **los dos** archivos `.json` a la vez → **Import**.
3. Arriba a la derecha, en el selector de environment, elegir **"Canchas - Local"**.
   > Si vas a probar producción, duplicá ese environment y cambiá `baseUrl` por la URL pública
   > del gateway en Render.
4. (Si probás local) Levantar el backend: `docker compose up -d --build`.
5. Abrir **Auth → POST login (publico)** → **Send**.
   El token se guarda **solo** en la variable `{{token}}` y lo heredan todas las demás requests.
6. Listo: ya podés correr cualquier endpoint. Para el camino feliz, seguí el orden de la
   sección **4. Flujo de prueba sugerido**.

**Lo que la colección ya resuelve por vos:**
- *Authorization* a nivel colección con **Bearer `{{token}}`** (login y registro van como `noauth`).
- Scripts *post-response* que **guardan automáticamente** las variables:
  - login / registro → `token` (y `clienteId` si corresponde)
  - crear cancha → `canchaId` · crear cliente → `clienteId` · crear reserva → `reservaId` · crear pago → `pagoId`
- Los bodies de **crear reserva** y **crear pago** ya usan `{{canchaId}}`, `{{clienteId}}` y
  `{{reservaId}}`: si seguís el flujo en orden, no tenés que copiar ningún id a mano.

> El resto de este documento (secciones 1–5) es la **referencia detallada** de cada endpoint,
> por si querés entender los bodies, las reglas de validación o armar requests manualmente.

---

## 1. Variables de entorno (Postman → Environments)

> Si importaste la colección (sección 0), esto **ya está hecho**. Esta sección es para crearlo a mano.


Crear un *Environment* (ej. "Canchas - Local") con estas variables:

| Variable    | Valor inicial (local)        | Valor en producción                         |
|-------------|------------------------------|---------------------------------------------|
| `baseUrl`   | `http://localhost:3000`      | URL pública del **gateway** en Render        |
| `token`     | *(vacío)*                    | *(se completa solo al hacer login)*          |
| `clienteId` | *(vacío)*                    | *(se completa al registrarse/crear cliente)* |
| `canchaId`  | *(vacío)*                    | *(se completa al crear una cancha)*          |
| `reservaId` | *(vacío)*                    | *(se completa al crear una reserva)*         |

> Asegurate de **seleccionar** el environment arriba a la derecha antes de probar.

---

## 2. Autenticación

- Rutas **públicas** (no requieren token): `POST /auth/login` y `POST /auth/registro`.
- **Todas las demás** requieren el header:
  ```
  Authorization: Bearer {{token}}
  ```
  En Postman, lo más cómodo: en la **colección** → pestaña *Authorization* → Type **Bearer Token**
  → Token `{{token}}`. Así lo heredan todas las requests (las públicas pueden dejarlo, se ignora).

- El token sale del campo `access_token` de la respuesta de login/registro. Para guardarlo
  automáticamente, pegá esto en la pestaña **Scripts → Post-response** de las requests de
  login y registro:
  ```js
  const json = pm.response.json();
  pm.environment.set("token", json.access_token);
  if (json.usuario && json.usuario.cliente_id) {
    pm.environment.set("clienteId", json.usuario.cliente_id);
  }
  ```

**Usuario admin de prueba (seed):** `admin@canchas.com` / `Admin123`

> Reglas de la contraseña en **registro**: mínimo 8 caracteres, al menos 1 número y 1 mayúscula.

---

## 3. Endpoints

### 🔐 Auth — `api-usuarios`

#### POST `{{baseUrl}}/auth/registro` — *(público)* → 201
Crea usuario + cliente (rol `cliente`).
```json
{
  "email": "juan@test.com",
  "password": "Test1234",
  "nombre": "Juan",
  "apellido": "Perez",
  "telefono": "3815551234"
}
```
Respuesta:
```json
{
  "access_token": "eyJhbGciOi...",
  "usuario": { "id": 2, "email": "juan@test.com", "rol": "cliente",
               "nombre": "Juan", "apellido": "Perez", "telefono": "3815551234", "cliente_id": 1 }
}
```

#### POST `{{baseUrl}}/auth/login` — *(público)* → 200
```json
{ "email": "admin@canchas.com", "password": "Admin123" }
```
Respuesta: `{ "access_token": "...", "usuario": { "id": 1, "email": "...", "rol": "admin" } }`

#### GET `{{baseUrl}}/auth/me` — *(token)* → 200
Sin body. Devuelve el usuario del token.

---

### 👤 Clientes — `api-usuarios`  *(todas requieren token)*

#### GET `{{baseUrl}}/clientes`
Query params opcionales:
- `busqueda` — texto (nombre/apellido/teléfono/email, insensible a mayúsculas)
- `limite` — número (default 50)
- `telefono` — si se envía, busca **un** cliente por teléfono exacto

Ejemplos: `{{baseUrl}}/clientes?busqueda=juan` · `{{baseUrl}}/clientes?telefono=3815551234`
Respuesta: `[ ... ]` (array de clientes)

#### GET `{{baseUrl}}/clientes/{{clienteId}}`
Un cliente por id.

#### GET `{{baseUrl}}/clientes/{{clienteId}}/descuento`
→ `{ "descuentoPorcentaje": 0 }`

#### GET `{{baseUrl}}/clientes/{{clienteId}}/estadisticas`
Derivadas de las reservas. → `{ "clienteId": 1, "totalReservas": 0, "noShows": 0, "ultimaReserva": null }`

#### POST `{{baseUrl}}/clientes` → 201
```json
{
  "nombre": "Maria",
  "apellido": "Gomez",
  "telefono": "3814440000",
  "email": "maria@test.com",
  "tipoClienteId": 2
}
```
> `email` y `tipoClienteId` son opcionales. `tipoClienteId`: 1=regular, 2=frecuente, 3=vip.

#### PUT `{{baseUrl}}/clientes/{{clienteId}}`
Actualiza datos (todos los campos opcionales):
```json
{ "nombre": "Maria Laura", "email": "marialaura@test.com" }
```

#### PATCH `{{baseUrl}}/clientes/{{clienteId}}`
Cambia el estado:
```json
{ "estado": "suspendido" }
```
> Valores: `activo` | `suspendido` | `bloqueado`

---

### ⚽ Canchas — `api-canchas`  *(GET puede requerir token igual; el resto sí)*

#### GET `{{baseUrl}}/canchas`
Lista todas.

#### GET `{{baseUrl}}/canchas/{{canchaId}}`
Una por id.

#### POST `{{baseUrl}}/canchas` → 201
```json
{
  "nombre": "Cancha 1 - Fútbol 5",
  "capacidad": 10,
  "precioPorHora": 8000,
  "descripcion": "Césped sintético, iluminada"
}
```
> `capacidad` (default 22) y `descripcion` son opcionales. `precioPorHora` debe ser > 0.
> Guardar el `id` de la respuesta en `{{canchaId}}` (Scripts → Post-response:
> `pm.environment.set("canchaId", pm.response.json().id)`).

#### PUT `{{baseUrl}}/canchas/{{canchaId}}`
Actualiza datos (campos opcionales):
```json
{ "precioPorHora": 9500 }
```

#### PATCH `{{baseUrl}}/canchas/{{canchaId}}`
Cambia el estado:
```json
{ "estado": "mantenimiento" }
```
> Valores: `disponible` | `mantenimiento` | `fuera_servicio`

#### DELETE `{{baseUrl}}/canchas/{{canchaId}}` → 204 (sin body)

---

### 📅 Reservas — `api-turnos`  *(token)*

#### GET `{{baseUrl}}/reservas`
Query params opcionales: `fecha` (YYYY-MM-DD), `canchaId`, `clienteId`, `estado`, `limite`.
Ejemplo: `{{baseUrl}}/reservas?fecha=2026-07-01&canchaId=1`
Respuesta: `[ ... ]` (array de reservas)
> `estado`: `pendiente` | `confirmada` | `cancelada` | `completada` | `no_show`
> **Scope:** con token de **cliente**, solo devuelve **sus** reservas (el filtro se fuerza con el
> `cliente_id` del token, sin importar el `clienteId` que mandes). Un **admin** ve/filtra todas.

#### GET `{{baseUrl}}/reservas/{{reservaId}}`
Una por id.

#### POST `{{baseUrl}}/reservas` → 201
```json
{
  "canchaId": 1,
  "clienteId": 1,
  "fecha": "2026-07-01",
  "horaInicio": "18:00",
  "horaFin": "19:00",
  "observaciones": "Partido de prueba"
}
```
Reglas que valida el servicio:
- `fecha`: `YYYY-MM-DD`. `horaInicio`/`horaFin`: `HH:mm`.
- Duración entre **1 y 3 horas**; horario **08:00–23:00**.
- No puede solaparse con otra reserva `pendiente`/`confirmada` de esa cancha.
- El cliente debe existir y estar `activo` (no `suspendido`/`bloqueado`, ni superar el máximo de no-shows).
- El precio y la seña se calculan solos (no se envían).
> Guardar el `id` en `{{reservaId}}`.

#### PATCH `{{baseUrl}}/reservas/{{reservaId}}`
Cambia el estado (confirmar / cancelar / completar / no-show):
```json
{ "estado": "cancelada", "razonCancelacion": "El cliente no puede asistir" }
```
> `estado`: `confirmada` | `cancelada` | `completada` | `no_show`.
> `razonCancelacion` es opcional (sólo aplica al cancelar).
> Nota: una reserva normalmente pasa a `confirmada` **sola** cuando se registra un pago que cubre la seña.

#### DELETE `{{baseUrl}}/reservas/{{reservaId}}` → 204 (sin body)

---

### 🕒 Disponibilidad — `api-turnos`  *(token)*

#### GET `{{baseUrl}}/disponibilidad`
Query params **obligatorios**: `canchaId`, `fecha` (YYYY-MM-DD).
Ejemplo: `{{baseUrl}}/disponibilidad?canchaId=1&fecha=2026-07-01`
Respuesta:
```json
{ "canchaId": 1, "fecha": "2026-07-01",
  "ocupados": [ { "horaInicio": "18:00:00", "horaFin": "19:00:00", "estado": "confirmada" } ] }
```

---

### 💵 Pagos — `api-pagos`  *(token)*

#### GET `{{baseUrl}}/pagos`
Query params opcionales: `reservaId`, `tipoPago`, `metodoPago`, `limite`.
- Si se envía `reservaId`, devuelve los pagos de esa reserva **+ el saldo**:
  `{{baseUrl}}/pagos?reservaId=1` → `{ "pagos": [...], "totalPagado": 2400, "saldoPendiente": 5600 }`
- Sin `reservaId`, lista pagos con filtros opcionales.

#### GET `{{baseUrl}}/pagos/estadisticas`
Totales del mes actual. → `{ "mes": "2026-07", "totalMes": 12000, "porMetodo": [ { "metodoPago": "efectivo", "cantidad": "3", "total": "12000" } ] }`

#### GET `{{baseUrl}}/pagos/{{pagoId}}`
Un pago por id.

#### POST `{{baseUrl}}/pagos` → 201
```json
{
  "reservaId": 1,
  "monto": 2400,
  "tipoPago": "seña",
  "metodoPago": "efectivo",
  "observaciones": "Seña del 30%"
}
```
> `tipoPago`: `seña` | `saldo` | `completo` | `devolucion`.
> `metodoPago`: `efectivo` | `tarjeta` | `transferencia`. `observaciones` opcional.
> Si el pago cubre la seña, api-pagos **confirma la reserva automáticamente** (`estado: confirmada`).

---

## 4. Flujo de prueba sugerido (orden)

1. **POST /auth/login** con el admin → guarda `{{token}}`.
2. **POST /canchas** → crea una cancha → guarda `{{canchaId}}`.
3. **POST /auth/registro** (o **POST /clientes**) → crea un cliente → guarda `{{clienteId}}`.
4. **GET /disponibilidad?canchaId={{canchaId}}&fecha=...** → ver horarios libres.
5. **POST /reservas** → crea la reserva → guarda `{{reservaId}}`.
6. **GET /pagos?reservaId={{reservaId}}** → ver el saldo pendiente.
7. **POST /pagos** (tipo `seña`) → la reserva pasa a `confirmada`.
8. **GET /reservas/{{reservaId}}** → confirmar el estado.
9. **PATCH /reservas/{{reservaId}}** `{ "estado": "completada" }` → cerrar la reserva.

---

## 5. Códigos de respuesta típicos

| Código | Significado |
|--------|-------------|
| 200 | OK (GET, PUT, PATCH, login) |
| 201 | Creado (POST de registro, clientes, canchas, reservas, pagos) |
| 204 | Sin contenido (DELETE) |
| 400 | Validación fallida (body inválido, reglas de negocio) |
| 401 | Falta token o es inválido/expirado |
| 403 | Prohibido (un cliente intenta ver/operar una reserva que no es suya) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (email/teléfono/nombre duplicado, u horario ya reservado) |
| 502 | Un microservicio no responde (en Render free, suele ser *cold start*: reintentar) |

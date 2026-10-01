# Sistema de Reservas de Canchas de Fútbol

Aplicación de reservas de canchas construida con una **arquitectura de microservicios** sobre
**NestJS + PostgreSQL**, con un **API Gateway** como único punto de entrada y un **frontend React**
desacoplado. El diseño sigue **convención REST estricta** (recursos en plural, sin verbos en la URL,
sin prefijo `/api`, códigos de estado semánticos).

> Trabajo de Práctica Profesional. La documentación detallada (diagramas de secuencia por servicio,
> colección de Postman y guía de despliegue) está en [`docs/`](./docs/).

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS (Node 20), TypeScript, TypeORM |
| Base de datos | PostgreSQL (Supabase en producción) |
| Gateway | NestJS + `http-proxy-middleware` + JWT |
| Frontend | React + Vite, servido con nginx en producción |
| Infra | Docker / Docker Compose |

## Arquitectura

```
Frontend-React (Vite/React) :5173
    │  axios + Bearer JWT (CORS)
    ▼
Gateway :3000  (AuthMiddleware JWT + proxy)
    ├─ /auth, /clientes          → api-usuarios :3001
    ├─ /canchas                  → api-canchas  :3002
    ├─ /reservas, /disponibilidad → api-turnos  :3003
    └─ /pagos                    → api-pagos    :3004
                                      │
                                      ▼
                            PostgreSQL (Supabase)
```

- El **gateway** valida el JWT, e inyecta `x-user-id`, `x-user-email`, `x-user-rol` y `x-cliente-id`
  en cada request antes de proxear. Rutas públicas: `POST /auth/login`, `POST /auth/registro`.
- Cada microservicio es **dueño exclusivo** de sus tablas. Las relaciones cross-service se resuelven
  por HTTP, no por FK. No se duplican datos derivables (estadísticas del cliente, saldo de una
  reserva): se calculan consultando al servicio dueño.

Diagrama de arquitectura completo y diagramas de secuencia por endpoint en
[`docs/README.md`](./docs/README.md) y [`docs/diagramas/`](./docs/diagramas/).

## Estructura del repositorio

| Carpeta | Contenido |
|---------|-----------|
| `gateway/` | API Gateway (auth + proxy) |
| `api-usuarios/` | Autenticación (JWT) y clientes |
| `api-canchas/` | Canchas |
| `api-turnos/` | Reservas y disponibilidad (lógica de negocio) |
| `api-pagos/` | Pagos |
| `Frontend-React/` | SPA React (Vite) |
| `database/` | `schema.sql` (fuente de verdad del esquema) + `seed.sql` (datos de ejemplo) |
| `docs/` | Documentación, diagramas y colección de Postman |

Cada carpeta de servicio es un **repositorio/proyecto Node independiente** (su propio `package.json`,
`Dockerfile` y `.env.template`).

## Puesta en marcha

### Requisitos

- Docker + Docker Compose
- Una base PostgreSQL accesible (Supabase, o una instancia propia). El compose **no** levanta la BD.

### 1. Variables de entorno

```bash
cp .env.template .env
```

Completar en `.env`:
- `DATABASE_URL` — connection string de PostgreSQL (Session Pooler de Supabase en prod).
- `DATABASE_SSL` — `true` para Supabase/prod, `false` para una BD local sin SSL.
- `JWT_SECRET` — debe ser **idéntico** para gateway y api-usuarios (el compose lo comparte).

### 2. Cargar el esquema y los datos (una sola vez)

Ejecutar en la base destino, en orden:

```bash
database/schema.sql   # tablas, tipos ENUM y configuraciones
database/seed.sql     # canchas, clientes y reservas de ejemplo
```

En Supabase se corren desde el **SQL Editor**. Todos los servicios usan `synchronize: false`, por lo
que **`schema.sql` es la fuente de verdad del esquema** (si cambian las entidades, actualizarlo).

### 3. Levantar la stack

```bash
docker compose up -d --build
```

- Frontend → http://localhost:5173
- Gateway (API) → http://localhost:3000

### Desarrollo manual (sin Docker para los servicios)

Desde cada carpeta de servicio:

```bash
cp .env.template .env
npm install
npm run start:dev      # hot-reload
```

Y el frontend:

```bash
cd Frontend-React
npm install
npm run dev            # :5173, consume el gateway vía VITE_API_URL
```

## Usuario de prueba

El `seed.sql` crea un administrador:

```
email:    admin@canchas.com
password: Admin123
```

Clientes con reservas de ejemplo también vienen en el seed. Para crear un cliente nuevo:
`POST /auth/registro`.

## Convención REST

| Acción | Método + URL | Éxito |
|--------|--------------|-------|
| Listar | `GET /recurso` (devuelve **array**, sin envoltorio) | 200 |
| Obtener uno | `GET /recurso/:id` | 200 |
| Crear | `POST /recurso` | 201 |
| Actualizar datos | `PUT /recurso/:id` | 200 |
| Cambiar estado | `PATCH /recurso/:id` con `{ estado }` | 200 |
| Eliminar | `DELETE /recurso/:id` (sin cuerpo) | 204 |

Los cambios de estado (confirmar, cancelar, completar, no-show) van todos por `PATCH` con el campo
`estado`. Sin prefijo `/api`; recursos en plural y sin verbos en la URL.

### Manejo de errores

Cada microservicio tiene un **exception filter global** que normaliza los errores a
`{ statusCode, error, message }` y traduce los errores de PostgreSQL al código HTTP correcto
(`23505` → 409, FK/not-null/formato → 400), evitando que se escapen como 500. En el gateway:
microservicio caído → 502, token ausente/inválido → 401, ruta sin match → 404.

## Seguridad y acceso

- Autenticación con **JWT** (firmado por api-usuarios, validado en el gateway).
- **Scope por dueño:** un cliente solo ve y opera **sus** reservas. `GET /reservas` fuerza el filtro
  con el `cliente_id` del token; `GET/PATCH/DELETE /reservas/:id` devuelven **403** si la reserva no
  es suya. Un `admin` no tiene esta restricción.

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`docs/README.md`](./docs/README.md) | Arquitectura, modelo de datos, ruteo del gateway, parámetros de negocio |
| [`docs/diagramas/`](./docs/diagramas/) | Diagramas de secuencia por endpoint de cada microservicio |
| [`docs/Postman/POSTMAN.md`](./docs/Postman/POSTMAN.md) | Guía + colección importable para probar todos los endpoints |
| [`docs/DEPLOY.md`](./docs/DEPLOY.md) | Despliegue en Supabase + Render + Vercel |
| [`CLAUDE.md`](./CLAUDE.md) | Guía técnica detallada del repositorio |

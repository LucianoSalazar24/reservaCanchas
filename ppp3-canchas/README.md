# FutbolReservas — Sistema de Reservas de Canchas

Aplicación web para la gestión de reservas de canchas deportivas. Permite a los clientes reservar canchas en un flujo guiado de 4 pasos y a los administradores gestionar canchas, clientes, reservas y pagos desde un panel de control centralizado.

---

## Tecnologías utilizadas

| Categoría | Tecnología |
|-----------|-----------|
| Framework | React 19 |
| Lenguaje | TypeScript 6 |
| Build tool | Vite 8 |
| Estilos | Tailwind CSS v4 |
| Componentes UI | Radix UI (Select, Dropdown Menu) |
| HTTP client | Axios |
| Routing | React Router DOM v7 |
| Alertas | SweetAlert2 |
| Iconos | React Icons |
| Linting | ESLint + typescript-eslint |
| Contenedor | Docker (multi-stage) + Nginx |
| Deploy | Vercel |

---

## Arquitectura

El proyecto sigue **Atomic Design** para organizar los componentes, con una capa de servicios y hooks personalizados que abstraen la comunicación con el backend.

```
src/
├── components/
│   ├── atoms/          # Componentes base: Modal, Spinner, Badge, Skeleton, Alert, Select, etc.
│   ├── molecules/      # Combinaciones simples: CardPage, EmptyState
│   ├── organims/       # Funcionalidades completas (páginas y secciones)
│   │   ├── home/           # Página de inicio pública
│   │   ├── login/          # Login y registro
│   │   ├── reserve/        # Flujo de reserva (4 pasos)
│   │   ├── my-reservations/# Mis reservas (vista cliente)
│   │   ├── pagos/          # Formulario de pago
│   │   ├── dashboard-admin/# Panel de administración con tabs
│   │   ├── tables/         # Tablas de datos reutilizables
│   │   └── notFound/       # Páginas 404 y 403
│   ├── auth/           # ProtectedRoute (guarda de rutas por rol)
│   ├── layout/         # Header, Footer, modal de perfil
│   └── layouts/        # Layouts: AdminLayout, PublicLayout
├── context/
│   └── AuthContext.tsx # Contexto global de autenticación
├── hooks/              # Hooks personalizados de datos
├── services/           # Clientes HTTP por dominio (Axios)
├── types/              # Tipos TypeScript compartidos
├── utils/              # Funciones utilitarias puras
│   ├── date.utils.ts       # Formateo de fechas en español, duración
│   ├── money.utils.ts      # Formateo de precios en ARS, cálculo de seña
│   ├── estado.utils.ts     # Labels de estados de reserva/cancha
│   ├── horario.utils.ts    # Validación de horarios disponibles
│   └── reservas.utils.ts   # Helpers de reservas
├── mock/               # Datos y constantes de configuración
└── lib/
    └── utils.ts        # Utilidades generales (clsx, etc.)
```

---

## Funcionalidades

### Vista pública / Cliente
- Listado de canchas disponibles en la página de inicio
- Registro e inicio de sesión
- **Flujo de reserva en 4 pasos:**
  1. Identificación del cliente (nuevo o existente)
  2. Selección de cancha, fecha y horario
  3. Resumen y confirmación de la reserva
  4. Pago de seña o saldo
- Consulta de mis reservas y pagos pendientes

### Panel de administración (`/admin`)
- **Dashboard:** métricas generales (reservas recientes, ingresos, ocupación)
- **Canchas:** alta, edición y cambio de estado (`disponible`, `mantenimiento`, `fuera_servicio`)
- **Clientes:** listado, búsqueda y gestión de estados (`activo`, `suspendido`, `bloqueado`)
- **Reservas:** visualización y cambio de estado (`pendiente`, `confirmada`, `cancelada`, `completada`, `no_show`)
- **Pagos:** registro de pagos por reserva (seña, saldo, completo, devolución)

---

## Autenticación y roles

- La sesión se almacena en `localStorage` como JWT.
- Existen dos roles: `cliente` y `admin`.
- Las rutas protegidas son guardadas por `ProtectedRoute`, que redirige a `/forbidden` si el rol no coincide y a `/login` si no hay sesión.
- Axios adjunta automáticamente el token `Bearer` en cada petición y redirige a `/login` ante respuestas `401`.

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend (NestJS) | `http://localhost:3000` |

Crear un archivo `.env` en la raíz del proyecto:

```env
# Producción
VITE_API_URL=

# Desarrollo local
# VITE_API_URL=http://localhost:3000
```

---

## Instalación y ejecución

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

### Build de producción

```bash
npm run build
npm run preview
```

### Con Docker

```bash
# Build de la imagen (se puede pasar la URL del backend como argumento)
docker build --build-arg VITE_API_URL=http://mi-backend.com -t canchas-frontend .

# Correr el contenedor
docker run -p 80:80 canchas-frontend
```

El contenedor usa **Nginx** para servir los archivos estáticos y redirigir todas las rutas al `index.html` (necesario para el routing de React).

---

## Servicios (capa de API)

Cada dominio tiene su propio archivo de servicio en `src/services/`:

| Servicio | Endpoints |
|----------|-----------|
| `auth.service.ts` | Login, registro, perfil |
| `canchas.service.ts` | CRUD de canchas, disponibilidad |
| `clientes.service.ts` | CRUD de clientes |
| `reservas.service.ts` | CRUD de reservas, filtros |
| `pagos.service.ts` | Registro de pagos, saldo por reserva |

---

## Hooks personalizados

| Hook | Descripción |
|------|-------------|
| `useFetch` | Fetching genérico con estados `loading`, `error` y función `recargar` |
| `useCanchas` | Canchas disponibles y operaciones CRUD |
| `useClientes` | Clientes con búsqueda y filtros |
| `useReservas` | Reservas con filtros por fecha y estado |
| `usePagos` | Pagos asociados a una reserva |
| `useDebounce` | Debounce para inputs de búsqueda |

---

## Deploy en Vercel

El archivo `vercel.json` ya está configurado. Solo es necesario definir la variable de entorno `VITE_API_URL` en el panel de Vercel y conectar el repositorio.

```json
{
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

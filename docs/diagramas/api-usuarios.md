# api-usuarios :3001

Microservicio de **autenticación (JWT)** y **gestión de clientes**.

- Base de datos: tablas `usuarios`, `clientes`, `tipos_cliente`.
- Dependencia saliente: `api-turnos` (derivar estadísticas del cliente y validar reservas antes de borrar).
- Variables de entorno: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `TURNOS_URL`, `INTERNAL_SECRET`.
- Seguridad: `InternalAuthGuard` global → **403** si la request no trae `x-internal-secret` (no pasó
  por el gateway). Exentos: `OPTIONS` y `GET /health` (health check de Render → `{ status: 'ok' }`).

## Entidades

```mermaid
classDiagram
    class Usuario {
        +int id
        +string email
        +string passwordHash
        +string rol
        +Date createdAt
    }
    class Cliente {
        +int id
        +int usuarioId
        +string nombre
        +string apellido
        +string telefono
        +string email
        +int tipoClienteId
        +string estado
        +Date createdAt
    }
    Usuario "1" --> "0..1" Cliente : usuario_id
```

- `Usuario.rol`: `cliente` · `empleado` · `admin`
- `Cliente.estado`: `activo` · `suspendido` · `bloqueado`

> Nota: `Cliente` **no** almacena `no_shows`, `total_reservas` ni `ultima_reserva` (datos derivados
> de las reservas, ver `GET /clientes/:id/estadisticas`).

## Endpoints

| Método | URL | Éxito | Descripción |
|--------|-----|-------|-------------|
| POST | `/auth/login` | 200 | Autenticar y obtener JWT |
| POST | `/auth/registro` | 201 | Registrar usuario + cliente |
| GET | `/auth/me` | 200 | Datos del usuario del token |
| GET | `/clientes` | 200 | Listar / buscar clientes |
| GET | `/clientes/:id` | 200 | Obtener un cliente |
| POST | `/clientes` | 201 | Crear cliente |
| PUT | `/clientes/:id` | 200 | Actualizar datos del cliente |
| PATCH | `/clientes/:id` | 200 | Actualizar estado del cliente |
| DELETE | `/clientes/:id` | 204 | Eliminar cliente (409 si tiene reservas) |
| GET | `/clientes/:id/descuento` | 200 | Descuento según tipo de cliente |
| GET | `/clientes/:id/estadisticas` | 200 | Estadísticas derivadas de reservas |

---

### `POST /auth/login`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant A as AuthController
    participant S as AuthService
    participant DB as PostgreSQL

    Cliente->>GW: POST /auth/login {email, password}
    Note over GW: ruta pública (sin token)
    GW->>A: login(LoginDto)
    A->>S: login(dto)
    S->>DB: SELECT usuario WHERE email
    alt no existe o password inválida
        S-->>Cliente: 401 Credenciales inválidas
    else credenciales OK
        S->>DB: SELECT cliente WHERE usuario_id
        S->>S: jwt.sign({sub, email, rol, cliente_id})
        S-->>Cliente: 200 {access_token, usuario{...telefono, cliente_id}}
    end
```

### `POST /auth/registro`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant A as AuthController
    participant S as AuthService
    participant DB as PostgreSQL

    Cliente->>GW: POST /auth/registro {email, password, nombre, ...}
    Note over GW: ruta pública (sin token)
    GW->>A: registro(RegisterDto)
    A->>S: registro(dto)
    S->>DB: SELECT usuario WHERE email
    alt email ya registrado
        S-->>Cliente: 409 Conflict
    else email libre
        S->>S: bcrypt.hash(password)
        S->>DB: INSERT usuarios
        S->>DB: INSERT clientes (usuario_id)
        S->>S: jwt.sign(payload)
        S-->>Cliente: 201 {access_token, usuario}
    end
```

### `GET /auth/me`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant A as AuthController
    participant S as AuthService
    participant DB as PostgreSQL

    Cliente->>GW: GET /auth/me (Bearer token)
    GW->>A: me(authHeader)
    A->>S: verificar(token)
    S->>S: jwt.verify(token, JWT_SECRET)
    alt token inválido
        S-->>Cliente: 401 Token inválido o expirado
    else token válido
        S->>DB: SELECT usuario + cliente
        S-->>Cliente: 200 {id, email, rol, nombre, ...}
    end
```

### `GET /clientes`  ·  `GET /clientes/:id`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as ClientesController
    participant S as ClientesService
    participant DB as PostgreSQL

    Cliente->>GW: GET /clientes?busqueda=&limite=  (o /clientes/:id, ?telefono=)
    GW->>C: findAll(query) / findOne(id)
    C->>S: findAll | findByTelefono | findOne
    S->>DB: SELECT clientes (filtros)
    alt findOne y no existe
        S-->>Cliente: 404 Not Found
    else
        S-->>Cliente: 200 clientes[] | cliente
    end
```

### `POST /clientes`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as ClientesController
    participant S as ClientesService
    participant DB as PostgreSQL

    Cliente->>GW: POST /clientes (CreateClienteDto)
    GW->>C: create(dto)
    C->>S: create(dto)
    S->>DB: INSERT clientes
    alt teléfono/email duplicado
        S-->>Cliente: 409 Conflict
    else
        S-->>Cliente: 201 cliente
    end
```

### `PUT /clientes/:id`  ·  `PATCH /clientes/:id`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as ClientesController
    participant S as ClientesService
    participant DB as PostgreSQL

    Cliente->>GW: PUT /clientes/:id (datos)  |  PATCH /clientes/:id ({estado})
    GW->>C: update(id, dto) | updateEstado(id, dto)
    C->>S: update | updateEstado
    S->>DB: SELECT cliente
    alt no existe
        S-->>Cliente: 404 Not Found
    else existe
        S->>DB: UPDATE clientes
        S-->>Cliente: 200 cliente actualizado
    end
```

### `GET /clientes/:id/descuento`

```mermaid
sequenceDiagram
    participant T as api-turnos (consumidor interno)
    participant C as ClientesController
    participant S as ClientesService
    participant DB as PostgreSQL

    T->>C: GET /clientes/:id/descuento
    C->>S: getDescuento(id)
    S->>DB: SELECT tc.descuento_porcentaje<br/>FROM clientes c JOIN tipos_cliente tc
    alt cliente no existe
        S-->>T: 404 Not Found
    else
        S-->>T: 200 {descuentoPorcentaje}
    end
```

### `GET /clientes/:id/estadisticas`  (dato derivado)

```mermaid
sequenceDiagram
    actor Cliente
    participant C as ClientesController
    participant S as ClientesService
    participant DB as PostgreSQL
    participant T as api-turnos :3003

    Cliente->>C: GET /clientes/:id/estadisticas
    C->>S: getEstadisticas(id)
    S->>DB: SELECT cliente (valida existencia)
    alt no existe
        S-->>Cliente: 404 Not Found
    else existe
        S->>T: GET /reservas?clienteId=id
        alt api-turnos no responde
            S-->>Cliente: 503 Service Unavailable
        else
            T-->>S: reservas[]
            S->>S: noShows = count(estado=no_show)<br/>totalReservas = count(estado=completada)<br/>ultimaReserva = max(fecha completadas)
            S-->>Cliente: 200 {clienteId, totalReservas, noShows, ultimaReserva}
        end
    end
```

### `DELETE /clientes/:id`  (integridad cross-service)

No se puede borrar un cliente con reservas asociadas: como no hay FK entre `clientes` y `reservas`
(dueño: api-turnos), la verificación se hace por HTTP y se rechaza con **409**.

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as ClientesController
    participant S as ClientesService
    participant DB as PostgreSQL
    participant T as api-turnos :3003

    Cliente->>GW: DELETE /clientes/:id
    GW->>C: remove(id)
    C->>S: remove(id)
    S->>DB: SELECT cliente (valida existencia)
    alt no existe
        S-->>Cliente: 404 Not Found
    else existe
        S->>T: GET /reservas?clienteId=id
        alt api-turnos no responde
            S-->>Cliente: 503 Service Unavailable
        else tiene reservas asociadas
            S-->>Cliente: 409 Conflict
        else sin reservas
            S->>DB: DELETE cliente
            S-->>Cliente: 204 No Content
        end
    end
```

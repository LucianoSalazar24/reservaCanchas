# api-turnos :3003

Microservicio de **reservas** y **disponibilidad horaria**. Concentra la lógica de negocio que
antes vivía en triggers de BD.

- Base de datos: tabla `reservas` + lectura de `configuraciones`.
- Dependencias salientes: `api-usuarios` (validar cliente, descuento) y `api-canchas` (precio).
- Consumido internamente por: `api-usuarios` (estadísticas + validar reservas al borrar cliente),
  `api-canchas` (reservas activas al inactivar/borrar cancha) y `api-pagos` (verificar/confirmar).
- Variables de entorno: `PORT`, `DATABASE_URL`, `USUARIOS_URL`, `CANCHAS_URL`,
  `SENA_PORCENTAJE_DEFAULT`, `HORAS_ANTICIPACION_MIN`, `DURACION_MAXIMA_HORAS`, `INTERNAL_SECRET`.
- Seguridad: `InternalAuthGuard` global → **403** si la request no trae `x-internal-secret` (no pasó
  por el gateway). Exentos: `OPTIONS` y `GET /health` (health check de Render → `{ status: 'ok' }`).

## Entidad

```mermaid
classDiagram
    class Reserva {
        +int id
        +int canchaId
        +int clienteId
        +date fecha
        +time horaInicio
        +time horaFin
        +decimal precioTotal
        +decimal descuentoAplicado
        +decimal senaRequerida
        +string estado
        +text observaciones
        +Date fechaCreacion
        +Date fechaCancelacion
        +text razonCancelacion
    }
```

- `Reserva.estado`: `pendiente` · `confirmada` · `cancelada` · `completada` · `no_show`

> No almacena `sena_pagada` ni `pago_completo`: el estado de pago se deriva de api-pagos.

## Máquina de estados de una reserva

```mermaid
stateDiagram-v2
    [*] --> pendiente : POST /reservas
    pendiente --> confirmada : pago cubre seña o PATCH estado=confirmada
    pendiente --> cancelada : PATCH estado=cancelada
    confirmada --> completada : PATCH estado=completada
    confirmada --> cancelada : PATCH estado=cancelada
    confirmada --> no_show : PATCH estado=no_show
    cancelada --> [*]
    completada --> [*]
    no_show --> [*]
```

## Endpoints

| Método | URL | Éxito | Descripción |
|--------|-----|-------|-------------|
| GET | `/reservas` | 200 | Listar reservas (filtros validados) |
| GET | `/reservas/:id` | 200 | Obtener una reserva |
| POST | `/reservas` | 201 | Crear reserva |
| PATCH | `/reservas/:id` | 200 | Cambiar estado |
| DELETE | `/reservas/:id` | 204 | Eliminar reserva |
| GET | `/disponibilidad` | 200 | Horarios ocupados de una cancha en una fecha |

---

### `GET /reservas`

Filtros (query, validados por `QueryReservasDto`): `fecha`, `desde` (reservas con fecha ≥ ese día;
lo usan api-canchas/api-usuarios para verificar reservas a futuro), `canchaId`, `clienteId`,
`estado` (enum), `limite`.

> **Scope por dueño:** si `x-user-rol` = `cliente`, el controller fuerza `clienteId` con el
> `x-cliente-id` del token (inyectado por el gateway) e **ignora** el `clienteId` de la query, para
> que un cliente solo vea sus reservas. Un `admin` puede filtrar por cualquier `clienteId`.

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant R as ReservasController
    participant S as ReservasService
    participant DB as PostgreSQL

    Cliente->>GW: GET /reservas?clienteId=&estado=&...
    GW->>R: findAll(query, x-user-rol, x-cliente-id)
    Note over R: ValidationPipe valida estado ∈ enum
    Note over R: si rol=cliente → clienteId = x-cliente-id (ignora query)
    R->>S: findAll(filtros)
    S->>DB: SELECT reservas (filtros + orden)
    S-->>Cliente: 200 reservas[]
```

### `GET /reservas/:id`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant R as ReservasController
    participant S as ReservasService
    participant DB as PostgreSQL

    Cliente->>GW: GET /reservas/:id
    GW->>R: findOne(id, x-user-rol, x-cliente-id)
    R->>S: findOne(id, ownerClienteId)
    S->>DB: SELECT reserva WHERE id
    alt no existe
        S-->>Cliente: 404 Not Found
    else rol=cliente y la reserva no es suya
        S-->>Cliente: 403 Forbidden
    else
        S-->>Cliente: 200 reserva
    end
```

### `POST /reservas`  (creación con validaciones cross-service)

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant R as ReservasController
    participant S as ReservasService
    participant DB as PostgreSQL
    participant U as api-usuarios
    participant C as api-canchas

    Cliente->>GW: POST /reservas (CreateReservaDto)
    GW->>R: create(dto)
    R->>S: create(dto)

    S->>S: validarHorario() — 1..3h, 08:00–23:00
    S->>DB: validarDisponibilidad() — sin solapamiento
    alt horario inválido / solapado
        S-->>Cliente: 400 / 409
    end

    S->>C: GET /canchas/:id  (validarCancha)
    alt cancha no existe
        C-->>Cliente: 404
    else estado != disponible (mantenimiento / fuera_servicio)
        S-->>Cliente: 400 La cancha no admite reservas
    end

    S->>U: GET /clientes/:id  (validarCliente)
    alt cliente no existe
        U-->>Cliente: 404
    else activo
        S->>DB: COUNT no_show del cliente
        Note over S: auto-bloqueo si ≥ max_no_shows_bloqueo
        alt suspendido/bloqueado o supera no-shows
            S-->>Cliente: 400 Bad Request
        end
    end

    par calcular precio
        S->>C: GET /canchas/:id  (precio por hora)
    and
        S->>U: GET /clientes/:id/descuento
    end
    S->>DB: SELECT sena_porcentaje (configuraciones)
    S->>S: precioTotal = precio×horas×(1-desc)<br/>senaRequerida = precioTotal×seña%
    S->>DB: INSERT reserva (estado=pendiente)
    S-->>Cliente: 201 reserva
```

### `PATCH /reservas/:id`  (cambio de estado)

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant R as ReservasController
    participant S as ReservasService
    participant DB as PostgreSQL

    Cliente->>GW: PATCH /reservas/:id {estado, razonCancelacion?}
    GW->>R: updateEstado(id, dto, x-user-rol, x-cliente-id)
    R->>S: updateEstado(id, dto, ownerClienteId)
    S->>DB: SELECT reserva
    alt no existe
        S-->>Cliente: 404 Not Found
    else rol=cliente y la reserva no es suya
        S-->>Cliente: 403 Forbidden
    else existe
        opt estado = cancelada
            S->>S: setear fechaCancelacion + razonCancelacion
        end
        Note over S: no_show / completada NO sincronizan al cliente<br/>(se derivan en GET /clientes/:id/estadisticas)
        S->>DB: UPDATE reserva SET estado
        S-->>Cliente: 200 reserva actualizada
    end
```

### `DELETE /reservas/:id`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant R as ReservasController
    participant S as ReservasService
    participant DB as PostgreSQL

    Cliente->>GW: DELETE /reservas/:id
    GW->>R: remove(id, x-user-rol, x-cliente-id)
    R->>S: remove(id, ownerClienteId)
    S->>DB: SELECT reserva
    alt no existe
        S-->>Cliente: 404 Not Found
    else rol=cliente y la reserva no es suya
        S-->>Cliente: 403 Forbidden
    else existe
        S->>DB: DELETE reserva
        S-->>Cliente: 204 No Content
    end
```

### `GET /disponibilidad`

Recurso propio (controller `DisponibilidadController`) que reutiliza `ReservasService`. Query
requerido: `canchaId`, `fecha`.

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant D as DisponibilidadController
    participant S as ReservasService
    participant DB as PostgreSQL

    Cliente->>GW: GET /disponibilidad?canchaId=&fecha=
    GW->>D: getDisponibilidad(QueryDisponibilidadDto)
    D->>S: getDisponibilidad(canchaId, fecha)
    S->>DB: SELECT reservas (pendiente/confirmada) WHERE cancha+fecha
    S-->>Cliente: 200 {canchaId, fecha, ocupados[]}
```

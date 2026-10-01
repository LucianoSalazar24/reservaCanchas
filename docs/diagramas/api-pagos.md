# api-pagos :3004

Microservicio de **pagos** de las reservas. Es el **dueño exclusivo** del recurso `pagos`.

- Base de datos: tabla `pagos`.
- Dependencia saliente: `api-turnos` (verificar la reserva y confirmarla tras el pago).
- Variables de entorno: `PORT`, `DATABASE_URL`, `TURNOS_URL`, `INTERNAL_SECRET`.
- Seguridad: `InternalAuthGuard` global → **403** si la request no trae `x-internal-secret` (no pasó
  por el gateway). Exentos: `OPTIONS` y `GET /health` (health check de Render → `{ status: 'ok' }`).

## Entidad

```mermaid
classDiagram
    class Pago {
        +int id
        +int reservaId
        +decimal monto
        +string tipoPago
        +string metodoPago
        +Date fechaPago
        +text observaciones
    }
```

- `Pago.tipoPago`: `seña` · `saldo` · `completo` · `devolucion`
- `Pago.metodoPago`: `efectivo` · `tarjeta` · `transferencia`

## Endpoints

| Método | URL | Éxito | Descripción |
|--------|-----|-------|-------------|
| GET | `/pagos` | 200 | Listar pagos; con `?reservaId=` incluye saldo |
| GET | `/pagos/estadisticas` | 200 | Totales del mes por método de pago |
| GET | `/pagos/:id` | 200 | Obtener un pago |
| POST | `/pagos` | 201 | Registrar un pago |

> El orden de declaración importa: `/pagos/estadisticas` se define **antes** de `/pagos/:id` para
> que `estadisticas` no se interprete como un `:id`.

---

### `GET /pagos`  (lista general o pagos+saldo de una reserva)

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant P as PagosController
    participant S as PagosService
    participant DB as PostgreSQL
    participant T as api-turnos

    Cliente->>GW: GET /pagos?reservaId=&tipoPago=&metodoPago=&limite=
    GW->>P: findAll(query)
    alt viene reservaId
        P->>S: findByReserva(reservaId)
        S->>DB: SELECT pagos WHERE reserva_id
        S->>T: GET /reservas/:id  (para precioTotal)
        Note over S: si api-turnos falla, saldo = null
        S-->>Cliente: 200 {pagos, totalPagado, saldoPendiente}
    else listado general
        P->>S: findAll(filtros)
        S->>DB: SELECT pagos (filtros)
        S-->>Cliente: 200 pagos[]
    end
```

### `GET /pagos/estadisticas`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant P as PagosController
    participant S as PagosService
    participant DB as PostgreSQL

    Cliente->>GW: GET /pagos/estadisticas
    GW->>P: getEstadisticas()
    P->>S: getEstadisticas()
    S->>DB: SELECT SUM/COUNT GROUP BY metodo_pago (mes actual)
    S-->>Cliente: 200 {mes, totalMes, porMetodo[]}
```

### `GET /pagos/:id`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant P as PagosController
    participant S as PagosService
    participant DB as PostgreSQL

    Cliente->>GW: GET /pagos/:id
    GW->>P: findOne(id)
    P->>S: findOne(id)
    S->>DB: SELECT pago WHERE id
    alt no existe
        S-->>Cliente: 404 Not Found
    else
        S-->>Cliente: 200 pago
    end
```

### `POST /pagos`  (registra el pago y confirma la reserva si cubre la seña)

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant P as PagosController
    participant S as PagosService
    participant DB as PostgreSQL
    participant T as api-turnos

    Cliente->>GW: POST /pagos (CreatePagoDto)
    GW->>P: create(dto)
    P->>S: create(dto)

    S->>T: GET /reservas/:reservaId
    alt reserva no existe
        T-->>Cliente: 404 Not Found
    else api-turnos no responde
        S-->>Cliente: 503 Service Unavailable
    else reserva válida
        alt reserva cancelada
            S-->>Cliente: 400 No se puede pagar una reserva cancelada
        else
            S->>DB: INSERT pago
            S->>DB: SUM(monto) de pagos de la reserva
            opt totalPagado ≥ senaRequerida y reserva pendiente
                S->>T: PATCH /reservas/:id {estado:'confirmada'}
            end
            S-->>Cliente: 201 pago
        end
    end
```

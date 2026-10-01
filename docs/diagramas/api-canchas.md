# api-canchas :3002

Microservicio de **gestión de canchas**.

- Base de datos: tabla `canchas`.
- Dependencia saliente: `api-turnos` (verificar reservas activas antes de inactivar/eliminar una cancha).
- Variables de entorno: `PORT`, `DATABASE_URL`, `TURNOS_URL`, `INTERNAL_SECRET`.
- Seguridad: `InternalAuthGuard` global → **403** si la request no trae `x-internal-secret` (no pasó
  por el gateway). Exentos: `OPTIONS` y `GET /health` (health check de Render → `{ status: 'ok' }`).

## Entidad

```mermaid
classDiagram
    class Cancha {
        +int id
        +string nombre
        +int capacidad
        +decimal precioPorHora
        +text descripcion
        +string estado
        +Date createdAt
        +Date updatedAt
    }
```

- `nombre` es único; `capacidad` por defecto 22.
- `Cancha.estado`: `disponible` · `mantenimiento` · `fuera_servicio`

## Endpoints

| Método | URL | Éxito | Descripción |
|--------|-----|-------|-------------|
| GET | `/canchas` | 200 | Listar canchas |
| GET | `/canchas/:id` | 200 | Obtener una cancha |
| POST | `/canchas` | 201 | Crear cancha |
| PUT | `/canchas/:id` | 200 | Actualizar datos |
| PATCH | `/canchas/:id` | 200 | Actualizar estado (409 al inactivar con reservas activas) |
| DELETE | `/canchas/:id` | 204 | Eliminar cancha (409 si tiene reservas activas) |

> **Nota REST — público:** `GET /canchas` es la única ruta de catálogo accesible **sin token** (el
> gateway la trata como pública); el resto exige `Authorization: Bearer`.

---

### `GET /canchas`  ·  `GET /canchas/:id`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as CanchasController
    participant S as CanchasService
    participant DB as PostgreSQL

    Cliente->>GW: GET /canchas  (o /canchas/:id)
    GW->>C: findAll() / findOne(id)
    C->>S: findAll | findOne
    S->>DB: SELECT canchas
    alt findOne y no existe
        S-->>Cliente: 404 Not Found
    else
        S-->>Cliente: 200 canchas[] | cancha
    end
```

### `POST /canchas`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as CanchasController
    participant S as CanchasService
    participant DB as PostgreSQL

    Cliente->>GW: POST /canchas (CreateCanchaDto)
    GW->>C: create(dto)
    C->>S: create(dto)
    S->>DB: INSERT canchas
    alt nombre duplicado
        S-->>Cliente: 409 Conflict
    else
        S-->>Cliente: 201 cancha
    end
```

### `PUT /canchas/:id`

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as CanchasController
    participant S as CanchasService
    participant DB as PostgreSQL

    Cliente->>GW: PUT /canchas/:id (UpdateCanchaDto)
    GW->>C: update(id, dto)
    C->>S: update(id, dto)
    S->>DB: SELECT cancha
    alt no existe
        S-->>Cliente: 404 Not Found
    else existe
        S->>DB: UPDATE canchas
        S-->>Cliente: 200 cancha actualizada
    end
```

### `PATCH /canchas/:id`  (actualizar estado)

Pasar una cancha a un estado **inactivo** (`mantenimiento` / `fuera_servicio`) no debe abandonar
reservas activas a futuro: se consulta a api-turnos (dueño de las reservas) y se rechaza con **409**
si las hay. El paso a `disponible` no requiere esa verificación.

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as CanchasController
    participant S as CanchasService
    participant DB as PostgreSQL
    participant T as api-turnos :3003

    Cliente->>GW: PATCH /canchas/:id {estado}
    GW->>C: updateEstado(id, UpdateEstadoCanchaDto)
    C->>S: updateEstado(id, dto)
    S->>DB: SELECT cancha
    alt no existe
        S-->>Cliente: 404 Not Found
    else estado inactivo (mantenimiento / fuera_servicio)
        S->>T: GET /reservas?canchaId=&desde=<hoy>
        alt api-turnos no responde
            S-->>Cliente: 503 Service Unavailable
        else hay reservas pendientes/confirmadas a futuro
            S-->>Cliente: 409 Conflict
        else sin reservas activas
            S->>DB: UPDATE canchas SET estado
            S-->>Cliente: 200 cancha actualizada
        end
    else estado = disponible
        S->>DB: UPDATE canchas SET estado
        S-->>Cliente: 200 cancha actualizada
    end
```

### `DELETE /canchas/:id`

Misma verificación que el `PATCH` a estado inactivo: no se borra una cancha con reservas activas a
futuro (rechazo **409**).

```mermaid
sequenceDiagram
    actor Cliente
    participant GW as Gateway
    participant C as CanchasController
    participant S as CanchasService
    participant DB as PostgreSQL
    participant T as api-turnos :3003

    Cliente->>GW: DELETE /canchas/:id
    GW->>C: remove(id)
    C->>S: remove(id)
    S->>DB: SELECT cancha
    alt no existe
        S-->>Cliente: 404 Not Found
    else existe
        S->>T: GET /reservas?canchaId=&desde=<hoy>
        alt api-turnos no responde
            S-->>Cliente: 503 Service Unavailable
        else hay reservas pendientes/confirmadas a futuro
            S-->>Cliente: 409 Conflict
        else sin reservas activas
            S->>DB: DELETE canchas
            S-->>Cliente: 204 No Content
        end
    end
```

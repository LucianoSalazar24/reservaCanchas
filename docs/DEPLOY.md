# Guía de despliegue — VPS (Oracle Cloud) + Vercel

Sistema de Reservas de Canchas. Arquitectura:

```
Frontend (Vercel)  →  Gateway (VPS)  →  api-usuarios / api-canchas / api-turnos / api-pagos (VPS)
                                                          ↓
                                              PostgreSQL (contenedor propio, mismo VPS)
```

> Gateway, los 4 microservicios y PostgreSQL corren **todos en el mismo VPS**, con el
> `docker-compose.yml` de la raíz del repo (un único `git clone` + `docker compose up -d --build`).
> El VPS es **compartido por el equipo** (no uno por integrante); solo el frontend va aparte, a Vercel.

---

## 1. Desarrollo local

El `docker-compose.yml` incluye un servicio `postgres` propio (con volumen persistente), así que no
hace falta ninguna base de datos externa para levantar la stack completa:

```bash
cp .env.template .env      # completar JWT_SECRET / INTERNAL_SECRET; DATABASE_URL ya apunta a "postgres"
docker compose up -d --build
```

> `GEMINI_API_KEY` en ese mismo `.env` es opcional: sin ella, el recomendador de canchas
> (`GET /canchas/recomendadas`) y el resumen de tendencia de reservas (`GET /reservas/insights`)
> siguen funcionando, solo sin la parte generada por IA. Se genera gratis en
> [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

En el primer arranque, el contenedor `postgres` carga automáticamente `database/schema.sql` +
`database/seed.sql` (incluye el usuario admin de prueba `admin@canchas.com` / `Admin123`). Los
microservicios esperan a que `postgres` esté `healthy` antes de arrancar.

- Frontend: http://localhost:5173
- Gateway: http://localhost:3000
- Health check de cada microservicio: `GET /health` en su puerto (3001–3005)

Si preferís correr los servicios sin contenedor (`npm run start:dev`), levantá igual el contenedor
`postgres` del compose (`docker compose up -d postgres`) y copiá el `.env.template` de cada servicio
apuntando a `postgresql://canchas_user:canchas_pass@localhost:5432/canchas_db`.

---

## 2. VPS — Oracle Cloud (Always Free, Ampere A1)

> Uno del equipo provisiona el VPS una sola vez; todos comparten sus credenciales de acceso (o cada
> quien con su propia clave SSH agregada a la instancia).

1. Crear la instancia en OCI eligiendo el shape **Ampere A1 (Always Free)** — no el AMD micro — para
   tener margen de RAM/CPU corriendo los 5 servicios + Postgres en simultáneo.
2. Imagen: **Ubuntu 24.04 LTS**.
3. Asignarle una **Reserved Public IP** (no la efímera por defecto), para que la IP no cambie si se
   reinicia la instancia. Esa IP es la que va a usar el frontend para hablarle al gateway.
4. Abrir en la lista de seguridad / *Security List* de la VCN los puertos necesarios: `22` (SSH) y
   `3000` (gateway). Los puertos `3001`–`3005` y `5432` **no** deberían quedar expuestos a internet
   (el docker-compose ya los publica solo dentro de la red del host; si se quiere restringir más,
   sacarles el mapeo de puertos en el compose y dejar que se comuniquen solo por `canchas_net`).
5. En la instancia:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
   sudo usermod -aG docker $USER   # relogear para que tome efecto
   git clone <url-del-repo>
   cd pp2-workspace
   cp .env.template .env           # completar JWT_SECRET / INTERNAL_SECRET (compartidos por el equipo)
   docker compose up -d --build
   ```
6. Verificar: `curl http://<ip-reservada>:3000/auth/login ...` o los `/health` de cada servicio.

> **HTTPS / dominio:** queda pendiente de definir. La IP reservada sola alcanza para `http://`, pero
> el navegador puede bloquear que el frontend en Vercel (HTTPS) llame a un backend en `http://`
> (mixed content) según el caso. Cuando se resuelva, la opción más simple es un dominio gratuito
> (ej. DuckDNS) apuntando a la IP reservada + un reverse proxy con TLS automático (ej. Caddy) delante
> del gateway.

---

## 3. Frontend — Vercel

1. En https://vercel.com → **Add New → Project** → importar el repo del frontend. Framework: **Vite**
   (lo detecta solo).
2. **Environment Variables** → `VITE_API_URL` = URL pública del gateway en el VPS (la IP reservada +
   `:3000`, o el dominio con HTTPS una vez configurado el punto anterior).
   > Se embebe en el bundle en build; si cambia la URL del gateway, hay que **redeploy**.
3. **Deploy**. Probar la URL de Vercel.

---

## 4. Prueba end-to-end

1. Abrir el front (Vercel) → **registrarse** o **login** (admin de prueba:
   `admin@canchas.com` / `Admin123`).
2. Crear una **reserva** (ejercita api-turnos → api-usuarios + api-canchas).
3. Registrar un **pago** que cubra la seña → la reserva pasa a `confirmada` (api-pagos → api-turnos).

---

## 5. Notas

- `synchronize: false` en todos los servicios: el esquema **no** se crea solo, lo define
  `database/schema.sql`. Si cambian entidades, actualizar también ese script (y, si el VPS ya tiene
  datos cargados, aplicar el cambio a mano con `psql` en vez de recrear el volumen).
- El volumen `canchas_pgdata` persiste los datos de Postgres entre `docker compose up`/`down`; solo se
  pierde con `docker compose down -v` o borrando el volumen a mano.
- Para actualizar el VPS con cambios nuevos: `git pull && docker compose up -d --build`.
- **Migración de columnas nuevas en una BD ya creada** (`canchas.zona` y `canchas.email_contacto`; el
  volumen no recarga `schema.sql`): `docker compose exec postgres psql -U canchas_user -d canchas_db -c
  "ALTER TABLE canchas ADD COLUMN IF NOT EXISTS zona VARCHAR(60); ALTER TABLE canchas ADD COLUMN IF NOT EXISTS email_contacto VARCHAR(120);"`
  (y los `UPDATE ... SET zona` del final de `database/seed.sql`).
- **Mails (api-notificaciones):** completar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `MAIL_FROM`
  en el `.env` raíz con un SMTP gratuito (Gmail con contraseña de aplicación, o Brevo; ver `.env.template`)
  y poner `FRONTEND_URL` con la URL pública de Vercel. Sin `SMTP_HOST` el servicio no envía nada (solo loguea).
  Cada cancha necesita su *Email de contacto* (panel admin → Canchas) para recibir el aviso.

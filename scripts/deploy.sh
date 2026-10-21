#!/usr/bin/env bash
# Despliegue en el VPS. Lo ejecuta GitHub Actions por SSH mandando este archivo por stdin:
#
#   ssh usuario@vps "APP_DIR=... DEPLOY_SERVICES='...' bash -s -- <sha>" < scripts/deploy.sh
#
# (por stdin, y no desde el repo del VPS, para que `git merge` no reemplace el script mientras corre).
# También se puede correr a mano: `bash scripts/deploy.sh $(git rev-parse origin/master)`.
#
# Pasos: 1) árbol limpio  2) git ff al commit  3) migraciones  4) build + up  5) healthcheck
#        6) si falla: rollback al commit anterior.
#
# Variables opcionales:
#   APP_DIR           carpeta del repo en el VPS (default: $HOME/reservaCanchas)
#   DEPLOY_SERVICES   servicios a (re)construir (default: todos menos frontend, que va a Vercel)
#   SKIP_MIGRATIONS=1 no aplicar database/migrations
#   DEPLOY_SKIP_GIT=1 no tocar git (para probar el resto del flujo sobre lo que ya está en disco)

set -euo pipefail

SHA="${1:?Falta el SHA del commit a desplegar}"
APP_DIR="${APP_DIR:-$HOME/reservaCanchas}"
SERVICES="${DEPLOY_SERVICES:-api-usuarios api-canchas api-turnos api-pagos api-notificaciones gateway}"

# Los valores llegan de variables de GitHub: se validan antes de usarlos en comandos.
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "ERROR: SHA inválido"; exit 1; }
[[ "$SERVICES" =~ ^[A-Za-z0-9_\ -]+$ ]] || { echo "ERROR: DEPLOY_SERVICES inválido"; exit 1; }

log() { printf '\n==> %s\n' "$*"; }

cd "$APP_DIR"

# --- 1) Árbol limpio -------------------------------------------------------------------------
# Si alguien editó archivos a mano en el VPS (ej. el compose) NO se pisan: se corta y se avisa.
if [ "${DEPLOY_SKIP_GIT:-0}" != 1 ] && [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "ERROR: hay cambios locales sin commitear en el VPS; no despliego para no pisarlos:"
  git status --short --untracked-files=no
  echo "Commitealos desde tu máquina o descartalos en el VPS (git checkout -- <archivo>) y reintentá."
  exit 1
fi

PREV="$(git rev-parse HEAD)"

# --- 2) Código ---------------------------------------------------------------------------------
if [ "${DEPLOY_SKIP_GIT:-0}" != 1 ]; then
  log "Actualizando código: ${PREV:0:7} -> ${SHA:0:7}"
  git fetch --quiet origin
  git checkout --quiet master
  # --ff-only: si el historial se reescribió (force-push) falla en vez de mezclar cosas.
  git merge --ff-only --quiet "$SHA"
fi

# --- 3) Migraciones ----------------------------------------------------------------------------
# Corren ANTES del up: son aditivas, así que el código viejo sigue funcionando si algo falla después.
psql_pg() { docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -q -t -A "$@"' sh "$@"; }

migrar() {
  if [ "${SKIP_MIGRATIONS:-0}" = 1 ]; then
    log "Migraciones omitidas (SKIP_MIGRATIONS=1)"; return 0
  fi
  if ! docker compose ps --status running --services 2>/dev/null | grep -qx postgres; then
    log "AVISO: no hay contenedor 'postgres' corriendo (¿BD externa?). Migraciones NO aplicadas:"
    echo "      aplicá a mano database/migrations/*.sql en tu base antes de que el código nuevo las necesite."
    return 0
  fi

  log "Migraciones de base de datos"
  echo "CREATE TABLE IF NOT EXISTS schema_migrations (nombre TEXT PRIMARY KEY, aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now());" | psql_pg >/dev/null
  local aplicadas; aplicadas="$(echo "SELECT nombre FROM schema_migrations;" | psql_pg)"

  local f nombre
  for f in database/migrations/*.sql; do
    [ -e "$f" ] || continue
    nombre="$(basename "$f")"
    [[ "$nombre" =~ ^[A-Za-z0-9_.-]+$ ]] || { echo "ERROR: nombre de migración inválido: $nombre"; return 1; }
    if grep -qxF "$nombre" <<<"$aplicadas"; then
      echo "  ya aplicada: $nombre"; continue
    fi
    echo "  aplicando:   $nombre"
    # La migración y su registro van en UNA transacción (-1): o se aplican las dos o ninguna.
    { cat "$f"; printf "\nINSERT INTO schema_migrations (nombre) VALUES ('%s');\n" "$nombre"; } | psql_pg -1 >/dev/null
  done
}

# --- 4 y 5) Build, levantar y verificar ---------------------------------------------------------
# $SERVICES sin comillas a propósito: es una lista de nombres separados por espacio.
levantar() {
  log "Construyendo y levantando: $SERVICES"
  # shellcheck disable=SC2086
  docker compose up -d --build $SERVICES
}

# Chequea cada servicio DESDE ADENTRO de su contenedor (no depende de qué puertos publique el compose).
# Se usa 127.0.0.1 y no "localhost": en Alpine localhost resuelve a IPv6 y Nest escucha solo en IPv4.
servicio_sano() {
  case "$1" in
    api-usuarios)       docker compose exec -T api-usuarios       wget -q -O /dev/null http://127.0.0.1:3001/health ;;
    api-canchas)        docker compose exec -T api-canchas        wget -q -O /dev/null http://127.0.0.1:3002/health ;;
    api-turnos)         docker compose exec -T api-turnos         wget -q -O /dev/null http://127.0.0.1:3003/health ;;
    api-pagos)          docker compose exec -T api-pagos          wget -q -O /dev/null http://127.0.0.1:3004/health ;;
    api-notificaciones) docker compose exec -T api-notificaciones wget -q -O /dev/null http://127.0.0.1:3005/health ;;
    gateway)            docker compose exec -T gateway            wget -q -O /dev/null http://127.0.0.1:3000/canchas ;; # ruta pública
    frontend)           docker compose exec -T frontend           wget -q -O /dev/null http://127.0.0.1:80/ ;;
    *) return 0 ;; # servicio sin chequeo conocido
  esac
}

esperar_salud() {
  log "Verificando servicios (hasta ~2 minutos)"
  local intento s pendientes
  for intento in $(seq 1 30); do
    pendientes=""
    for s in $SERVICES; do servicio_sano "$s" >/dev/null 2>&1 || pendientes="$pendientes $s"; done
    if [ -z "$pendientes" ]; then echo "  todos responden"; return 0; fi
    echo "  intento $intento/30, esperando:$pendientes"
    sleep 4
  done
  return 1
}

# El frontend incrusta VITE_API_URL en el bundle al construirse: si quedó en localhost (falta en el .env),
# la web desplegada le pegaría a la máquina de cada usuario. Se corta ANTES de construir nada.
if [[ " $SERVICES " == *" frontend "* ]] && docker compose config 2>/dev/null | grep -qE 'VITE_API_URL: "?http://(localhost|127\.0\.0\.1)'; then
  echo "ERROR: se pidió desplegar 'frontend' pero VITE_API_URL apunta a localhost."
  echo "Agregá VITE_API_URL=http://<ip-o-dominio>:3000 al .env del VPS y reintentá."
  exit 1
fi

migrar
levantar

if ! esperar_salud; then
  log "FALLÓ la verificación. Logs recientes:"
  # shellcheck disable=SC2086
  docker compose logs --tail=40 $SERVICES || true

  if [ "${DEPLOY_SKIP_GIT:-0}" != 1 ] && [ "$PREV" != "$(git rev-parse HEAD)" ]; then
    log "Rollback al commit anterior ${PREV:0:7} (las migraciones NO se revierten: son aditivas)"
    git reset --hard --quiet "$PREV"
    levantar
    if esperar_salud; then echo "Rollback OK: el VPS volvió a la versión anterior."; else echo "ATENCIÓN: el rollback también falló. Revisar el VPS a mano."; fi
  fi
  exit 1
fi

# Imágenes viejas sin etiqueta (quedan en cada build); en el VPS el disco es limitado.
docker image prune -f >/dev/null 2>&1 || true

log "Despliegue OK: ${SHA:0:7}"
docker compose ps

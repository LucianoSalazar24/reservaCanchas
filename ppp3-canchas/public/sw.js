// Service worker de la PWA. Hace dos cosas, y nada más:
//   1. Que la app abra aunque no haya conexión (muestra la última versión guardada).
//   2. Guardar los archivos estáticos con hash (/assets/*) para que cargue rápido.
// NUNCA intercepta la API: canchas, reservas y pagos siempre van a la red (datos frescos).
// Si se cambia este archivo, subir VERSION para descartar la caché vieja.
const VERSION = 'v1';
const CACHE = `futbolreservas-${VERSION}`;
const ARCHIVOS_BASE = ['/', '/manifest.webmanifest', '/icon.svg', '/pwa-192.png', '/pwa-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS_BASE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

function guardar(request, response) {
  if (response.ok && response.type === 'basic') {
    const copia = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copia));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // La API (gateway) está en otro origen: no se toca.
  if (url.origin !== self.location.origin) return;

  // Páginas: red primero (siempre la última versión de la app); sin conexión, la copia guardada.
  // Todas las rutas de la SPA devuelven el mismo index.html, por eso se guarda bajo "/".
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => guardar('/', response))
        .catch(() => caches.match('/').then((r) => r || Response.error())),
    );
    return;
  }

  // Archivos con hash en el nombre: no cambian nunca, caché primero.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((enCache) => enCache || fetch(request).then((r) => guardar(request, r))),
    );
  }
  // Cualquier otra cosa (incluida la API si algún día se sirve en el mismo origen): red normal.
});

// Instalación como app (PWA): registro del service worker y aviso de instalación.

// Evento que Chrome/Edge/Android disparan cuando la app se puede instalar (no está tipado en TS).
type EventoInstalacion = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let eventoPendiente: EventoInstalacion | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

/** Se llama una vez al arrancar, antes de montar React: el evento puede llegar muy temprano. */
export function iniciarPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // se muestra nuestro propio aviso en vez del mini-banner del navegador
    eventoPendiente = e as EventoInstalacion;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    eventoPendiente = null;
    avisar();
  });

  // Solo en producción (en dev interfiere con la recarga en caliente de Vite). El navegador además
  // solo lo permite en HTTPS o localhost: por HTTP plano `serviceWorker` no existe y no pasa nada.
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    });
  }
}

export function suscribirInstalacion(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

export const puedeInstalar = () => eventoPendiente !== null;

/** Abre el diálogo nativo de instalación. Devuelve true si el usuario aceptó. */
export async function instalar(): Promise<boolean> {
  if (!eventoPendiente) return false;
  const evento = eventoPendiente;
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  eventoPendiente = null; // el evento se usa una sola vez
  avisar();
  return outcome === 'accepted';
}

export function estaInstalada(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iPhone/iPad en Safari: no hay diálogo de instalación, se hace desde "Compartir". */
export function esIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

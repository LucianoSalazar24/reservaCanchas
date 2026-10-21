import { EventoReservaDto } from './dto/evento-reserva.dto';

export interface Correo {
  asunto: string;
  html: string;
  texto: string;
}

// Todo lo que viene del usuario (nombres, razón de cancelación) se escapa antes de ir al HTML.
const escapar = (s: string | null | undefined): string =>
  (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const hora = (h: string) => h.slice(0, 5);

function fechaLarga(fecha: string): string {
  const d = new Date(`${fecha}T00:00:00`);
  const texto = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const dinero = (n: number) => `$ ${Math.round(n).toLocaleString('es-AR')}`;

const TITULOS = {
  cliente: {
    creada: { asunto: 'Recibimos tu reserva', titulo: '¡Reserva recibida!', detalle: 'Para confirmarla falta pagar la seña.' },
    confirmada: { asunto: 'Tu reserva está confirmada', titulo: '¡Reserva confirmada!', detalle: 'Recibimos tu seña. ¡Te esperamos en la cancha!' },
    cancelada: { asunto: 'Tu reserva fue cancelada', titulo: 'Reserva cancelada', detalle: 'Tu reserva fue cancelada y el horario quedó liberado.' },
  },
  cancha: {
    creada: { asunto: 'Nueva reserva (pendiente de seña)', titulo: 'Nueva reserva', detalle: 'Un cliente reservó tu cancha. Queda pendiente hasta que pague la seña.' },
    confirmada: { asunto: 'Reserva confirmada', titulo: 'Reserva confirmada', detalle: 'El cliente pagó la seña: el turno está confirmado.' },
    cancelada: { asunto: 'Reserva cancelada', titulo: 'Reserva cancelada', detalle: 'Se canceló un turno. El horario quedó libre.' },
  },
} as const;

export function armarCorreo(para: 'cliente' | 'cancha', data: EventoReservaDto, frontendUrl?: string): Correo {
  const { evento, reserva, cancha, cliente } = data;
  const t = TITULOS[para][evento];
  const nombreCliente = [cliente.nombre, cliente.apellido].filter(Boolean).join(' ');

  const filas: [string, string][] = [
    ['Cancha', cancha.nombre + (cancha.zona ? ` (${cancha.zona})` : '')],
    ['Fecha', fechaLarga(reserva.fecha)],
    ['Horario', `${hora(reserva.horaInicio)} a ${hora(reserva.horaFin)}`],
    ['Total', dinero(reserva.precioTotal)],
  ];
  if (evento !== 'cancelada') filas.push(['Seña', dinero(reserva.senaRequerida)]);
  if (para === 'cancha') {
    filas.push(['Cliente', nombreCliente]);
    if (cliente.telefono) filas.push(['Teléfono', cliente.telefono]);
    if (cliente.email) filas.push(['Email', cliente.email]);
  }
  if (evento === 'cancelada' && reserva.razonCancelacion) filas.push(['Motivo', reserva.razonCancelacion]);
  filas.push(['Reserva', `#${reserva.id}`]);

  const saludo = para === 'cliente' ? `Hola ${cliente.nombre},` : `Hola, equipo de ${cancha.nombre}:`;
  const enlace =
    para === 'cliente' && frontendUrl
      ? `<p style="margin:24px 0 0"><a href="${escapar(frontendUrl)}/mis-reservas" style="background:#047857;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Ver mis reservas</a></p>`
      : '';

  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<div style="max-width:520px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
  <div style="background:#047857;color:#fff;padding:18px 24px;font-size:20px;font-weight:700">${escapar(t.titulo)}</div>
  <div style="padding:24px">
    <p style="margin:0 0 8px">${escapar(saludo)}</p>
    <p style="margin:0 0 20px;color:#334155">${escapar(t.detalle)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${filas.map(([k, v]) => `<tr><td style="padding:8px 0;color:#64748b;width:110px;border-top:1px solid #e2e8f0">${escapar(k)}</td><td style="padding:8px 0;font-weight:600;border-top:1px solid #e2e8f0">${escapar(v)}</td></tr>`).join('')}
    </table>
    ${enlace}
  </div>
  <div style="padding:14px 24px;background:#f8fafc;color:#94a3b8;font-size:12px">ReservaCanchas · Este es un aviso automático, no respondas a este mail.</div>
</div></body></html>`;

  const texto = [saludo, '', t.detalle, '', ...filas.map(([k, v]) => `${k}: ${v}`)].join('\n');

  return { asunto: `${t.asunto} · ${cancha.nombre}`, html, texto };
}

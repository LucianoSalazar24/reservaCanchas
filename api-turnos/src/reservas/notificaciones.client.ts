import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Reserva } from './entities/reserva.entity';

export type EventoReserva = 'creada' | 'confirmada' | 'cancelada';

/**
 * Avisa a api-notificaciones que pasó algo con una reserva (el servicio manda los mails al
 * cliente y a la cancha). Es "dispará y olvidá": la reserva ya está guardada y un fallo del
 * mail NUNCA debe hacer fallar ni demorar la respuesta al usuario, así que no se espera el
 * resultado y cualquier error solo se loguea.
 */
@Injectable()
export class NotificacionesClient {
  private readonly logger = new Logger(NotificacionesClient.name);
  private readonly notificacionesUrl = process.env.NOTIFICACIONES_URL;
  private readonly usuariosUrl = process.env.USUARIOS_URL ?? 'http://localhost:3001';
  private readonly canchasUrl = process.env.CANCHAS_URL ?? 'http://localhost:3002';

  constructor(private readonly httpService: HttpService) {}

  notificar(evento: EventoReserva, reserva: Reserva): void {
    if (!this.notificacionesUrl) return; // sin NOTIFICACIONES_URL la función queda apagada
    this.enviar(evento, reserva).catch((error) =>
      this.logger.warn(`No se pudo notificar "${evento}" de la reserva ${reserva.id}: ${(error as Error).message}`),
    );
  }

  private async enviar(evento: EventoReserva, reserva: Reserva): Promise<void> {
    // Los datos del cliente y de la cancha los tienen sus dueños: se consultan al momento.
    const [cancha, cliente] = await Promise.all([
      firstValueFrom(this.httpService.get(`${this.canchasUrl}/canchas/${reserva.canchaId}`)).then((r) => r.data),
      firstValueFrom(this.httpService.get(`${this.usuariosUrl}/clientes/${reserva.clienteId}`)).then((r) => r.data),
    ]);

    await firstValueFrom(
      this.httpService.post(
        `${this.notificacionesUrl}/notificaciones/reservas`,
        {
          evento,
          reserva: {
            id: reserva.id,
            fecha: reserva.fecha,
            horaInicio: reserva.horaInicio,
            horaFin: reserva.horaFin,
            precioTotal: Number(reserva.precioTotal),
            senaRequerida: Number(reserva.senaRequerida),
            razonCancelacion: reserva.razonCancelacion ?? undefined,
          },
          cancha: {
            nombre: cancha.nombre,
            descripcion: cancha.descripcion ?? undefined,
            zona: cancha.zona ?? undefined,
            emailContacto: cancha.emailContacto ?? undefined,
          },
          cliente: {
            nombre: cliente.nombre,
            apellido: cliente.apellido ?? undefined,
            email: cliente.email ?? undefined,
            telefono: cliente.telefono ?? undefined,
          },
        },
        { timeout: 30000 },
      ),
    );
  }
}

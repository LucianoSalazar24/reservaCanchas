import { Injectable } from '@nestjs/common';
import { EventoReservaDto } from './dto/evento-reserva.dto';
import { MailService, ResultadoEnvio } from './mail.service';
import { armarCorreo } from './plantillas';

@Injectable()
export class NotificacionesService {
  constructor(private readonly mail: MailService) {}

  /** Avisa por mail al cliente y a la cancha. Un fallo con uno no afecta al otro. */
  async notificarReserva(data: EventoReservaDto): Promise<{ cliente: ResultadoEnvio; cancha: ResultadoEnvio }> {
    const frontendUrl = process.env.FRONTEND_URL;
    const [cliente, cancha] = await Promise.all([
      this.mail.enviar(data.cliente.email, armarCorreo('cliente', data, frontendUrl)),
      this.mail.enviar(data.cancha.emailContacto, armarCorreo('cancha', data)),
    ]);
    return { cliente, cancha };
  }
}

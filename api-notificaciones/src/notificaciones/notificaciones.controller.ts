import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { EventoReservaDto } from './dto/evento-reserva.dto';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificaciones: NotificacionesService) {}

  // 202 porque es un aviso, no una entidad persistida; el cuerpo informa qué pasó con
  // cada destinatario.
  @Post('reservas')
  @HttpCode(HttpStatus.ACCEPTED)
  notificarReserva(@Body() dto: EventoReservaDto) {
    return this.notificaciones.notificarReserva(dto);
  }
}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { HealthController } from './health/health.controller';
import { InternalAuthGuard } from './common/internal-auth.guard';

// Sin base de datos: este servicio solo recibe eventos de api-turnos y manda mails.
// No se expone por el gateway (no hay ruta pública): solo lo llaman los microservicios.
@Module({
  imports: [NotificacionesModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}

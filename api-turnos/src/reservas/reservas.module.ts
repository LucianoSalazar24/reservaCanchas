import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { GeminiService } from './gemini.service';
import { Reserva } from './entities/reserva.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva]),
    // Header por defecto en cada llamada saliente: autentica este microservicio ante
    // los demás (que validan INTERNAL_SECRET con su InternalAuthGuard).
    HttpModule.register({ headers: { 'x-internal-secret': process.env.INTERNAL_SECRET ?? '' } }),
  ],
  controllers: [ReservasController],
  // GeminiService no usa el HttpService de arriba (llama a Gemini con fetch directo)
  // para no mandarle el x-internal-secret, que es solo para nuestros microservicios.
  providers: [ReservasService, GeminiService],
  exports: [ReservasService],
})
export class ReservasModule {}

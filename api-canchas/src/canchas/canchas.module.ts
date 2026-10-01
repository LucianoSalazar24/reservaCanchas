import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CanchasController } from './canchas.controller';
import { CanchasService } from './canchas.service';
import { GeminiService } from './gemini.service';
import { Cancha } from './entities/cancha.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cancha]),
    // Header por defecto en cada llamada saliente: autentica este microservicio ante
    // api-turnos (que valida INTERNAL_SECRET con su InternalAuthGuard).
    HttpModule.register({ headers: { 'x-internal-secret': process.env.INTERNAL_SECRET ?? '' } }),
  ],
  controllers: [CanchasController],
  // GeminiService no usa el HttpService de arriba (llama a Gemini con fetch directo)
  // para no mandarle el x-internal-secret, que es solo para nuestros microservicios.
  providers: [CanchasService, GeminiService],
})
export class CanchasModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { Pago } from './entities/pago.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago]),
    // Header por defecto en cada llamada saliente: autentica este microservicio ante
    // los demás (que validan INTERNAL_SECRET con su InternalAuthGuard).
    HttpModule.register({ headers: { 'x-internal-secret': process.env.INTERNAL_SECRET ?? '' } }),
  ],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}

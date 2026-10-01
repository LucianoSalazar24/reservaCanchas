import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente]),
    // Header por defecto en cada llamada saliente: autentica este microservicio ante
    // los demás (que validan INTERNAL_SECRET con su InternalAuthGuard).
    HttpModule.register({ headers: { 'x-internal-secret': process.env.INTERNAL_SECRET ?? '' } }),
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}

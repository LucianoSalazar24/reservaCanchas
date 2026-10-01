import {
  Controller, Get, Post, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { CreatePreferenciaDto } from './dto/create-preferencia.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get()
  findAll(
    @Query('reservaId') reservaId?: string,
    @Query('tipoPago') tipoPago?: string,
    @Query('metodoPago') metodoPago?: string,
    @Query('limite') limite?: string,
  ) {
    // Filtrar por reserva incluye el saldo pendiente de esa reserva.
    if (reservaId) {
      return this.pagosService.findByReserva(+reservaId);
    }
    return this.pagosService.findAll({
      tipoPago,
      metodoPago,
      limite: limite ? +limite : undefined,
    });
  }

  @Get('estadisticas')
  getEstadisticas() {
    return this.pagosService.getEstadisticas();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePagoDto) {
    return this.pagosService.create(dto);
  }

  @Post('preferencias')
  @HttpCode(HttpStatus.CREATED)
  crearPreferencia(@Body() dto: CreatePreferenciaDto) {
    return this.pagosService.crearPreferencia(dto);
  }
}

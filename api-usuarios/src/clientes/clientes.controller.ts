import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto, UpdateEstadoClienteDto } from './dto/update-cliente.dto';
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll(
    @Query('busqueda') busqueda?: string,
    @Query('limite') limite?: number,
    @Query('telefono') telefono?: string, 
  ) {
    if (telefono) {
      return this.clientesService.findByTelefono(telefono);
    }
    return this.clientesService.findAll(busqueda, limite ? +limite : 50);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Get(':id/descuento')
  getDescuento(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.getDescuento(id);
  }

  @Get(':id/estadisticas')
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.getEstadisticas(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Patch(':id')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoClienteDto,
  ) {
    return this.clientesService.updateEstado(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}
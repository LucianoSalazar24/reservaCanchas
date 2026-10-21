import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, ParseIntPipe, HttpCode, HttpStatus, Headers,
} from '@nestjs/common';
import { CanchasService } from './canchas.service';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto, UpdateEstadoCanchaDto } from './dto/update-cancha.dto';
import { ChatCanchasDto } from './dto/chat-canchas.dto';
import { ChatCanchasService } from './chat-canchas.service';

@Controller('canchas')
export class CanchasController {
  constructor(
    private readonly canchasService: CanchasService,
    private readonly chatService: ChatCanchasService,
  ) {}

  @Get()
  findAll() {
    return this.canchasService.findAll();
  }

  @Post('chat')
  chat(
    @Body() dto: ChatCanchasDto,
    @Headers('x-user-rol') rol?: string,
    @Headers('x-cliente-id') clienteId?: string,
  ) {
    // Ruta pública: la identidad solo existe si el gateway verificó un token. Únicamente un
    // cliente (con cliente_id) puede recibir propuestas de reserva.
    return this.chatService.chat(dto, rol === 'cliente' && clienteId ? +clienteId : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.canchasService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCanchaDto) {
    return this.canchasService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCanchaDto) {
    return this.canchasService.update(id, dto);
  }

  @Patch(':id')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoCanchaDto,
  ) {
    return this.canchasService.updateEstado(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.canchasService.remove(id);
  }
}

import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
  InternalServerErrorException, ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cancha } from './entities/cancha.entity';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto, UpdateEstadoCanchaDto } from './dto/update-cancha.dto';

// Estados de cancha que sacan la cancha de operación: requieren que no haya reservas
// activas a futuro. Estados de reserva que "ocupan" la cancha (las demás no cuentan).
const ESTADOS_INACTIVOS = ['mantenimiento', 'fuera_servicio'];
const ESTADOS_RESERVA_ACTIVA = ['pendiente', 'confirmada'];

@Injectable()
export class CanchasService {
  private readonly turnosUrl = process.env.TURNOS_URL ?? 'http://localhost:3003';

  constructor(
    @InjectRepository(Cancha) private canchaRepo: Repository<Cancha>,
    private httpService: HttpService,
  ) {}

  async findAll() {
    return this.canchaRepo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const cancha = await this.canchaRepo.findOne({ where: { id } });
    if (!cancha) throw new NotFoundException(`Cancha ${id} no encontrada`);
    return cancha;
  }

  async create(dto: CreateCanchaDto) {
    try {
      const cancha = this.canchaRepo.create({
        nombre: dto.nombre,
        capacidad: dto.capacidad ?? 22,
        precioPorHora: dto.precioPorHora,
        descripcion: dto.descripcion,
        zona: dto.zona?.trim() || null,
        emailContacto: dto.emailContacto?.trim() || null,
        latitud: dto.latitud,
        longitud: dto.longitud,
      });
      return await this.canchaRepo.save(cancha);
    } catch (error) {
      if (error.code === '23505') throw new ConflictException('Ya existe una cancha con ese nombre');
      throw new InternalServerErrorException('Error al crear la cancha');
    }
  }

  async update(id: number, dto: UpdateCanchaDto) {
    const cancha = await this.findOne(id);
    try {
      if (dto.nombre !== undefined) cancha.nombre = dto.nombre;
      if (dto.capacidad !== undefined) cancha.capacidad = dto.capacidad;
      if (dto.precioPorHora !== undefined) cancha.precioPorHora = dto.precioPorHora;
      if (dto.descripcion !== undefined) cancha.descripcion = dto.descripcion;
      if (dto.zona !== undefined) cancha.zona = dto.zona.trim() || null;
      if (dto.emailContacto !== undefined) cancha.emailContacto = dto.emailContacto.trim() || null;
      if (dto.latitud !== undefined) cancha.latitud = dto.latitud;
      if (dto.longitud !== undefined) cancha.longitud = dto.longitud;
      return await this.canchaRepo.save(cancha);
    } catch (error) {
      if (error.code === '23505') throw new ConflictException('Ya existe una cancha con ese nombre');
      throw new InternalServerErrorException('Error al actualizar la cancha');
    }
  }

  async updateEstado(id: number, dto: UpdateEstadoCanchaDto) {
    const cancha = await this.findOne(id);

    // Sacar la cancha de operación no debe abandonar reservas activas a futuro:
    // se consulta a api-turnos (dueño de las reservas) y se rechaza con 409 si las hay.
    if (ESTADOS_INACTIVOS.includes(dto.estado)) {
      await this.verificarSinReservasActivas(id);
    }

    cancha.estado = dto.estado;
    return this.canchaRepo.save(cancha);
  }

  /** Lanza 409 si la cancha tiene reservas pendientes/confirmadas con fecha >= hoy. */
  private async verificarSinReservasActivas(canchaId: number) {
    const hoy = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en zona local
    let reservas: { estado: string }[];
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.turnosUrl}/reservas`, {
          params: { canchaId, desde: hoy },
        }),
      );
      reservas = data;
    } catch {
      throw new ServiceUnavailableException('No se pudieron verificar las reservas de la cancha');
    }

    const tieneActivas = reservas.some((r) => ESTADOS_RESERVA_ACTIVA.includes(r.estado));
    if (tieneActivas) {
      throw new ConflictException('La cancha tiene reservas activas a futuro');
    }
  }

  // No se permite borrar una cancha con reservas activas a futuro (dueño: api-turnos). Las
  // reservas no tienen FK a canchas (acoplamiento débil), así que la integridad se valida acá.
  async remove(id: number) {
    await this.findOne(id);
    await this.verificarSinReservasActivas(id);
    await this.canchaRepo.delete(id);
  }
}

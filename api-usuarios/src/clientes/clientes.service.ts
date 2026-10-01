import {
  Injectable, NotFoundException, ConflictException, InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto, UpdateEstadoClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  private readonly turnosUrl = process.env.TURNOS_URL ?? 'http://localhost:3003';

  constructor(
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    private dataSource: DataSource,
    private httpService: HttpService,
  ) {}

  async findAll(busqueda?: string, limite = 50) {
    const query = this.clienteRepo.createQueryBuilder('c');

    if (busqueda) {
      query.where(
        'c.nombre ILIKE :b OR c.apellido ILIKE :b OR c.telefono ILIKE :b OR c.email ILIKE :b',
        { b: `%${busqueda}%` },
      );
    }

    return query.take(limite).getMany();
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepo.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  async findByTelefono(telefono: string) {
    const cliente = await this.clienteRepo.findOne({ where: { telefono } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async create(dto: CreateClienteDto) {
    try {
      const cliente = this.clienteRepo.create(dto);
      return await this.clienteRepo.save(cliente);
    } catch (error) {
      if (error.code === '23505') throw new ConflictException('Teléfono o email ya registrado');
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  async update(id: number, dto: UpdateClienteDto) {
    const cliente = await this.findOne(id);
    try {
      Object.assign(cliente, dto);
      return await this.clienteRepo.save(cliente);
    } catch (error) {
      if (error.code === '23505') throw new ConflictException('Teléfono o email ya registrado');
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async updateEstado(id: number, dto: UpdateEstadoClienteDto) {
    const cliente = await this.findOne(id);
    cliente.estado = dto.estado;
    return this.clienteRepo.save(cliente);
  }

  // No se permite borrar un cliente con reservas (dueño: api-turnos). Las reservas no tienen FK a
  // clientes (acoplamiento débil entre microservicios), así que la integridad se valida acá.
  async remove(id: number) {
    await this.findOne(id);

    let reservas: any[];
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.turnosUrl}/reservas`, { params: { clienteId: id } }),
      );
      reservas = Array.isArray(data) ? data : [];
    } catch {
      throw new ServiceUnavailableException(
        'No se pudo verificar las reservas del cliente; intentá más tarde',
      );
    }

    if (reservas.length > 0) {
      throw new ConflictException('No se puede eliminar un cliente con reservas asociadas');
    }

    await this.clienteRepo.delete(id);
  }

  // Estadísticas derivadas de las reservas (dueño: api-turnos). No se almacenan en el cliente.
  async getEstadisticas(id: number) {
    await this.findOne(id);

    let reservas: any[];
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.turnosUrl}/reservas`, { params: { clienteId: id } }),
      );
      reservas = Array.isArray(data) ? data : [];
    } catch {
      throw new ServiceUnavailableException('No se pudieron obtener las estadísticas del cliente');
    }

    const completadas = reservas.filter((r) => r.estado === 'completada');
    const noShows = reservas.filter((r) => r.estado === 'no_show').length;
    const ultimaReserva = completadas
      .map((r) => r.fecha)
      .sort()
      .pop() ?? null;

    return {
      clienteId: id,
      totalReservas: completadas.length,
      noShows,
      ultimaReserva,
    };
  }

  async getDescuento(id: number): Promise<{ descuentoPorcentaje: number }> {
    const rows: any[] = await this.dataSource.query(
      `SELECT COALESCE(tc.descuento_porcentaje, 0) AS descuento
       FROM clientes c
       LEFT JOIN tipos_cliente tc ON c.tipo_cliente_id = tc.id
       WHERE c.id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return { descuentoPorcentaje: +row.descuento };
  }
}

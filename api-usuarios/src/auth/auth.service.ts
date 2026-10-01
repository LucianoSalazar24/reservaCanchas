import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const passwordOk = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Credenciales inválidas');

    const cliente = await this.clienteRepo.findOne({ where: { usuarioId: usuario.id } });

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol, cliente_id: cliente?.id };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: cliente?.nombre,
        apellido: cliente?.apellido,
        telefono: cliente?.telefono,
        cliente_id: cliente?.id,
      },
    };
  }

  async registro(dto: RegisterDto) {
    const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const usuario = this.usuarioRepo.create({ email: dto.email, passwordHash, rol: 'cliente' });
      const usuarioGuardado = await this.usuarioRepo.save(usuario);

      // Lógica que antes hacía el trigger fn_crear_perfil_nuevo_usuario
      const cliente = this.clienteRepo.create({
        usuarioId: usuarioGuardado.id,
        nombre: dto.nombre,
        apellido: dto.apellido,
        telefono: dto.telefono ?? '',
        email: dto.email,
      });
      const clienteGuardado = await this.clienteRepo.save(cliente);

      const payload = { sub: usuarioGuardado.id, email: usuarioGuardado.email, rol: usuarioGuardado.rol, cliente_id: clienteGuardado.id };
      const token = await this.jwtService.signAsync(payload);

      return {
        access_token: token,
        usuario: {
          id: usuarioGuardado.id,
          email: usuarioGuardado.email,
          rol: usuarioGuardado.rol,
          nombre: clienteGuardado.nombre,
          apellido: clienteGuardado.apellido,
          telefono: clienteGuardado.telefono,
          cliente_id: clienteGuardado.id,
        },
      };
    } catch (error) {
      if (error.code === '23505') throw new ConflictException('El teléfono ya está registrado');
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }

  async verificar(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      const usuario = await this.usuarioRepo.findOne({ where: { id: payload.sub } });
      if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

      const cliente = await this.clienteRepo.findOne({ where: { usuarioId: usuario.id } });

      return {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: cliente?.nombre,
        apellido: cliente?.apellido,
        telefono: cliente?.telefono,
        cliente_id: cliente?.id,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}

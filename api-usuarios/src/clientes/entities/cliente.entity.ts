import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, OneToOne,
} from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;

  @OneToOne(() => Usuario, (usuario) => usuario.cliente)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 20, unique: true })
  telefono: string;

  @Column({ length: 150, nullable: true, unique: true })
  email: string;

  @Column({ name: 'tipo_cliente_id', nullable: true, default: 1 })
  tipoClienteId: number;

  // total_reservas, no_shows y ultima_reserva NO se almacenan: son datos derivados
  // de las reservas (dueño: api-turnos). Se obtienen vía GET /clientes/:id/estadisticas.

  @Column({ type: 'enum', enum: ['activo', 'suspendido', 'bloqueado'], default: 'activo' })
  estado: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { numericTransformer } from '../../common/numeric.transformer';

@Entity('canchas')
export class Cancha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ default: 22 })
  capacidad: number;

  @Column({ name: 'precio_por_hora', type: 'decimal', precision: 10, scale: 2, transformer: numericTransformer })
  precioPorHora: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  zona: string | null;

  @Column({ name: 'email_contacto', type: 'varchar', length: 120, nullable: true })
  emailContacto: string | null;

  @Column({
    type: 'enum',
    enum: ['disponible', 'mantenimiento', 'fuera_servicio'],
    default: 'disponible',
  })
  estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: numericTransformer })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: numericTransformer })
  longitud: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

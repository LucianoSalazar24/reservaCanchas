import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { numericTransformer } from '../../common/numeric.transformer';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reserva_id' })
  reservaId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: numericTransformer })
  monto: number;

  @Column({ name: 'tipo_pago', type: 'enum', enum: ['seña', 'saldo', 'completo', 'devolucion'] })
  tipoPago: string;

  @Column({ name: 'metodo_pago', type: 'enum', enum: ['efectivo', 'tarjeta', 'transferencia'] })
  metodoPago: string;

  @CreateDateColumn({ name: 'fecha_pago' })
  fechaPago: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
}

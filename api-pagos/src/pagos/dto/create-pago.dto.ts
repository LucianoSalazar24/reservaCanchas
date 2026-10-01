import { IsInt, IsNumber, IsPositive, IsIn, IsOptional, IsString, Min } from 'class-validator';

export class CreatePagoDto {
  @IsInt()
  @Min(1)
  reservaId: number;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsIn(['seña', 'saldo', 'completo', 'devolucion'])
  tipoPago: string;

  @IsIn(['efectivo', 'tarjeta', 'transferencia'])
  metodoPago: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

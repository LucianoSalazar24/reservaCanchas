import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export const EVENTOS_RESERVA = ['creada', 'confirmada', 'cancelada'] as const;
export type EventoReserva = (typeof EVENTOS_RESERVA)[number];

class ReservaDto {
  @IsInt()
  id: number;

  @IsString()
  fecha: string; // YYYY-MM-DD

  @IsString()
  horaInicio: string; // HH:mm[:ss]

  @IsString()
  horaFin: string;

  @IsNumber()
  precioTotal: number;

  @IsNumber()
  senaRequerida: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  razonCancelacion?: string | null;
}

class CanchaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsOptional()
  @IsString()
  zona?: string | null;

  // Sin @IsEmail a propósito: un mail vacío o inválido no debe frenar el aviso al cliente.
  // El servicio de mail decide si hay un destinatario válido.
  @IsOptional()
  @IsString()
  emailContacto?: string | null;
}

class ClienteDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  apellido?: string | null;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsString()
  telefono?: string | null;
}

export class EventoReservaDto {
  @IsIn(EVENTOS_RESERVA)
  evento: EventoReserva;

  @ValidateNested()
  @Type(() => ReservaDto)
  reserva: ReservaDto;

  @ValidateNested()
  @Type(() => CanchaDto)
  cancha: CanchaDto;

  @ValidateNested()
  @Type(() => ClienteDto)
  cliente: ClienteDto;
}

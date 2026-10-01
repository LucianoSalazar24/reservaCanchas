import { IsString, IsEmail, IsOptional, MaxLength, IsInt, Min, IsIn } from 'class-validator';

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  tipoClienteId?: number;
}

export class UpdateEstadoClienteDto {
  @IsIn(['activo', 'suspendido', 'bloqueado'])
  estado: string;
}

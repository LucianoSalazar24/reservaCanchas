import { IsEmail, ValidateIf, IsString, IsNumber, IsOptional, MaxLength, Min, IsPositive, IsIn, IsLatitude, IsLongitude } from 'class-validator';

export class UpdateCanchaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacidad?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  precioPorHora?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  zona?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '')
  @IsEmail()
  @MaxLength(120)
  emailContacto?: string;

  @IsOptional()
  @IsLatitude()
  latitud?: number;

  @IsOptional()
  @IsLongitude()
  longitud?: number;
}

export class UpdateEstadoCanchaDto {
  @IsIn(['disponible', 'mantenimiento', 'fuera_servicio'])
  estado: string;
}

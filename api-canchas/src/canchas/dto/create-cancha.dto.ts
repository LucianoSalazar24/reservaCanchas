import { IsEmail, ValidateIf, IsString, IsNumber, IsOptional, MaxLength, Min, IsPositive, IsLatitude, IsLongitude } from 'class-validator';

export class CreateCanchaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacidad?: number;

  @IsNumber()
  @IsPositive()
  precioPorHora: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  zona?: string;

  // Se permite '' para vaciarlo desde el formulario; el service lo guarda como null.
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

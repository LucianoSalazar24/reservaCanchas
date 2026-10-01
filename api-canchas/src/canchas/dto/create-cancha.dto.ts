import { IsString, IsNumber, IsOptional, MaxLength, Min, IsPositive, IsLatitude, IsLongitude } from 'class-validator';

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
  @IsLatitude()
  latitud?: number;

  @IsOptional()
  @IsLongitude()
  longitud?: number;
}

import { IsString, IsEmail, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(100)
  apellido: string;

  @IsString()
  @MaxLength(20)
  telefono: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  tipoClienteId?: number;
}

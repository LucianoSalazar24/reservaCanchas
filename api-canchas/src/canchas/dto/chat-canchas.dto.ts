import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsIn, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, MaxLength, ValidateNested,
} from 'class-validator';

export class CanchaMostradaDto {
  @IsInt()
  id: number;

  @IsString()
  @MaxLength(100)
  nombre: string;
}

export class MensajeHistorialDto {
  @IsIn(['usuario', 'bot'])
  rol: 'usuario' | 'bot';

  @IsString()
  @MaxLength(500)
  texto: string;

  // Canchas que ese mensaje del bot mostró (id + nombre): sin esto el modelo no podría
  // resolver "reservame la segunda" en el turno siguiente, porque el historial es solo texto.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => CanchaMostradaDto)
  canchas?: CanchaMostradaDto[];
}

export class ChatCanchasDto {
  // La ubicación es opcional: sin ella se busca igual, solo que sin ordenar por cercanía.
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng?: number;

  @IsString()
  @MaxLength(300)
  mensaje: string;

  // Últimos turnos de la conversación para poder responder seguimientos ("¿y más baratas?").
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => MensajeHistorialDto)
  historial?: MensajeHistorialDto[];
}

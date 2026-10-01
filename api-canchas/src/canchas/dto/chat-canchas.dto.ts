import { Type } from 'class-transformer';
import { IsArray, IsIn, IsLatitude, IsLongitude, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class MensajeHistorialDto {
  @IsIn(['usuario', 'bot'])
  rol: 'usuario' | 'bot';

  @IsString()
  @MaxLength(500)
  texto: string;
}

export class ChatCanchasDto {
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @Type(() => Number)
  @IsLongitude()
  lng: number;

  @IsString()
  @MaxLength(300)
  mensaje: string;

  // Últimos turnos de la conversación (solo texto, sin datos de canchas) para que Gemini
  // pueda responder preguntas de seguimiento ("¿y más baratas?"). Opcional y acotado.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MensajeHistorialDto)
  historial?: MensajeHistorialDto[];
}

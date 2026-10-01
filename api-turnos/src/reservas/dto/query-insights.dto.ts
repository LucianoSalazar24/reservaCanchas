import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryInsightsDto {
  // Cantidad de semanas hacia atrás a incluir en la serie (incluye la semana actual).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(12)
  semanas?: number;
}

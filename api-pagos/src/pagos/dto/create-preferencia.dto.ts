import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePreferenciaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  unit_price: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  reservaId: number;
}

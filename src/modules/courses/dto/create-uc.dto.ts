import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateUcDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total_hours: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  order?: number;
}

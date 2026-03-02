import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBlockDto {
  @IsNotEmpty()
  @IsString()
  course_id: string;

  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total_hours: number;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  projected_end_date?: string;

  @IsOptional()
  @IsString()
  uc_id?: string;
}

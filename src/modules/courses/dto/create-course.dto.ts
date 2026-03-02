import { Type } from 'class-transformer';
import { CourseType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CourseType)
  type: CourseType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total_hours?: number;
}

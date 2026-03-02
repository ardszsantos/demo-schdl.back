import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateBlockSessionDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  day_of_week: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'start_time must be in HH:mm format' })
  start_time: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'end_time must be in HH:mm format' })
  end_time: string;

  @IsOptional()
  @IsString()
  room_id?: string;
}

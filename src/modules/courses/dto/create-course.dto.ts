import { CourseType } from '@prisma/client';

export class CreateCourseDto {
  name: string;
  description?: string;
  type: CourseType;
  total_hours?: number;
}

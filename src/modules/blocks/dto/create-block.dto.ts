export class CreateBlockDto {
  course_id: string;
  teacher_id: string;
  name: string;
  total_hours: number;
  start_date: string;
  projected_end_date?: string;
  uc_id?: string;
}

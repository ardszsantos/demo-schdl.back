export class CreateBlockDto {
  course_id: string;
  teacher_id: string;
  name: string;
  total_hours: number;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  start_date: string;
  projected_end_date?: string;
  uc_id?: string;
  room_id?: string;
  color?: string;
}

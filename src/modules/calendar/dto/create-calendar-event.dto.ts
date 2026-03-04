import { CalendarEventType } from '@prisma/client';

export class CreateCalendarEventDto {
  date: string;
  name: string;
  type: CalendarEventType;
}

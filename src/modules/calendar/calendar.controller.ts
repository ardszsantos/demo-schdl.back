import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';

@Controller('calendar')
@Roles(Role.COORDINATOR)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  findAll(@Query('year') year?: string) {
    return this.calendarService.findAll(year ? Number(year) : undefined);
  }

  @Post()
  create(@Body() dto: CreateCalendarEventDto) {
    return this.calendarService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }

  @Post('seed/:year')
  seedFromBrasilApi(@Param('year') year: string) {
    return this.calendarService.seedFromBrasilApi(Number(year));
  }
}

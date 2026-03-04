import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CalendarEventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';

interface BrasilApiHoliday {
  date: string;
  name: string;
  type: string;
}

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(year?: number) {
    const where = year
      ? {
          date: {
            gte: new Date(`${year}-01-01T00:00:00Z`),
            lte: new Date(`${year}-12-31T23:59:59Z`),
          },
        }
      : {};

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async create(dto: CreateCalendarEventDto) {
    return this.prisma.calendarEvent.create({
      data: {
        date: new Date(dto.date + 'T12:00:00Z'),
        name: dto.name,
        type: dto.type,
      },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Calendar event not found');
    return this.prisma.calendarEvent.delete({ where: { id } });
  }

  // Importa feriados do ano via BrasilAPI e salva no banco (ignora duplicatas)
  async seedFromBrasilApi(year: number) {
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('Invalid year');
    }

    const response = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${year}`,
    );

    if (!response.ok) {
      throw new BadRequestException(`BrasilAPI returned status ${response.status}`);
    }

    const holidays: BrasilApiHoliday[] = await response.json();

    const existing = await this.prisma.calendarEvent.findMany({
      where: {
        date: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lte: new Date(`${year}-12-31T23:59:59Z`),
        },
        type: CalendarEventType.HOLIDAY,
      },
      select: { date: true },
    });

    const existingDates = new Set(
      existing.map((e) => e.date.toISOString().split('T')[0]),
    );

    const toCreate = holidays.filter((h) => !existingDates.has(h.date));

    if (toCreate.length === 0) {
      return { created: 0, message: 'No new holidays to import' };
    }

    await this.prisma.calendarEvent.createMany({
      data: toCreate.map((h) => ({
        date: new Date(h.date + 'T12:00:00Z'),
        name: h.name,
        type: CalendarEventType.HOLIDAY,
      })),
    });

    return { created: toCreate.length, message: `Imported ${toCreate.length} holidays for ${year}` };
  }
}

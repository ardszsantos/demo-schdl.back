import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

// Converte "HH:MM" para Date com data base 1970-01-01 (usado para campos @db.Time)
function timeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(0);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

// Converte JS getUTCDay() (0=Dom) para ISO 8601 (1=Seg...7=Dom)
function jsToIsoDow(jsDow: number): number {
  return jsDow === 0 ? 7 : jsDow;
}

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 20);
    const skip = (safePage - 1) * safeLimit;
    const [data, total] = await Promise.all([
      this.prisma.block.findMany({
        ...(skip > 0 ? { skip } : {}),
        take: safeLimit,
        orderBy: { created_at: 'desc' },
        include: {
          course: { select: { id: true, name: true, type: true } },
          teacher: { select: { id: true, name: true } },
          uc: { select: { id: true, name: true } },
          room: { select: { id: true, name: true } },
          _count: { select: { sessions: true } },
        },
      }),
      this.prisma.block.count(),
    ]);

    return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async findOne(id: string) {
    const block = await this.prisma.block.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, name: true, type: true } },
        teacher: { select: { id: true, name: true } },
        uc: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        sessions: { orderBy: { date: 'asc' } },
      },
    });

    if (!block) throw new NotFoundException('Block not found');

    return block;
  }

  async create(dto: CreateBlockDto) {
    // 1. Validações
    const course = await this.prisma.course.findUnique({ where: { id: dto.course_id } });
    if (!course) throw new NotFoundException('Course not found');

    const teacher = await this.prisma.teacher.findUnique({ where: { id: dto.teacher_id } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    if (dto.uc_id) {
      if (course.type === 'FIC') throw new BadRequestException('FIC courses cannot have UCs');
      const uc = await this.prisma.uC.findFirst({
        where: { id: dto.uc_id, course_id: dto.course_id },
      });
      if (!uc) throw new NotFoundException('UC not found or does not belong to this course');
    }

    if (dto.room_id) {
      const room = await this.prisma.room.findUnique({ where: { id: dto.room_id } });
      if (!room) throw new NotFoundException('Room not found');
    }

    // 2. Calcular horas por sessão
    const startTime = timeToDate(dto.start_time);
    const endTime = timeToDate(dto.end_time);
    const hoursPerSession =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (hoursPerSession <= 0) {
      throw new BadRequestException('end_time must be after start_time');
    }

    const sessionsNeeded = Math.ceil(Number(dto.total_hours) / hoursPerSession);

    // 3. Buscar datas bloqueadas (feriados, recessos, etc.)
    const calendarEvents = await this.prisma.calendarEvent.findMany({
      select: { date: true },
    });
    const blockedDates = new Set(
      calendarEvents.map((e) => e.date.toISOString().split('T')[0]),
    );

    // 4. Gerar datas das sessões
    const sessionDates = this.generateSessionDates(
      dto.start_date,
      dto.days_of_week,
      sessionsNeeded,
      blockedDates,
    );

    if (sessionDates.length === 0) {
      throw new BadRequestException(
        'Could not generate any sessions for the given parameters',
      );
    }

    // 5. Detecção de conflitos
    const conflictConditions: any[] = [{ teacher_id: dto.teacher_id }];
    if (dto.room_id) conflictConditions.push({ room_id: dto.room_id });

    const conflictingSessions = await this.prisma.blockSession.findMany({
      where: {
        date: { in: sessionDates },
        block: {
          OR: conflictConditions,
          start_time: { lt: endTime },
          end_time: { gt: startTime },
        },
      },
      include: {
        block: { select: { name: true, teacher_id: true, room_id: true } },
      },
    });

    if (conflictingSessions.length > 0) {
      const conflictDates = [
        ...new Set(conflictingSessions.map((s) => s.date.toISOString().split('T')[0])),
      ].join(', ');
      throw new ConflictException(`Schedule conflict on: ${conflictDates}`);
    }

    // 6. Criar block + sessões em transação
    const projectedEndDate = sessionDates[sessionDates.length - 1];

    return this.prisma.$transaction(async (tx) => {
      const block = await tx.block.create({
        data: {
          course_id: dto.course_id,
          teacher_id: dto.teacher_id,
          uc_id: dto.uc_id,
          room_id: dto.room_id,
          name: dto.name,
          total_hours: dto.total_hours,
          days_of_week: dto.days_of_week,
          start_time: startTime,
          end_time: endTime,
          start_date: new Date(dto.start_date + 'T12:00:00Z'),
          projected_end_date: projectedEndDate,
        },
        include: {
          course: { select: { id: true, name: true, type: true } },
          teacher: { select: { id: true, name: true } },
          uc: { select: { id: true, name: true } },
          room: { select: { id: true, name: true } },
        },
      });

      await tx.blockSession.createMany({
        data: sessionDates.map((date) => ({ block_id: block.id, date })),
      });

      return { ...block, sessions_count: sessionDates.length };
    });
  }

  async update(id: string, dto: UpdateBlockDto) {
    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block) throw new NotFoundException('Block not found');

    if (dto.uc_id) {
      const courseId = dto.course_id ?? block.course_id;
      const course = await this.prisma.course.findUnique({ where: { id: courseId } });
      if (course?.type === 'FIC') throw new BadRequestException('FIC courses cannot have UCs');
      const uc = await this.prisma.uC.findFirst({ where: { id: dto.uc_id, course_id: courseId } });
      if (!uc) throw new NotFoundException('UC not found or does not belong to this course');
    }

    // Se nenhum campo de agendamento mudou, atualiza só os dados e pronto
    const schedulingFields = ['days_of_week', 'start_time', 'end_time', 'start_date', 'total_hours', 'teacher_id', 'room_id'] as const;
    const schedulingChanged = schedulingFields.some((f) => dto[f] !== undefined);

    if (!schedulingChanged) {
      return this.prisma.block.update({ where: { id }, data: { ...dto } });
    }

    // Montar valores efetivos (dto sobrescreve o que está no banco)
    const effectiveTeacherId = dto.teacher_id ?? block.teacher_id;
    const effectiveRoomId = dto.room_id !== undefined ? dto.room_id : block.room_id;
    const effectiveTotalHours = dto.total_hours !== undefined ? Number(dto.total_hours) : Number(block.total_hours);
    const effectiveDaysOfWeek = dto.days_of_week ?? block.days_of_week;
    const effectiveStartDate = dto.start_date ?? block.start_date.toISOString().split('T')[0];
    const effectiveStartTime = dto.start_time ? timeToDate(dto.start_time) : block.start_time;
    const effectiveEndTime = dto.end_time ? timeToDate(dto.end_time) : block.end_time;

    const hoursPerSession = (effectiveEndTime.getTime() - effectiveStartTime.getTime()) / (1000 * 60 * 60);
    if (hoursPerSession <= 0) throw new BadRequestException('end_time must be after start_time');

    const sessionsNeeded = Math.ceil(effectiveTotalHours / hoursPerSession);

    const calendarEvents = await this.prisma.calendarEvent.findMany({ select: { date: true } });
    const blockedDates = new Set(calendarEvents.map((e) => e.date.toISOString().split('T')[0]));

    const sessionDates = this.generateSessionDates(effectiveStartDate, effectiveDaysOfWeek, sessionsNeeded, blockedDates);
    if (sessionDates.length === 0) throw new BadRequestException('Could not generate any sessions for the given parameters');

    // Checagem de conflitos excluindo as sessões do próprio bloco
    const conflictConditions: any[] = [{ teacher_id: effectiveTeacherId }];
    if (effectiveRoomId) conflictConditions.push({ room_id: effectiveRoomId });

    const conflictingSessions = await this.prisma.blockSession.findMany({
      where: {
        date: { in: sessionDates },
        block: {
          id: { not: id },
          OR: conflictConditions,
          start_time: { lt: effectiveEndTime },
          end_time: { gt: effectiveStartTime },
        },
      },
    });

    if (conflictingSessions.length > 0) {
      const conflictDates = [...new Set(conflictingSessions.map((s) => s.date.toISOString().split('T')[0]))].join(', ');
      throw new ConflictException(`Schedule conflict on: ${conflictDates}`);
    }

    const projectedEndDate = sessionDates[sessionDates.length - 1];

    const updateData: any = { ...dto };
    if (dto.start_time) updateData.start_time = effectiveStartTime;
    if (dto.end_time) updateData.end_time = effectiveEndTime;
    if (dto.start_date) updateData.start_date = new Date(dto.start_date + 'T12:00:00Z');
    updateData.projected_end_date = projectedEndDate;

    return this.prisma.$transaction(async (tx) => {
      await tx.blockSession.deleteMany({ where: { block_id: id } });

      const updated = await tx.block.update({
        where: { id },
        data: updateData,
        include: {
          course: { select: { id: true, name: true, type: true } },
          teacher: { select: { id: true, name: true } },
          uc: { select: { id: true, name: true } },
          room: { select: { id: true, name: true } },
        },
      });

      await tx.blockSession.createMany({
        data: sessionDates.map((date) => ({ block_id: id, date })),
      });

      return { ...updated, sessions_count: sessionDates.length };
    });
  }

  async remove(id: string) {
    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block) throw new NotFoundException('Block not found');
    return this.prisma.block.delete({ where: { id } });
  }

  async findAllSessions(blockId: string) {
    const block = await this.prisma.block.findUnique({ where: { id: blockId } });
    if (!block) throw new NotFoundException('Block not found');
    return this.prisma.blockSession.findMany({
      where: { block_id: blockId },
      orderBy: { date: 'asc' },
    });
  }

  async removeSession(blockId: string, sessionId: string) {
    const session = await this.prisma.blockSession.findFirst({
      where: { id: sessionId, block_id: blockId },
    });
    if (!session) throw new NotFoundException('Session not found');
    return this.prisma.blockSession.delete({ where: { id: sessionId } });
  }

  // Gera as datas reais das sessões, pulando dias bloqueados
  private generateSessionDates(
    startDate: string,
    daysOfWeek: number[],
    sessionsNeeded: number,
    blockedDates: Set<string>,
  ): Date[] {
    const dates: Date[] = [];
    // Usar meio-dia UTC para evitar problemas de timezone em datas
    const current = new Date(startDate + 'T12:00:00Z');

    // Limite de segurança: máximo 5 anos de iteração
    const maxDate = new Date(current);
    maxDate.setFullYear(maxDate.getFullYear() + 5);

    while (dates.length < sessionsNeeded && current <= maxDate) {
      const isoDow = jsToIsoDow(current.getUTCDay());

      if (daysOfWeek.includes(isoDow)) {
        const dateStr = current.toISOString().split('T')[0];
        if (!blockedDates.has(dateStr)) {
          dates.push(new Date(dateStr + 'T00:00:00.000Z'));
        }
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    return dates;
  }
}

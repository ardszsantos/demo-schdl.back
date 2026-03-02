import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateBlockSessionDto } from './dto/create-block-session.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { UpdateBlockSessionDto } from './dto/update-block-session.dto';

function timeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(0);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.block.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          course: { select: { id: true, name: true, type: true } },
          teacher: { select: { id: true, name: true } },
          uc: { select: { id: true, name: true } },
          _count: { select: { sessions: true } },
        },
      }),
      this.prisma.block.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const block = await this.prisma.block.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, name: true, type: true } },
        teacher: { select: { id: true, name: true } },
        uc: { select: { id: true, name: true } },
        sessions: {
          include: { room: { select: { id: true, name: true } } },
          orderBy: { day_of_week: 'asc' },
        },
      },
    });

    if (!block) throw new NotFoundException('Block not found');

    return block;
  }

  async create(dto: CreateBlockDto) {
    const course = await this.prisma.course.findUnique({ where: { id: dto.course_id } });
    if (!course) throw new NotFoundException('Course not found');

    const teacher = await this.prisma.teacher.findUnique({ where: { id: dto.teacher_id } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    if (dto.uc_id) {
      if (course.type === 'FIC') {
        throw new BadRequestException('FIC courses cannot have UCs');
      }

      const uc = await this.prisma.uC.findFirst({
        where: { id: dto.uc_id, course_id: dto.course_id },
      });
      if (!uc) throw new NotFoundException('UC not found or does not belong to this course');
    }

    return this.prisma.block.create({ data: { ...dto } });
  }

  async update(id: string, dto: UpdateBlockDto) {
    const block = await this.findOne(id);

    if (dto.uc_id) {
      const courseId = dto.course_id ?? block.course.id;
      const course = await this.prisma.course.findUnique({ where: { id: courseId } });

      if (course?.type === 'FIC') {
        throw new BadRequestException('FIC courses cannot have UCs');
      }

      const uc = await this.prisma.uC.findFirst({
        where: { id: dto.uc_id, course_id: courseId },
      });
      if (!uc) throw new NotFoundException('UC not found or does not belong to this course');
    }

    return this.prisma.block.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.block.delete({ where: { id } });
  }

  // Sessions

  async findAllSessions(blockId: string) {
    await this.findOne(blockId);
    return this.prisma.blockSession.findMany({
      where: { block_id: blockId },
      include: { room: { select: { id: true, name: true } } },
      orderBy: { day_of_week: 'asc' },
    });
  }

  async findOneSession(blockId: string, sessionId: string) {
    await this.findOne(blockId);
    const session = await this.prisma.blockSession.findFirst({
      where: { id: sessionId, block_id: blockId },
      include: { room: { select: { id: true, name: true } } },
    });

    if (!session) throw new NotFoundException('Session not found');

    return session;
  }

  async createSession(blockId: string, dto: CreateBlockSessionDto) {
    await this.findOne(blockId);

    if (dto.room_id) {
      const room = await this.prisma.room.findUnique({ where: { id: dto.room_id } });
      if (!room) throw new NotFoundException('Room not found');
    }

    return this.prisma.blockSession.create({
      data: {
        block_id: blockId,
        day_of_week: dto.day_of_week,
        start_time: timeToDate(dto.start_time),
        end_time: timeToDate(dto.end_time),
        room_id: dto.room_id,
      },
      include: { room: { select: { id: true, name: true } } },
    });
  }

  async updateSession(blockId: string, sessionId: string, dto: UpdateBlockSessionDto) {
    await this.findOneSession(blockId, sessionId);

    if (dto.room_id) {
      const room = await this.prisma.room.findUnique({ where: { id: dto.room_id } });
      if (!room) throw new NotFoundException('Room not found');
    }

    return this.prisma.blockSession.update({
      where: { id: sessionId },
      data: {
        ...(dto.day_of_week !== undefined && { day_of_week: dto.day_of_week }),
        ...(dto.start_time && { start_time: timeToDate(dto.start_time) }),
        ...(dto.end_time && { end_time: timeToDate(dto.end_time) }),
        ...(dto.room_id !== undefined && { room_id: dto.room_id }),
      },
      include: { room: { select: { id: true, name: true } } },
    });
  }

  async removeSession(blockId: string, sessionId: string) {
    await this.findOneSession(blockId, sessionId);
    return this.prisma.blockSession.delete({ where: { id: sessionId } });
  }
}

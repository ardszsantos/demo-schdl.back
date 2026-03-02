import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateUcDto } from './dto/create-uc.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateUcDto } from './dto/update-uc.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          ucs: { select: { total_hours: true } },
          _count: { select: { blocks: true } },
        },
      }),
      this.prisma.course.count(),
    ]);

    const data = courses.map(({ ucs, ...course }) => ({
      ...course,
      ucs_count: ucs.length,
      ...(course.type === 'REGULAR' && {
        ucs_total_hours: ucs.reduce((sum, uc) => sum + Number(uc.total_hours), 0),
      }),
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { ucs: { orderBy: { order: 'asc' } } },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (course.type === 'REGULAR') {
      const ucs_total_hours = course.ucs.reduce(
        (sum, uc) => sum + Number(uc.total_hours),
        0,
      );
      return { ...course, ucs_total_hours };
    }

    return course;
  }

  async create(dto: CreateCourseDto) {
    if (dto.type === 'FIC' && !dto.total_hours) {
      throw new BadRequestException('FIC courses require total_hours');
    }
    return this.prisma.course.create({ data: dto });
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.findOne(id);
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.course.delete({ where: { id } });
  }

  async findAllUcs(courseId: string) {
    await this.findOne(courseId);
    return this.prisma.uC.findMany({
      where: { course_id: courseId },
      orderBy: { order: 'asc' },
    });
  }

  async findOneUc(courseId: string, ucId: string) {
    await this.findOne(courseId);
    const uc = await this.prisma.uC.findFirst({
      where: { id: ucId, course_id: courseId },
    });

    if (!uc) throw new NotFoundException('UC not found');

    return uc;
  }

  async createUc(courseId: string, dto: CreateUcDto) {
    const course = await this.findOne(courseId);
    if (course.type === 'FIC') {
      throw new BadRequestException('FIC courses cannot have UCs');
    }
    return this.prisma.uC.create({
      data: { ...dto, course_id: courseId },
    });
  }

  async updateUc(courseId: string, ucId: string, dto: UpdateUcDto) {
    await this.findOneUc(courseId, ucId);
    return this.prisma.uC.update({ where: { id: ucId }, data: dto });
  }

  async removeUc(courseId: string, ucId: string) {
    await this.findOneUc(courseId, ucId);
    return this.prisma.uC.delete({ where: { id: ucId } });
  }
}

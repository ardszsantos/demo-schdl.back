import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';



@Injectable()
export class TeacherService {

  constructor(
     private readonly prisma: PrismaService,
  ) {}
      

  async create(data: any) {
    return this.prisma.teacher.create({
      data: data,
    });
  }

  async findAll() {
    return this.prisma.teacher.findMany({
        include: {
            availabilities: true,
            blocks_teacher: true,
        }
    })
  }

  async findOne (id: string){
    return this.prisma.teacher.findUnique({
        where: {id},
    });
  }

   async update(id: string, data: any) {
    return this.prisma.teacher.update({
      where: { id },
      data,
    });
  }

  async remove (id: string) {
    return this.prisma.teacher.delete({
        where: {id}
    });
  }

    // disponibilidade semanal
  async setAvailability(teacherId: string, availability: any[]) {

    await this.prisma.teacherAvailability.deleteMany({
      where: { teacher_id: teacherId },
    });

    return this.prisma.teacherAvailability.createMany({
      data: availability.map(a => ({
        teacher_id: teacherId,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
      })),
    });
  }

  // afastamentos
  async addBlock(
    teacherId: string,
    start_date: Date,
    end_date: Date,
    reason?: string,
  ) {
    return this.prisma.teacherBlock.create({
      data: {
        teacher_id: teacherId,
        start_date,
        end_date,
        reason,
      },
    });
  }
}
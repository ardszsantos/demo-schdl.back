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
    return this.prisma.teacher.findMany();
  }

  async findOne(id: string) {
    return this.prisma.teacher.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.teacher.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}

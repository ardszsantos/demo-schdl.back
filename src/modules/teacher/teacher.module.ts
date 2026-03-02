import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';

@Module({
  imports: [],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [],
})
export class TeacherModule {}
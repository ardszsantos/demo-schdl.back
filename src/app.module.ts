import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { BlocksModule } from './modules/blocks/blocks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { TeacherModule } from './modules/teacher/teacher.module';


@Module({
  imports: [PrismaModule, AuthModule, CoursesModule, RoomsModule, BlocksModule, TeacherModule, CalendarModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

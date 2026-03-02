import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateUcDto } from './dto/create-uc.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateUcDto } from './dto/update-uc.dto';

@Controller('courses')
@Roles(Role.COORDINATOR)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.coursesService.findAll(Number(page), Number(limit));
  }

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  // UC endpoints

  @Get(':id/ucs')
  findAllUcs(@Param('id') id: string) {
    return this.coursesService.findAllUcs(id);
  }

  @Post(':id/ucs')
  createUc(@Param('id') id: string, @Body() dto: CreateUcDto) {
    return this.coursesService.createUc(id, dto);
  }

  @Get(':id/ucs/:ucId')
  findOneUc(@Param('id') id: string, @Param('ucId') ucId: string) {
    return this.coursesService.findOneUc(id, ucId);
  }

  @Patch(':id/ucs/:ucId')
  updateUc(
    @Param('id') id: string,
    @Param('ucId') ucId: string,
    @Body() dto: UpdateUcDto,
  ) {
    return this.coursesService.updateUc(id, ucId, dto);
  }

  @Delete(':id/ucs/:ucId')
  removeUc(@Param('id') id: string, @Param('ucId') ucId: string) {
    return this.coursesService.removeUc(id, ucId);
  }
}

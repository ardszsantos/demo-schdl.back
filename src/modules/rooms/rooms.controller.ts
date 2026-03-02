import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@Roles(Role.COORDINATOR)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.roomsService.findAll(Number(page), Number(limit));
  }

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}

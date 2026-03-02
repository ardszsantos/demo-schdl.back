import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateBlockSessionDto } from './dto/create-block-session.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { UpdateBlockSessionDto } from './dto/update-block-session.dto';

@Controller('blocks')
@Roles(Role.COORDINATOR)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.blocksService.findAll(Number(page), Number(limit));
  }

  @Post()
  create(@Body() dto: CreateBlockDto) {
    return this.blocksService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blocksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlockDto) {
    return this.blocksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blocksService.remove(id);
  }

  // Sessions

  @Get(':id/sessions')
  findAllSessions(@Param('id') id: string) {
    return this.blocksService.findAllSessions(id);
  }

  @Post(':id/sessions')
  createSession(@Param('id') id: string, @Body() dto: CreateBlockSessionDto) {
    return this.blocksService.createSession(id, dto);
  }

  @Get(':id/sessions/:sessionId')
  findOneSession(@Param('id') id: string, @Param('sessionId') sessionId: string) {
    return this.blocksService.findOneSession(id, sessionId);
  }

  @Patch(':id/sessions/:sessionId')
  updateSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateBlockSessionDto,
  ) {
    return this.blocksService.updateSession(id, sessionId, dto);
  }

  @Delete(':id/sessions/:sessionId')
  removeSession(@Param('id') id: string, @Param('sessionId') sessionId: string) {
    return this.blocksService.removeSession(id, sessionId);
  }
}

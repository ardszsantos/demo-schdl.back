import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

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

  @Get(':id/sessions')
  findAllSessions(@Param('id') id: string) {
    return this.blocksService.findAllSessions(id);
  }

  @Delete(':id/sessions/:sessionId')
  removeSession(@Param('id') id: string, @Param('sessionId') sessionId: string) {
    return this.blocksService.removeSession(id, sessionId);
  }
}

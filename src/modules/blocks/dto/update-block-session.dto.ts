import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockSessionDto } from './create-block-session.dto';

export class UpdateBlockSessionDto extends PartialType(CreateBlockSessionDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateUcDto } from './create-uc.dto';

export class UpdateUcDto extends PartialType(CreateUcDto) {}

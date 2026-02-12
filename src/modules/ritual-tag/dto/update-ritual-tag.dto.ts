import { PartialType } from '@nestjs/mapped-types';
import { CreateRitualTagDto } from './create-ritual-tag.dto';

export class UpdateRitualTagDto extends PartialType(CreateRitualTagDto) {}

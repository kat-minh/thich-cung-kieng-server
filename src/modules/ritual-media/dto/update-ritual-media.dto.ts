import { PartialType } from '@nestjs/mapped-types';
import { CreateRitualMediaDto } from './create-ritual-media.dto';

export class UpdateRitualMediaDto extends PartialType(CreateRitualMediaDto) {}

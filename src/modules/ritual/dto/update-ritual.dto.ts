import { PartialType } from '@nestjs/mapped-types';
import { CreateRitualDto } from './create-ritual.dto';

export class UpdateRitualDto extends PartialType(CreateRitualDto) {}

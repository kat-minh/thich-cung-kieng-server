import { PartialType } from '@nestjs/mapped-types';
import { CreateRitualTrayDto } from './create-ritual-tray.dto';

export class UpdateRitualTrayDto extends PartialType(CreateRitualTrayDto) {}

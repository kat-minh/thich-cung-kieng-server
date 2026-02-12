import { PartialType } from '@nestjs/mapped-types';
import { CreateRitualOfferingDto } from './create-ritual-offering.dto';

export class UpdateRitualOfferingDto extends PartialType(
  CreateRitualOfferingDto,
) {}

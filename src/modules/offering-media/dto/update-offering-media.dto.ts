import { PartialType } from '@nestjs/mapped-types';
import { CreateOfferingMediaDto } from './create-offering-media.dto';

export class UpdateOfferingMediaDto extends PartialType(CreateOfferingMediaDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserEventOfferingDto } from './create-user_event_offering.dto';

export class UpdateUserEventOfferingDto extends PartialType(CreateUserEventOfferingDto) {}

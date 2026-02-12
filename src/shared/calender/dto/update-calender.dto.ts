import { PartialType } from '@nestjs/mapped-types';
import { CreateCalendarEventDto } from './create-calender.dto';

export class UpdateCalendarEventDto extends PartialType(
  CreateCalendarEventDto,
) {}

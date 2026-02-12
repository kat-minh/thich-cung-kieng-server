import { PartialType } from '@nestjs/mapped-types';
import { CreateUserEventReminderDto } from './create-user_event_reminder.dto';

export class UpdateUserEventReminderDto extends PartialType(CreateUserEventReminderDto) {}

import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  IsPositive,
} from 'class-validator';
import {
  NotifyMethod,
  UserEventReminderStatus,
} from 'src/common/enums/user-event-reminder.enum';

export class CreateUserEventReminderDto {
  @IsUUID()
  userEventId: string;

  @IsNumber()
  @IsPositive()
  remindBefore: number;

  @IsOptional()
  @IsEnum(NotifyMethod)
  notifyMethod?: NotifyMethod;

  @IsOptional()
  @IsEnum(UserEventReminderStatus)
  status?: UserEventReminderStatus;
}

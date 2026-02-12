import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  NotifyMethod,
  UserEventReminderStatus,
} from 'src/common/enums/user-event-reminder.enum';
import { CreateUserEventDto } from './create-user-event.dto';

export class UserEventOfferingInputDto {
  @ApiProperty({
    description: 'Name of the offering',
    example: 'Incense sticks',
  })
  @IsString()
  offeringName: string;

  @ApiProperty({
    description: 'Quantity of the offering',
    example: 5,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Additional notes for the offering',
    example: 'Special incense for prayer',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UserEventReminderInputDto {
  @ApiProperty({
    description: 'Minutes before the event to send reminder',
    example: 30,
  })
  @IsNumber()
  @IsPositive()
  remindBefore: number;

  @ApiProperty({
    description: 'Method to send the notification',
    enum: NotifyMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotifyMethod)
  notifyMethod?: NotifyMethod;

  @ApiProperty({
    description: 'Status of the reminder',
    enum: UserEventReminderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserEventReminderStatus)
  status?: UserEventReminderStatus;
}

export class UserEventRelationDto {
  @ApiProperty({
    description: 'List of reminders associated with the event',
    type: [UserEventReminderInputDto],
    required: false,
    example: [
      {
        remindBefore: 30,
        notifyMethod: 'email',
        status: 'pending',
      },
      {
        remindBefore: 1440,
        notifyMethod: 'push_notification',
        status: 'pending',
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserEventReminderInputDto)
  eventReminders?: UserEventReminderInputDto[];

  @ApiProperty({
    description: 'List of offerings associated with the event',
    type: [UserEventOfferingInputDto],
    required: false,
    example: [
      {
        offeringName: 'Hương thơm',
        quantity: 10,
        note: 'Hương cao cấp cho lễ cúng',
      },
      {
        offeringName: 'Nến đỏ',
        quantity: 2,
        note: 'Nến thắp sáng bàn thờ',
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserEventOfferingInputDto)
  eventOfferings?: UserEventOfferingInputDto[];
}

export class CreateUserEventWithRelationshipDto {
  @ApiProperty({
    description: 'Main user event data',
    type: CreateUserEventDto,
  })
  @ValidateNested()
  @Type(() => CreateUserEventDto)
  userEvent: CreateUserEventDto;

  @ApiProperty({
    description: 'Related entities data',
    type: UserEventRelationDto,
    required: false,
    example: {
      eventReminders: [
        {
          remindBefore: 30,
          notifyMethod: 'email',
          status: 'pending',
        },
      ],
      eventOfferings: [
        {
          offeringName: 'Hương thơm',
          quantity: 10,
          note: 'Hương cao cấp cho lễ cúng',
        },
      ],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserEventRelationDto)
  relations?: UserEventRelationDto;
}

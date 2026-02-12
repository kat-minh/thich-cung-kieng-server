import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';
import {
  UserEventStatus,
  UserEventType,
} from 'src/common/enums/user-event.enum';

export class FilterUserEvent extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'ID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Date of the event',
    example: '2023-10-15T10:00:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  eventDate?: Date;

  @ApiPropertyOptional({
    description: 'Status of the user event',
    example: UserEventStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserEventStatus)
  status?: UserEventStatus;

  @ApiPropertyOptional({
    description: 'Type of the user event',
    example: UserEventType.PERSONAL,
  })
  @IsOptional()
  @IsEnum(UserEventType)
  eventType?: UserEventType;
}

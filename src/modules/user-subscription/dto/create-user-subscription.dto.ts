import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserSubscriptionStatus } from 'src/common/enums/user-subscription.enum';

export class CreateUserSubscriptionDto {
  @ApiProperty({
    description: 'Start date of the subscription',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'End date of the subscription',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Status of the subscription',
    enum: UserSubscriptionStatus,
    example: UserSubscriptionStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserSubscriptionStatus)
  status?: UserSubscriptionStatus;

  @ApiProperty({
    description: 'Whether the subscription should auto-renew',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiProperty({
    description: 'ID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'ID of the subscription plan',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID()
  subscriptionPlanId: string;
}

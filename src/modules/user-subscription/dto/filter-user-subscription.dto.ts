import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

export class FilterUserSubsciptionDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'ID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userId?: string;
  @ApiPropertyOptional({
    description: 'ID of the subscription plan',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  subscriptionPlanId?: string;
  @ApiPropertyOptional({
    description: 'Status of the user subscription',
    example: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;
  @ApiPropertyOptional({
    description: 'Whether the subscription is set to auto-renew',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}

import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

export class FilterSubscriptionPlanDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'Name of the subscription plan',
    example: 'Premium Plan',
  })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiPropertyOptional({
    description: 'Description of the subscription plan',
    example: 'Access to all premium features',
  })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiPropertyOptional({
    description: 'Price of the subscription plan',
    example: 49.99,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
  @ApiPropertyOptional({
    description: 'Duration of the subscription plan in days',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  durationDays?: number;
}

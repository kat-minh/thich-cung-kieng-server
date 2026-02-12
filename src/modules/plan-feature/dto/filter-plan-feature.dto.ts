import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

export class FilterPlanFeatureDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'ID of the associated subscription plan',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  subscriptionPlanId?: string;

  @ApiPropertyOptional({
    description: 'ID of the subscription feature',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  subscriptionFeatureId?: string;
}

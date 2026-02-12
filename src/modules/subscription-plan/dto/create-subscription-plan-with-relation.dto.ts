import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateSubscriptionPlanDto } from './create-subscription-plan.dto';
import { Type } from 'class-transformer';

export class PlanFeatureInputDto {
  @ApiProperty({
    description: 'ID of the subscription feature',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID()
  subscriptionFeatureId: string;
}

export class SubscriptionPlanRelationDto {
  @ApiProperty({
    description:
      'List of plan features to be associated with the subscription plan',
    type: [PlanFeatureInputDto],
  })
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureInputDto)
  planFeatures: PlanFeatureInputDto[];
}

export class CreateSubscriptionPlanWithRelationDto {
  @ApiProperty({
    description: 'Subscription plan details',
    type: CreateSubscriptionPlanDto,
  })
  @ValidateNested()
  @Type(() => CreateSubscriptionPlanDto)
  subscriptionPlan: CreateSubscriptionPlanDto;

  @ApiProperty({
    description: 'List of plan features',
    type: SubscriptionPlanRelationDto,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionPlanRelationDto)
  relations?: SubscriptionPlanRelationDto;
}

import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionPlanWithRelationDto } from './create-subscription-plan-with-relation.dto';

export class UpdateSubscriptionPlanWithRelationDto extends PartialType(
  CreateSubscriptionPlanWithRelationDto,
) {}

import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionFeatureDto } from './create-subscription-feature.dto';

export class UpdateSubscriptionFeatureDto extends PartialType(CreateSubscriptionFeatureDto) {}

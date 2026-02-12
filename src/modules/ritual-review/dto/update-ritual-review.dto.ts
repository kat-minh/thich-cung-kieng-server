import { PartialType } from '@nestjs/mapped-types';
import { CreateRitualReviewDto } from './create-ritual-review.dto';

export class UpdateRitualReviewDto extends PartialType(CreateRitualReviewDto) {}

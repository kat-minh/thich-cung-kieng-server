import { PartialType } from '@nestjs/mapped-types';
import { CreateRitualCategoryDto } from './create-ritual-category.dto';

export class UpdateRitualCategoryDto extends PartialType(CreateRitualCategoryDto) {}

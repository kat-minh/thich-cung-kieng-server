import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

export class FilterRitualCategoryDto extends PartialType(BaseFilterDto) {
  @IsOptional()
  @IsString()
  name?: string;
}

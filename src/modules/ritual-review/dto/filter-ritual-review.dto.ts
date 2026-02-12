import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

export class FilterRitualReviewDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'ID of the associated ritual',
    example: '550e8400-e29b-41d4-a716-446655440000',
    default: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  ritualId?: string;
  @ApiPropertyOptional({
    description: 'ID of the user who made the review',
    example: '550e8400-e29b-41d4-a716-446655440000',
    default: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userId?: string;
  @ApiPropertyOptional({
    description: 'Rating given in the review',
    example: 4,
    default: 4,
  })
  @IsOptional()
  rating?: number;
  @ApiPropertyOptional({
    description: 'Comment provided in the review',
    example: 'Great ritual, very meaningful experience.',
    default: 'Great ritual, very meaningful experience.',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

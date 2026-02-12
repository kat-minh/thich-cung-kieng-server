import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

export class FilterUserFavoriteRitualDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'Filter by userId',
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  userId?: string;
  @ApiPropertyOptional({
    description: 'Filter by ritualId',
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  ritualId?: string;
}

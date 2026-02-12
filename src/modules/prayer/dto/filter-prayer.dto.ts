import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

export class FilterPrayerDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'Name of the prayer',
    example: 'Morning Prayer',
  })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiPropertyOptional({
    description: 'Content of the prayer',
    example: 'This is the content of the morning prayer.',
  })
  @IsOptional()
  @IsString()
  ritualId?: string;
}

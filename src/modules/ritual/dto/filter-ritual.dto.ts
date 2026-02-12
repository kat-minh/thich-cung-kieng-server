import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';
import { DifficultyLevel } from 'src/common/enums/ritual.enum';

export class FilterRitualDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'Filter by ritual difficultyLevel',
    example: DifficultyLevel.EASY,
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficultyLevel?: DifficultyLevel;

  @ApiPropertyOptional({
    description: 'Filter by ritual timeOfExecution',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  timeOfExecution?: number;
  @ApiPropertyOptional({
    description: 'Filter by ritual dateSolar',
    example: '2023-10-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateSolar?: Date;
  @ApiPropertyOptional({
    description: 'Filter by ritual dateLunar',
    example: '15-08',
  })
  @IsOptional()
  @IsString()
  dateLunar?: string;
  @ApiPropertyOptional({
    description: 'Filter by ritual isHot',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;
  @ApiPropertyOptional({
    description: 'Filter by ritual ritualCategoryId',
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  ritualCategoryId?: string;
}

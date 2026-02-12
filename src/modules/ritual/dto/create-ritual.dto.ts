import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DifficultyLevel } from 'src/common/enums/ritual.enum';

export class CreateRitualDto {
  @ApiProperty({
    description: 'Name of the ritual',
    example: 'Lễ cúng rằm tháng giêng',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Time of execution for the ritual',
    example: '45',
  })
  @IsOptional()
  @IsNumber()
  timeOfExecution?: number;

  @ApiProperty({
    description: 'Lunar date for the ritual',
    example: '15/01 (âm lịch)',
  })
  @IsString()
  dateLunar: string;

  @ApiProperty({
    description: 'Solar date for the ritual',
    example: '2024-02-14',
  })
  @IsString()
  @IsOptional()
  dateSolar?: string;

  @ApiProperty({
    description: 'Difficulty level of performing the ritual',
    enum: DifficultyLevel,
    example: DifficultyLevel.EASY,
    required: false,
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficultyLevel?: DifficultyLevel;

  @ApiProperty({
    description: 'Description of the ritual',
    example: 'Lễ cúng rằm tháng giêng để cầu may mắn cả năm',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Detailed content and steps of the ritual',
    example: '1. Chuẩn bị mâm cúng\n2. Thắp hương\n3. Đọc văn khấn...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Reference sources for the ritual',
    example: 'Sách phong tục tập quán Việt Nam',
    required: false,
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({
    description: 'Whether this ritual is currently trending/hot',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @ApiProperty({
    description: 'ID of the ritual category',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ritualCategoryId?: string;
}

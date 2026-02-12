import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  ValidateNested,
  IsArray,
  IsEnum,
  IsUrl,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRitualDto } from './create-ritual.dto';
import { MediaType } from 'src/common/enums/media.enum';
import { UpdateRitualDto } from './update-ritual.dto';

export class RitualMediaInputDto {
  @ApiProperty({
    description: 'Type of media (image, video, etc.)',
    enum: MediaType,
    example: MediaType.IMAGE,
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiProperty({
    description: 'URL of the media file',
    example: 'https://example.com/ritual-guide.jpg',
    format: 'url',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({
    description: 'Alt text for the media',
    example: 'Hướng dẫn thực hiện lễ cúng rằm',
    required: false,
  })
  @IsOptional()
  @IsString()
  alt?: string;
}

export class RitualTagInputDto {
  @ApiProperty({
    description: 'ID of the tag',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID()
  tagId: string;
}

export class RitualOfferingInputDto {
  @ApiProperty({
    description: 'ID of the associated offering',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  offeringId: string;

  @ApiProperty({
    description:
      'Quantity of the offering in the ritual (defaults to 1 if not provided)',
    example: 3,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number = 1;
}

export class RitualPrayerInputDto {
  @ApiProperty({
    description: 'Name of the prayer',
    example: 'Kinh cúng tổ tiên',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Content of the prayer',
    example: 'Nam mô a di đà phật, kính cúng các bậc tổ tiên...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Additional notes for the prayer',
    example: 'Đọc 3 lần vào mỗi buổi sáng',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Description of the prayer',
    example: 'Bài kinh cúng tổ tiên truyền thống',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class RitualRelationsDto {
  @ApiProperty({
    description: 'Ritual offerings to associate',
    type: [RitualOfferingInputDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RitualOfferingInputDto)
  ritualOfferings?: RitualOfferingInputDto[];

  @ApiProperty({
    description: 'Ritual media to associate (1-N relationship)',
    type: [RitualMediaInputDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RitualMediaInputDto)
  ritualMedias?: RitualMediaInputDto[];

  @ApiProperty({
    description: 'Ritual tags to associate',
    type: [RitualTagInputDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RitualTagInputDto)
  ritualTags?: RitualTagInputDto[];

  @ApiProperty({
    description: 'Ritual prayers to associate',
    type: [RitualPrayerInputDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RitualPrayerInputDto)
  ritualPrayers?: RitualPrayerInputDto[];
}

export class UpdateRitualWithRelationsDto {
  @ApiProperty({
    description: 'Main ritual data',
    type: CreateRitualDto,
  })
  @ValidateNested()
  @Type(() => UpdateRitualDto)
  ritual: UpdateRitualDto;

  @ApiProperty({
    description: 'Optional relations data',
    type: RitualRelationsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RitualRelationsDto)
  relations?: RitualRelationsDto;
}

import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { BaseFilterDto } from "src/common/base/dto/base-filter.dto";
import { MediaType } from "src/common/enums/media.enum";

export class FilterRitualMediaDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'Type of media',
    example: MediaType.IMAGE,
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;
  @ApiPropertyOptional({
    description: 'URL of the media',
    example: 'http://example.com/media.jpg',
    default: 'http://example.com/media.jpg',
  })
  @IsOptional()
  @IsString()
  url?: string;
  @ApiPropertyOptional({
    description: 'Alt text for the media',
    example: 'An example image',
    default: 'An example image',
  })
  @IsOptional()
  @IsString()
  alt?: string;
  @ApiPropertyOptional({
    description: 'ID of the associated ritual',
    example: '550e8400-e29b-41d4-a716-446655440000',
    default: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  ritualId?: string;
}

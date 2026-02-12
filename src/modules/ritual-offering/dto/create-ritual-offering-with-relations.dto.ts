import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { MediaType } from 'src/common/enums/media.enum';
import { CreateRitualOfferingDto } from './create-ritual-offering.dto';
import { Type } from 'class-transformer';

export class OfferingMediasDto {
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
    example: 'https://example.com/offering-image.jpg',
    format: 'url',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({
    description: 'Alt text for the media',
    example: 'Hình ảnh mâm cúng 5 món hoa quả',
    required: false,
  })
  @IsOptional()
  @IsString()
  alt?: string;
}

export class RitualOfferingRelationsDto {
  @ApiProperty({
    description: 'List of media associated with the offering',
    type: [OfferingMediasDto],
    required: false,
    example: [
      {
        type: MediaType.IMAGE,
        url: 'https://example.com/offering-image.jpg',
        alt: 'Hình ảnh mâm cúng 5 món hoa quả',
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OfferingMediasDto)
  offeringMedias?: OfferingMediasDto[];
}

export class CreateRitualOfferingWithRelationsDto {
  @ApiProperty({
    description: 'Details of the offering to create',
    example:
      '{ "name": "Bánh chưng", "description": "Bánh chưng truyền thống" }',
  })
  @ValidateNested()
  @Type(() => CreateRitualOfferingDto)
  ritualOffering: CreateRitualOfferingDto;

  @ApiProperty({
    description: 'Related entities for the offering',
    required: false,
    type: RitualOfferingRelationsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RitualOfferingRelationsDto)
  relations?: RitualOfferingRelationsDto;
}

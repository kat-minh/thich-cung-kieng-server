import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { MediaType } from 'src/common/enums/media.enum';
import { UpdateRitualOfferingDto } from './update-ritual-offering.dto';
import { Type } from 'class-transformer';

export class UpdateRitualOfferingMediasDto {
  @ApiProperty({
    description: 'ID of the media (for existing media, omit for new)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  id?: string;

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

export class UpdateOfferingRelationsDto {
  @ApiProperty({
    description:
      'List of media associated with the offering. Include existing media with IDs to update, omit IDs for new media, exclude from array to delete.',
    type: [UpdateRitualOfferingMediasDto],
    required: false,
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: MediaType.IMAGE,
        url: 'https://example.com/updated-offering-image.jpg',
        alt: 'Hình ảnh mâm cúng được cập nhật',
      },
      {
        type: MediaType.VIDEO,
        url: 'https://example.com/new-offering-video.mp4',
        alt: 'Video mới về mâm cúng',
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateRitualOfferingMediasDto)
  offeringMedias?: UpdateRitualOfferingMediasDto[];
}

export class UpdateRitualOfferingWithRelationsDto {
  @ApiProperty({
    description: 'Details of the offering to update',
    required: false,
    example:
      '{ "name": "Bánh chưng cải tiến", "description": "Bánh chưng truyền thống với hương vị mới", "price": 60000 }',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRitualOfferingDto)
  ritualOffering: UpdateRitualOfferingDto;

  @ApiProperty({
    description: 'Related entities for the offering to update',
    required: false,
    type: UpdateOfferingRelationsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateOfferingRelationsDto)
  relations?: UpdateOfferingRelationsDto;
}

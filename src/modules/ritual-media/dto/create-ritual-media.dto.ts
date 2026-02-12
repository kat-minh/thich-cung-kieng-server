import { IsEnum, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from 'src/common/enums/media.enum';

export class CreateRitualMediaDto {
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

  @ApiProperty({
    description: 'ID of the ritual this media belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  ritualId: string;
}

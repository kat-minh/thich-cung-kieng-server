import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    description: 'Name of the tag',
    example: 'Lễ cúng',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the tag',
    example: 'Tag dành cho các bài viết về lễ cúng',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

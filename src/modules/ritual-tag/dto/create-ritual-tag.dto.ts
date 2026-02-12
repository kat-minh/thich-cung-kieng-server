import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRitualTagDto {
  @ApiProperty({
    description: 'ID of the ritual',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  ritualId: string;

  @ApiProperty({
    description: 'ID of the tag',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID()
  tagId: string;
}

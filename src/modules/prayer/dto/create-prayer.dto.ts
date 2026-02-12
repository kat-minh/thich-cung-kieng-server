import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrayerDto {
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

  @ApiProperty({
    description: 'ID of the ritual this prayer belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  ritualId: string;
}

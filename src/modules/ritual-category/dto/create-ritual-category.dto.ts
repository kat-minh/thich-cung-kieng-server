import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRitualCategoryDto {
  @ApiProperty({
    description: 'Name of the ritual category',
    example: 'Lễ cúng tổ tiên',
  })
  @IsString()
  name: string;
}

import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRitualOfferingDto {
  @ApiProperty({
    description: 'Name of the offering',
    example: 'Hoa quả 5 món',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the offering',
    example: 'Hoa quả tươi gồm: táo, cam, chuối, xoài, nho',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

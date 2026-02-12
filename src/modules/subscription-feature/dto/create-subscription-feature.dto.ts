import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionFeatureDto {
  @ApiProperty({
    description: 'Name of the subscription feature',
    example: 'Truy cập không giới hạn',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the subscription feature',
    example: 'Truy cập tất cả nội dung mà không bị giới hạn số lần xem',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

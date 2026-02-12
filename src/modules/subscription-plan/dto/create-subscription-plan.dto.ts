import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    description: 'Name of the subscription plan',
    example: 'Gói Premium',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description of the subscription plan',
    example: 'Gói cao cấp với đầy đủ tính năng và hỗ trợ ưu tiên',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price of the subscription plan (VND)',
    example: 299000,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Duration of the plan in days',
    example: 30,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNumber()
  durationDays: number;
}

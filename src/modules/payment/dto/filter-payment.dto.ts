import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';
import { PaymentStatus } from 'src/common/enums/payment.enum';

export class FilterPaymentDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'ID of the user who made the payment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userId?: string;
  @ApiPropertyOptional({
    description: 'ID of the associated user subscription',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userSubscriptionId?: string;
  @ApiPropertyOptional({
    description: 'Status of the payment',
    example: PaymentStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
  @ApiPropertyOptional({
    description: 'Payment provider (e.g., Stripe, PayPal)',
    example: 'Stripe',
  })
  @IsOptional()
  @IsString()
  provider?: string;
}

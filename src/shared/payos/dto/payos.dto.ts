import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  IsEmail,
  IsUrl,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentItemDto {
  @ApiProperty({ description: 'Item name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Item quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Item price' })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order code', example: 123456 })
  @IsNotEmpty()
  orderCode: number;

  @ApiProperty({ description: 'Payment amount', example: 100000 })
  @IsNumber()
  @Min(1000) // Minimum 1,000 VND
  @Max(100000000000) // Maximum 100,000,000,000 VND
  amount: number;

  @ApiProperty({ description: 'Payment description' })
  @IsNotEmpty()
  @Length(1, 25)
  @IsString()
  description: string;

  @ApiProperty({ description: 'Return URL after successful payment' })
  @IsNotEmpty()
  @IsUrl()
  returnUrl: string;

  @ApiProperty({ description: 'Cancel URL after cancelled payment' })
  @IsNotEmpty()
  @IsUrl()
  cancelUrl: string;

  @ApiPropertyOptional({ description: 'Payment items', type: [PaymentItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items?: PaymentItemDto[];

  @ApiPropertyOptional({ description: 'Buyer name' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ description: 'Buyer email' })
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  @ApiPropertyOptional({ description: 'Buyer phone' })
  @IsOptional()
  @IsString()
  buyerPhone?: string;

  @ApiPropertyOptional({ description: 'Buyer address' })
  @IsOptional()
  @IsString()
  buyerAddress?: string;

  @ApiPropertyOptional({ description: 'Payment expiration timestamp' })
  @IsOptional()
  @IsNumber()
  expiredAt?: number;
}

export class CreateSubscriptionPaymentDto {
  @ApiProperty({ description: 'Subscription plan ID', example: 'plan_123' })
  @IsNotEmpty()
  @IsString()
  planId: string;

  @ApiPropertyOptional({
    description: 'Return URL sau khi thanh toán thành công',
  })
  @IsOptional()
  @IsUrl()
  returnUrl?: string;

  @ApiPropertyOptional({ description: 'Cancel URL sau khi hủy thanh toán' })
  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Order code' })
  @IsNumber()
  orderCode: number;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Payment description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ description: 'Payment reference' })
  @IsString()
  reference: string;

  @ApiProperty({ description: 'Transaction date time' })
  @IsString()
  transactionDateTime: string;

  @ApiProperty({ description: 'Currency code' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Payment link ID' })
  @IsString()
  paymentLinkId: string;

  @ApiProperty({ description: 'Status code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Status description' })
  @IsString()
  desc: string;

  @ApiPropertyOptional({ description: 'Counter account bank ID' })
  @IsOptional()
  @IsString()
  counterAccountBankId?: string;

  @ApiPropertyOptional({ description: 'Counter account bank name' })
  @IsOptional()
  @IsString()
  counterAccountBankName?: string;

  @ApiPropertyOptional({ description: 'Counter account name' })
  @IsOptional()
  @IsString()
  counterAccountName?: string;

  @ApiPropertyOptional({ description: 'Counter account number' })
  @IsOptional()
  @IsString()
  counterAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Virtual account name' })
  @IsOptional()
  @IsString()
  virtualAccountName?: string;

  @ApiPropertyOptional({ description: 'Virtual account number' })
  @IsOptional()
  @IsString()
  virtualAccountNumber?: string;
}

export class CancelPaymentDto {
  @ApiProperty({ description: 'Order code to cancel' })
  @IsNotEmpty()
  orderCode: number;

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BatchCancelPaymentDto {
  @ApiProperty({ description: 'Array of order codes to cancel' })
  @IsArray()
  @IsNotEmpty({ each: true })
  orderCodes: number[];

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BatchCheckStatusDto {
  @ApiProperty({ description: 'Array of order codes to check' })
  @IsArray()
  @IsNotEmpty({ each: true })
  orderCodes: number[];
}

export class ConfirmWebhookDto {
  @ApiProperty({ description: 'Webhook URL to confirm' })
  @IsNotEmpty()
  @IsUrl()
  webhookUrl: string;
}

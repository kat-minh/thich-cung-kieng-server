import {
  IsUUID,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { PaymentStatus } from 'src/common/enums/payment.enum';

export class CreatePaymentDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  userSubscriptionId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalAmount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @IsOptional()
  @IsString()
  transactionCode?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentLogDto } from './create-payment-log.dto';

export class UpdatePaymentLogDto extends PartialType(CreatePaymentLogDto) {}

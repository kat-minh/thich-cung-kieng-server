import { Injectable } from '@nestjs/common';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { PaymentStrategy } from './interfaces/payment-strategy.interface';
import { PayosPaymentStrategy } from './strategies/payos-payment.strategy';
import { CheckoutRequest } from 'src/shared/payos/dto/payos-payment-request.dto';
import { PaymentService } from './payment.service';
import { PaymentLogService } from '../payment-log/payment-log.service';
import { WebhookData } from '@payos/node';
import { PaymentResultResponseDto } from './dto/payment-result-response.dto';
import { PaymentStatus } from 'src/common/enums/payment.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentOrchestratorService {
  private readonly strategies = new Map<PaymentProvider, PaymentStrategy>();

  constructor(
    private readonly payosStrategy: PayosPaymentStrategy,
    private readonly paymentService: PaymentService,
    private readonly paymentLogService: PaymentLogService,
  ) {
    this.strategies.set(PaymentProvider.PAYOS, payosStrategy);
    // Add other payment strategies here
  }

  async createPaymentLink(
    provider: PaymentProvider,
    paymentLinkRequest: any,
    paymentRequest: CreatePaymentDto,
  ): Promise<PaymentResultResponseDto> {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider not supported: ${provider}`);
    }
    const payment = await this.paymentService.create({
      userId: paymentRequest.userId,
      userSubscriptionId: paymentRequest.userSubscriptionId,
      totalAmount: paymentRequest.totalAmount,
      currency: paymentRequest.currency,
      provider: provider,
      transactionCode: paymentLinkRequest.orderCode.toString(),
      status: PaymentStatus.PENDING,
    });

    const paymentLog = await this.paymentLogService.create({
      paymentId: payment.id,
      status: PaymentStatus.PENDING,
      description: `Payment initiated for subscription plan`,
    });
    const providerResult = await strategy.createPaymentLink(paymentLinkRequest);

    const result: PaymentResultResponseDto = {
      payment: payment,
      paymentLog: paymentLog,
      providerResult: providerResult,
    };
    return result;
  }

  async cancelPayment(
    provider: PaymentProvider,
    orderCode: number,
    reason?: string,
  ): Promise<void> {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider not supported: ${provider}`);
    }
    return strategy.cancelPayment(orderCode, reason);
  }

  async verifyWebhook(
    provider: PaymentProvider,
    webhookData: WebhookData,
  ): Promise<boolean> {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider not supported: ${provider}`);
    }
    return strategy.verifyWebhook(webhookData);
  }

    async checkPaymentStatus(
    provider: PaymentProvider,
    orderCode: number,
  ): Promise<any> {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider not supported: ${provider}`);
    }
    return strategy.checkPaymentStatus(orderCode);
  }
}

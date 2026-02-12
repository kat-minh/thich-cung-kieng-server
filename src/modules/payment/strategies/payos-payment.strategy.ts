import { Injectable } from "@nestjs/common";
import { Webhook, WebhookData } from "@payos/node";
import { PaymentStatusResult } from "src/modules/payment/interfaces/payment-status-result.interface";
import { PaymentStrategy } from "src/modules/payment/interfaces/payment-strategy.interface";
import { CheckoutRequest } from "src/shared/payos/dto/payos-payment-request.dto";
import { CheckoutResponse } from "src/shared/payos/dto/payos-payment-response.dto";
import { PayosService } from "src/shared/payos/payos.service";


@Injectable()
export class PayosPaymentStrategy implements PaymentStrategy {
    constructor(private readonly payosService: PayosService) {}
    async createPaymentLink(data: CheckoutRequest): Promise<CheckoutResponse> {
        return await this.payosService.createPaymentLink(data);
    }
    async verifyWebhook(data: Webhook): Promise<boolean> {
        return await this.payosService.verifyWebhook(data);
    }
    async checkPaymentStatus(orderCode: number): Promise<PaymentStatusResult> {
        return await this.payosService.checkPaymentStatus(orderCode);
    }
    async cancelPayment(orderCode: number, reason?: string): Promise<void> {
        return await this.payosService.cancelPaymentLink(orderCode, reason);
    }
}
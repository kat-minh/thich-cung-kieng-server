export interface PaymentStrategy {
  createPaymentLink(data: any): Promise<any>;
  verifyWebhook(data: any): Promise<boolean>;
  checkPaymentStatus(orderCode: any): Promise<any>;
  cancelPayment(orderCode: any, reason?: string): Promise<void>;
}
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PayosService } from './payos.service';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../../modules/payment/payment.service';
import { PaymentLogService } from '../../modules/payment-log/payment-log.service';
import { UserSubscriptionService } from '../../modules/user-subscription/user-subscription.service';
import { SubscriptionPlanService } from '../../modules/subscription-plan/subscription-plan.service';
import { UserService } from '../../modules/user/user.service';
import { PaymentStatus } from '../../common/enums/payment.enum';
import { PaymentProvider } from '../../common/enums/payment-provider.enum';
import { UserSubscriptionStatus } from '../../common/enums/user-subscription.enum';

@Injectable()
export class PayosIntegrationService {
  private readonly logger = new Logger(PayosIntegrationService.name);

  constructor(
    private readonly payosService: PayosService,
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly paymentLogService: PaymentLogService,
    private readonly userSubscriptionService: UserSubscriptionService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly userService: UserService,
  ) {}

  /**
   * Generate unique order code
   */
  private generateOrderCode(): number {
    const timestamp = Date.now(); // milliseconds since epoch
    const random = Math.floor(Math.random() * 1000);
    return timestamp + random;
  }

  /**
   * Get default return and cancel URLs
   */
  private getDefaultUrls() {
    const clientUrl =
      this.configService.get<string>('server.clientUrl') ||
      'http://localhost:3000';

    const serverUrl =
      this.configService.get<string>('server.serverUrl') ||
      'http://localhost:3000';
    return {
      returnUrl: `${clientUrl}/payment/success`,
      cancelUrl: `${serverUrl}/api/payos/payment-cancel-callback`,
    };
  }

  /**
   * Build payment URLs with orderCode for cancel callback
   */
  private buildPaymentUrls(orderCode: number, options: { returnUrl?: string; cancelUrl?: string }) {
    if (options.returnUrl && options.cancelUrl) {
      return { 
        returnUrl: options.returnUrl, 
        cancelUrl: options.cancelUrl 
      };
    }
    
    const defaultUrls = this.getDefaultUrls();
    return {
      returnUrl: defaultUrls.returnUrl,
      cancelUrl: `${defaultUrls.cancelUrl}/${orderCode}`,
    };
  }

  /**
   * Find existing pending payment for user and plan
   */
  private async findPendingPaymentForPlan(userId: string, planId: string) {
    try {
      // Get all payments for the user with pending status
      const payments = await this.paymentService.findAll(
        { page: 1, limit: 100 },
        ['userSubscription', 'userSubscription.subscriptionPlan'],
        ['id'],
      );

      // Find pending payment for this user and plan
      const pendingPayment = payments?.data?.find(
        (payment) =>
          payment.userId === userId &&
          payment.status === PaymentStatus.PENDING &&
          payment.provider === PaymentProvider.PAYOS &&
          payment.userSubscription?.subscriptionPlanId === planId,
      );

      if (pendingPayment) {
        return {
          payment: pendingPayment,
          userSubscription: pendingPayment.userSubscription,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Error finding pending payment for user ${userId} and plan ${planId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Check if user already has active subscription for the same plan
   */
  private async checkActiveSubscriptionForPlan(userId: string, planId: string) {
    try {
      // Get user's active subscriptions for this specific plan
      const subscription = await this.userSubscriptionService.findOneByOptions(
        {
          userId,
          subscriptionPlanId: planId,
          status: UserSubscriptionStatus.ACTIVE,
        },
        ['subscriptionPlan'],
      );

      return subscription || null;
    } catch (error) {
      this.logger.error(
        `Error checking active subscription for user ${userId} and plan ${planId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Assign free plan to user
   */
  private async assignFreePlanToUser(userId: string) {
    try {
      // Find free plan (assuming it has price = 0)
      const freePlan = await this.subscriptionPlanService.findOneByOptions({
        price: 0,
      });

      if (freePlan) {
        const userSubscription = await this.userSubscriptionService.create({
          userId,
          subscriptionPlanId: freePlan.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          status: UserSubscriptionStatus.ACTIVE,
          autoRenew: false,
        });

        this.logger.log(
          `Assigned free plan ${freePlan.name} to user: ${userId}`,
        );
        return userSubscription;
      } else {
        this.logger.warn(`No free plan found to assign to user: ${userId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to assign free plan to user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Restore previous subscription after payment cancellation
   * This method tries to restore the most recent valid subscription
   * or assigns free plan if no valid subscription exists
   */
  private async restorePreviousSubscriptionAfterCancel(userId: string) {
    try {
      this.logger.log(
        `[RESTORE SUBSCRIPTION] Starting restoration process for user: ${userId} after payment cancellation`,
      );

      // Find the most recent subscription that is not pending (could be active, expired, or canceled)
      // We want to restore the subscription that was active before user tried to upgrade
      const allUserSubscriptions =
        await this.userSubscriptionService.findAllByOptions({ userId });

      if (!allUserSubscriptions || allUserSubscriptions.length === 0) {
        this.logger.log(
          `[RESTORE SUBSCRIPTION] No previous subscriptions found for user: ${userId}, assigning free plan`,
        );
        await this.assignFreePlanToUser(userId);
        return;
      }

      this.logger.log(`[RESTORE SUBSCRIPTION] Found ${allUserSubscriptions.length} total subscriptions for user: ${userId}`);

      // Filter out pending subscriptions and sort by creation date (most recent first)
      const eligibleSubscriptions = allUserSubscriptions
        .filter(
          (sub) =>
            sub.status !== UserSubscriptionStatus.PENDING && !sub.deletedAt,
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      this.logger.log(`[RESTORE SUBSCRIPTION] Found ${eligibleSubscriptions.length} eligible subscriptions (non-pending, non-deleted) for user: ${userId}`);

      if (eligibleSubscriptions.length === 0) {
        this.logger.log(
          `[RESTORE SUBSCRIPTION] No eligible subscriptions to restore for user: ${userId}, assigning free plan`,
        );
        await this.assignFreePlanToUser(userId);
        return;
      }

      // Find the most recent subscription that is still valid (not expired)
      const now = new Date();
      let subscriptionToRestore: any = null;

      for (const subscription of eligibleSubscriptions) {
        this.logger.log(`[RESTORE SUBSCRIPTION] Checking subscription: ID=${subscription.id}, Status=${subscription.status}, EndDate=${subscription.endDate}`);
        
        // Check if subscription is still valid (not expired)
        if (subscription.endDate && subscription.endDate > now) {
          subscriptionToRestore = subscription;
          this.logger.log(`[RESTORE SUBSCRIPTION] Found valid subscription to restore: ID=${subscription.id}`);
          break;
        } else {
          this.logger.log(`[RESTORE SUBSCRIPTION] Subscription ${subscription.id} is expired (EndDate: ${subscription.endDate})`);
        }
      }

      if (subscriptionToRestore) {
        // Restore the valid subscription
        await this.userSubscriptionService.update(subscriptionToRestore.id, {
          status: UserSubscriptionStatus.ACTIVE,
        });

        this.logger.log(
          `[RESTORE SUBSCRIPTION] Successfully restored valid subscription ${subscriptionToRestore.id} for user: ${userId}`,
        );
      } else {
        // No valid subscription found, assign free plan
        this.logger.log(
          `[RESTORE SUBSCRIPTION] No valid (non-expired) subscriptions found for user: ${userId}, assigning free plan`,
        );
        await this.assignFreePlanToUser(userId);
      }
    } catch (error) {
      this.logger.error(
        `Failed to restore previous subscription for user ${userId}: ${error.message}`,
      );
      // If restoration fails, try to assign free plan as fallback
      try {
        await this.assignFreePlanToUser(userId);
      } catch (fallbackError) {
        this.logger.error(
          `Failed to assign free plan as fallback for user ${userId}: ${fallbackError.message}`,
        );
      }
    }
  }

  /**
   * Create subscription payment with business context
   */
  async createSubscriptionPayment(
    planId: string,
    userId: string,
    options: {
      returnUrl?: string;
      cancelUrl?: string;
    },
  ) {
    try {
      // Get plan and user data from real services
      const plan = await this.subscriptionPlanService.findOne(planId);
      const user = await this.userService.findOne(userId);

      if (!plan) {
        throw new NotFoundException(
          `Subscription plan with ID ${planId} not found`,
        );
      }

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const orderCode = this.generateOrderCode();
      
      // Build URLs with orderCode for cancel callback
      const urls = this.buildPaymentUrls(orderCode, options);

      this.logger.log(
        `Creating subscription payment for user: ${user.email}, plan: ${plan.name}`,
      );

      // Check if user already has active subscription for this plan FIRST
      const activeSubscription = await this.checkActiveSubscriptionForPlan(
        userId,
        planId,
      );

      if (activeSubscription) {
        this.logger.warn(
          `User ${user.email} already has active subscription for plan: ${plan.name}`,
        );
        throw new BadRequestException(
          `Bạn đã có gói subscription ${plan.name} đang hoạt động. Không thể mua lại cùng gói subscription.`,
        );
      }

      this.logger.log(
        `User has no duplicate subscription for plan: ${plan.name}, proceeding with payment creation`,
      );

      // Check if user already has a pending payment for this plan
      const existingPendingPayment = await this.findPendingPaymentForPlan(
        userId,
        planId,
      );

      if (existingPendingPayment) {
        this.logger.log(
          `Found existing pending payment for user: ${user.email}, plan: ${plan.name}`,
        );

        // PayOS getPaymentInfo doesn't return checkoutUrl/qrCode for existing payments
        // So we need to cancel the old one and create new payment
        this.logger.log('Cancelling existing payment and creating new one...');

        try {
          // Cancel the old pending payment in PayOS
          const existingOrderCode = parseInt(
            existingPendingPayment.payment.transactionCode,
          );
          await this.payosService.cancelPaymentLink(
            existingOrderCode,
            'Creating new payment link',
          );
        } catch (error) {
          this.logger.warn(
            `Failed to cancel old PayOS payment link: ${error.message}`,
          );
        }

        // Cancel the old pending payment in our system
        await this.paymentService.update(existingPendingPayment.payment.id, {
          status: PaymentStatus.CANCELLED,
        });

        await this.paymentLogService.create({
          paymentId: existingPendingPayment.payment.id,
          status: PaymentStatus.CANCELLED,
          description: 'Payment cancelled to create new payment link',
        });

        await this.userSubscriptionService.update(
          existingPendingPayment.userSubscription.id,
          {
            status: UserSubscriptionStatus.CANCELED,
          },
        );

        this.logger.log(
          'Old payment cancelled, proceeding to create new payment',
        );
      }

      // Create UserSubscription first (PENDING status)
      const userSubscription = await this.userSubscriptionService.create({
        userId,
        subscriptionPlanId: planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
        status: UserSubscriptionStatus.PENDING,
        autoRenew: false,
      });

      // Create Payment record
      const payment = await this.paymentService.create({
        userId,
        userSubscriptionId: userSubscription.id,
        totalAmount: plan.price,
        currency: 'VND',
        provider: PaymentProvider.PAYOS,
        transactionCode: orderCode.toString(),
        status: PaymentStatus.PENDING,
      });

      // Create initial payment log
      await this.paymentLogService.create({
        paymentId: payment.id,
        status: PaymentStatus.PENDING,
        description: `Payment initiated for subscription plan: ${plan.name}`,
      });

      // Create PayOS payment link
      const paymentResult = await this.payosService.createSubscriptionPayment(
        orderCode,
        plan.name,
        plan.price,
        user.email,
        urls.returnUrl,
        urls.cancelUrl,
      );

      return {
        orderCode,
        paymentId: payment.id,
        userSubscriptionId: userSubscription.id,
        paymentLink: paymentResult.checkoutUrl,
        qrCode: paymentResult.qrCode,
        planInfo: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          durationDays: plan.durationDays,
        },
        userInfo: {
          id: user.id,
          email: user.email,
        },
        paymentInfo: paymentResult,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create subscription payment: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Handle payment webhook with business logic
   */
  async handlePaymentWebhook(webhookData: any) {
    try {
      this.logger.log(
        `Processing payment webhook for order: ${webhookData.orderCode}`,
      );

      // Verify webhook signature
      const verification = await this.payosService.handleWebhook(webhookData);

      if (!verification.isValid) {
        this.logger.warn(
          `Invalid webhook signature for order: ${webhookData.orderCode}`,
        );
        return { success: false, message: 'Invalid webhook signature' };
      }

      const { data } = verification;

      if (!data) {
        this.logger.error('Webhook data is undefined');
        return { success: false, message: 'Invalid webhook data' };
      }

      // Determine payment type from order code
      const orderCode = data.orderCode;

      if (orderCode) {
        await this.handleSubscriptionPayment(data);
      } else {
        this.logger.warn(`Unknown payment type for order: ${orderCode}`);
      }

      // Update payment status in database
      // Example: await this.paymentLogService.updateByOrderCode(orderCode, {
      //   status: data.code === '00' ? 'PAID' : 'FAILED',
      //   paidAt: data.code === '00' ? new Date() : null,
      //   failureReason: data.code !== '00' ? data.desc : null,
      // });

      return { success: true, paymentType: 'SUBSCRIPTION', data };
    } catch (error) {
      this.logger.error(`Failed to handle payment webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle successful subscription payment
   */
  private async handleSubscriptionPayment(webhookData: any) {
    try {
      const orderCode = webhookData.orderCode.toString();

      // Find payment by transaction code (order code)
      const payment = await this.paymentService.findOneByOptions({
        transactionCode: orderCode,
      });

      if (!payment) {
        this.logger.warn(`Payment not found for order code: ${orderCode}`);
        return;
      }

      // *** IDEMPOTENCY CHECK: Skip if payment already processed ***
      this.logger.log(`Payment ${orderCode} current status: ${payment.status}`);

      if (payment.status === PaymentStatus.COMPLETED) {
        this.logger.log(
          `Payment ${orderCode} already completed, skipping webhook processing`,
        );
        return;
      }

      if (payment.status === PaymentStatus.FAILED) {
        this.logger.log(
          `Payment ${orderCode} already failed, skipping webhook processing`,
        );
        return;
      }

      if (webhookData.code === '00') {
        // Success
        this.logger.log(
          `Processing subscription payment success: ${orderCode}`,
        );

        // Update payment status to COMPLETED
        await this.paymentService.update(payment.id, {
          status: PaymentStatus.COMPLETED,
        });

        // Create payment log for completion
        await this.paymentLogService.create({
          paymentId: payment.id,
          status: PaymentStatus.COMPLETED,
          description: `Payment completed successfully via PayOS. Reference: ${webhookData.reference}`,
        });

        // Get the user subscription info to find userId
        const userSubscription = await this.userSubscriptionService.findOne(
          payment.userSubscriptionId,
        );

        if (userSubscription) {
          // Deactivate all other subscriptions for this user (excluding the current one)
          await this.userSubscriptionService.deactivateOtherSubscriptions(
            userSubscription.userId,
            userSubscription.id,
          );
        }

        // Activate user subscription
        await this.userSubscriptionService.update(payment.userSubscriptionId, {
          status: UserSubscriptionStatus.ACTIVE,
        });

        this.logger.log(
          `Subscription activated for user subscription ID: ${payment.userSubscriptionId}`,
        );

        // TODO: Send confirmation email
        // await this.mailService.sendSubscriptionConfirmation(userEmail);
      } else if (
        webhookData.code === '02' ||
        webhookData.desc?.toLowerCase().includes('cancel')
      ) {
        // Payment cancelled by user or timeout
        this.logger.log(
          `Processing subscription payment cancellation: ${orderCode} - ${webhookData.desc}`,
        );

        // Update payment status to CANCELLED
        await this.paymentService.update(payment.id, {
          status: PaymentStatus.CANCELLED,
        });

        // Create payment log for cancellation
        await this.paymentLogService.create({
          paymentId: payment.id,
          status: PaymentStatus.CANCELLED,
          description: `Payment cancelled via PayOS. Reason: ${webhookData.desc}`,
        });

        // Cancel the user subscription that was pending
        await this.userSubscriptionService.update(payment.userSubscriptionId, {
          status: UserSubscriptionStatus.CANCELED,
        });

        // Get the user subscription info to find userId and restore previous subscription
        const userSubscription = await this.userSubscriptionService.findOne(
          payment.userSubscriptionId,
        );

        if (userSubscription) {
          await this.restorePreviousSubscriptionAfterCancel(
            userSubscription.userId,
          );
        }

        this.logger.log(
          `Payment cancelled - attempting to restore previous subscription for user`,
        );
      } else {
        this.logger.warn(
          `Subscription payment failed: ${orderCode} - ${webhookData.desc}`,
        );

        // Update payment status to FAILED
        await this.paymentService.update(payment.id, {
          status: PaymentStatus.FAILED,
        });

        // Create payment log for failure
        await this.paymentLogService.create({
          paymentId: payment.id,
          status: PaymentStatus.FAILED,
          description: `Payment failed: ${webhookData.desc}`,
        });

        // Update user subscription to CANCELED
        await this.userSubscriptionService.update(payment.userSubscriptionId, {
          status: UserSubscriptionStatus.CANCELED,
        });

        this.logger.log(
          `Payment failed - user subscription ${payment.userSubscriptionId} canceled. User's existing subscriptions remain active.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle subscription payment: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Check payment status and update business logic
   */
  async checkAndUpdatePaymentStatus(orderCode: number) {
    try {
      const status = await this.payosService.checkPaymentStatus(orderCode);

      if (status.isPaid) {
        // Get payment info for webhook simulation
        const paymentInfo = await this.payosService.getPaymentInfo(orderCode);

        // Simulate webhook data for manual status updates
        const webhookData = {
          orderCode: orderCode,
          amount: paymentInfo.amount,
          description: paymentInfo.description,
          accountNumber: paymentInfo.accountNumber || '',
          reference: paymentInfo.reference || orderCode,
          transactionDateTime: new Date().toISOString(),
          currency: paymentInfo.currency || 'VND',
          paymentLinkId: paymentInfo.paymentLinkId || '',
          code: '00', // Success code
          desc: 'Payment completed successfully',
        };

        // Process as webhook
        await this.handlePaymentWebhook(webhookData);
      }

      return status;
    } catch (error) {
      this.logger.error(`Failed to check payment status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get detailed subscription payment information
   */
  async getSubscriptionPaymentDetails(paymentId: string) {
    try {
      // Get payment with relations
      const payment = await this.paymentService.findOne(paymentId, [
        'userSubscription',
        'userSubscription.subscriptionPlan',
        'user',
        'paymentLogs',
      ]);

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }

      return {
        payment: {
          id: payment.id,
          totalAmount: payment.totalAmount,
          currency: payment.currency,
          provider: payment.provider,
          transactionCode: payment.transactionCode,
          status: payment.status,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        },
        subscription: payment.userSubscription
          ? {
              id: payment.userSubscription.id,
              startDate: payment.userSubscription.startDate,
              endDate: payment.userSubscription.endDate,
              status: payment.userSubscription.status,
              autoRenew: payment.userSubscription.autoRenew,
              plan: payment.userSubscription.subscriptionPlan
                ? {
                    id: payment.userSubscription.subscriptionPlan.id,
                    name: payment.userSubscription.subscriptionPlan.name,
                    description:
                      payment.userSubscription.subscriptionPlan.description,
                    price: payment.userSubscription.subscriptionPlan.price,
                    durationDays:
                      payment.userSubscription.subscriptionPlan.durationDays,
                  }
                : null,
            }
          : null,
        user: payment.user
          ? {
              id: payment.user.id,
              email: payment.user.email,
              // Add other safe user fields as needed
            }
          : null,
        paymentLogs:
          payment.paymentLogs?.map((log) => ({
            id: log.id,
            status: log.status,
            description: log.description,
            createdAt: log.createdAt,
          })) || [],
      };
    } catch (error) {
      this.logger.error(
        `Failed to get subscription payment details: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get user's subscription payments
   */
  async getUserSubscriptionPayments(userId: string) {
    try {
      // Get all payments for the user with PayOS provider
      const payments = await this.paymentService.findAll(
        { page: 1, limit: 100 }, // Basic filter
        ['userSubscription', 'userSubscription.subscriptionPlan'],
        [],
      );

      // Filter by userId and provider
      const userPayments =
        payments?.data?.filter(
          (payment) =>
            payment.userId === userId &&
            payment.provider === PaymentProvider.PAYOS,
        ) || [];

      return userPayments.map((payment) => ({
        id: payment.id,
        totalAmount: payment.totalAmount,
        currency: payment.currency,
        transactionCode: payment.transactionCode,
        status: payment.status,
        createdAt: payment.createdAt,
        subscription: payment.userSubscription
          ? {
              id: payment.userSubscription.id,
              startDate: payment.userSubscription.startDate,
              endDate: payment.userSubscription.endDate,
              status: payment.userSubscription.status,
              plan: payment.userSubscription.subscriptionPlan
                ? {
                    name: payment.userSubscription.subscriptionPlan.name,
                    price: payment.userSubscription.subscriptionPlan.price,
                    durationDays:
                      payment.userSubscription.subscriptionPlan.durationDays,
                  }
                : null,
            }
          : null,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get user subscription payments: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Cancel a pending payment by orderCode
   */
  async cancelSubscriptionPayment(orderCode: string, reason?: string) {
    try {
      // Find payment by transaction code (order code)
      const payment = await this.paymentService.findOneByOptions({
        transactionCode: orderCode,
      });

      if (!payment) {
        throw new NotFoundException(`Payment with order code ${orderCode} not found`);
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Can only cancel pending payments');
      }

      // Try to cancel with PayOS if possible
      try {
        await this.payosService.cancelPaymentLink(
          parseInt(orderCode),
          reason,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to cancel PayOS payment link: ${error.message}`,
        );
        // Continue with local cancellation even if PayOS cancellation fails
      }

      // Update payment status
      const updatedPayment = await this.paymentService.update(payment.id, {
        status: PaymentStatus.CANCELLED,
      });

      // Log the cancellation
      await this.paymentLogService.create({
        paymentId: payment.id,
        status: PaymentStatus.CANCELLED,
        description: reason || 'Payment cancelled by user',
      });

      // Cancel the associated user subscription
      if (payment.userSubscriptionId) {
        await this.userSubscriptionService.update(payment.userSubscriptionId, {
          status: UserSubscriptionStatus.CANCELED,
        });

        // Get the user subscription info to find userId and restore previous subscription
        const userSubscription = await this.userSubscriptionService.findOne(payment.userSubscriptionId);
        
        if (userSubscription) {
          await this.restorePreviousSubscriptionAfterCancel(userSubscription.userId);
        }

        this.logger.log(
          `Payment cancelled - user subscription ${payment.userSubscriptionId} canceled and previous subscription restored.`
        );
      }

      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription payment: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get payment statistics for a user
   */
  async getUserPaymentStats(userId: string) {
    try {
      const payments = await this.paymentService.findAll({}, [], []);

      const userPayments =
        payments?.data?.filter(
          (payment) =>
            payment.userId === userId &&
            payment.provider === PaymentProvider.PAYOS,
        ) || [];

      const stats = {
        totalPayments: userPayments.length,
        successfulPayments: userPayments.filter(
          (p) => p.status === PaymentStatus.COMPLETED,
        ).length,
        pendingPayments: userPayments.filter(
          (p) => p.status === PaymentStatus.PENDING,
        ).length,
        failedPayments: userPayments.filter(
          (p) => p.status === PaymentStatus.FAILED,
        ).length,
        cancelledPayments: userPayments.filter(
          (p) => p.status === PaymentStatus.CANCELLED,
        ).length,
        totalAmount: userPayments
          .filter((p) => p.status === PaymentStatus.COMPLETED)
          .reduce((sum, p) => sum + p.totalAmount, 0),
        lastPaymentDate:
          userPayments.length > 0
            ? userPayments
                .map((p) => new Date(p.createdAt))
                .sort((a, b) => b.getTime() - a.getTime())[0]
                .toISOString()
            : null,
      };

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get user payment stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle payment timeout (for pending payments that have been pending too long)
   * This method should be called periodically (e.g., via cron job)
   */
  async handlePendingPaymentTimeouts() {
    try {
      this.logger.log('Checking for timed out pending payments...');

      // Consider payments that have been pending for more than 30 minutes as timed out
      const timeoutThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

      // Find all pending payments that are older than threshold
      const allPayments = await this.paymentService.findAllByOptions({
        status: PaymentStatus.PENDING,
      });

      const timedOutPayments = (allPayments || []).filter(
        (payment) => payment.createdAt < timeoutThreshold,
      );

      this.logger.log(
        `Found ${timedOutPayments.length} timed out payments to process`,
      );

      for (const payment of timedOutPayments) {
        try {
          this.logger.log(`Processing timeout for payment: ${payment.id}`);

          // Update payment status to FAILED
          await this.paymentService.update(payment.id, {
            status: PaymentStatus.FAILED,
          });

          // Create payment log for timeout
          await this.paymentLogService.create({
            paymentId: payment.id,
            status: PaymentStatus.FAILED,
            description:
              'Payment timed out - no response received within 30 minutes',
          });

          // Cancel the associated user subscription
          if (payment.userSubscriptionId) {
            await this.userSubscriptionService.update(
              payment.userSubscriptionId,
              {
                status: UserSubscriptionStatus.CANCELED,
              },
            );

            this.logger.log(
              `Payment timed out - user subscription ${payment.userSubscriptionId} canceled. User's existing subscriptions remain active.`,
            );
          }

          this.logger.log(
            `Successfully processed timeout for payment: ${payment.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process timeout for payment ${payment.id}: ${error.message}`,
          );
        }
      }

      return {
        processedCount: timedOutPayments.length,
        timedOutPayments: timedOutPayments.map((p) => p.id),
      };
    } catch (error) {
      this.logger.error(
        `Failed to handle pending payment timeouts: ${error.message}`,
      );
      throw error;
    }
  }
}

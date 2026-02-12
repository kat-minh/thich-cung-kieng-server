import { SubscriptionPlan } from 'src/modules/subscription-plan/entities/subscription-plan.entity';
import { Injectable, Logger } from '@nestjs/common';
import { UserSubscriptionService } from '../../user-subscription/user-subscription.service';
import { UserSubscriptionStatus } from 'src/common/enums/user-subscription.enum';
import { SubscriptionPlanService } from 'src/modules/subscription-plan/subscription-plan.service';
import { ILike } from 'typeorm';

@Injectable()
export class SubscriptionCheckService {
  private readonly logger = new Logger(SubscriptionCheckService.name);

  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  /**
   * Check and update user subscription status on login
   * @param userId - The user ID to check subscription for
   * @returns Object containing subscription status and details
   */
  async checkUserSubscriptionOnLogin(userId: string): Promise<any> {
    try {
      this.logger.log(`Checking subscription for user: ${userId}`);

      // Get user's subscriptions directly by userId
      this.logger.log(`Looking for subscription with userId: ${userId}`);
      const userSubscriptions =
        await this.userSubscriptionService.findOneByOptions({ userId }, [
          'subscriptionPlan',
          'subscriptionPlan.planFeatures',
          'subscriptionPlan.planFeatures.subscriptionFeature',
        ]);
      if (!userSubscriptions) {
        this.logger.log(`No subscriptions found for user: ${userId}`);
        this.logger.log(`Assigning free plan to user: ${userId}`);
        const assignedFreePlan = await this.assignFreePlanToUser(userId);
        return {
          hasActiveSubscription: true,
          subscriptionStatus: UserSubscriptionStatus.ACTIVE,
          subscriptionDetails: {
            id: assignedFreePlan.assigned?.id,
            startDate: null,
            endDate: null,
            plan: assignedFreePlan.plan
              ? {
                  name: assignedFreePlan.plan.name,
                  price: assignedFreePlan.plan.price,
                }
              : null,
            daysRemaining: null,
          },
          message: 'Free plan assigned',
        };
      }

      // Check for active subscriptions
      if (userSubscriptions.status === UserSubscriptionStatus.ACTIVE) {
        // If subscription plan is not loaded, try to load it separately
        if (
          !userSubscriptions.subscriptionPlan &&
          userSubscriptions.subscriptionPlanId
        ) {
          this.logger.log(
            `Subscription plan not loaded, fetching separately for planId: ${userSubscriptions.subscriptionPlanId}`,
          );
          const subscriptionPlan =
            await this.subscriptionPlanService.findOneByOptions({
              id: userSubscriptions.subscriptionPlanId,
            });
          if (subscriptionPlan) {
            userSubscriptions.subscriptionPlan = subscriptionPlan;
            this.logger.log(
              `Successfully loaded subscription plan: ${subscriptionPlan.name}`,
            );
          } else {
            this.logger.warn(
              `Subscription plan not found for id: ${userSubscriptions.subscriptionPlanId}`,
            );
          }
        }

        // Check for expired subscriptions that need to be updated
        const now = new Date();
        if (
          userSubscriptions.startDate &&
          userSubscriptions.endDate &&
          userSubscriptions.endDate < now
        ) {
          this.logger.log(
            `Updating expired subscription: ${userSubscriptions.id}`,
          );
          await this.userSubscriptionService.update(userSubscriptions.id, {
            status: UserSubscriptionStatus.EXPIRED,
          });
          return {
            hasActiveSubscription: false,
            subscriptionStatus: UserSubscriptionStatus.EXPIRED,
            subscriptionDetails: null,
            message: 'No active subscription found',
          };
        }
        this.logger.log(
          `Subscription is still active: ${userSubscriptions.id}`,
        );
        return {
          hasActiveSubscription: true,
          subscriptionStatus: UserSubscriptionStatus.ACTIVE,
          subscriptionDetails: {
            id: userSubscriptions.id,
            startDate: userSubscriptions.startDate
              ? userSubscriptions.startDate
              : null,
            endDate: userSubscriptions.endDate
              ? userSubscriptions.endDate
              : null,
            plan: userSubscriptions.subscriptionPlan
              ? {
                  name: userSubscriptions.subscriptionPlan.name,
                  price: userSubscriptions.subscriptionPlan.price,
                }
              : null,
            daysRemaining: userSubscriptions.endDate
              ? this.calculateDaysRemaining(userSubscriptions.endDate)
              : null,
          },
          message: 'Active subscription found',
        };
      }

      if (userSubscriptions.status === UserSubscriptionStatus.PENDING) {
        return {
          hasActiveSubscription: false,
          subscriptionStatus: UserSubscriptionStatus.PENDING,
          subscriptionDetails: {
            id: userSubscriptions.id,
            status: userSubscriptions.status,
            plan: userSubscriptions.subscriptionPlan
              ? {
                  name: userSubscriptions.subscriptionPlan.name,
                  price: userSubscriptions.subscriptionPlan.price,
                }
              : null,
          },
          message: 'Subscription payment pending',
        };
      }

      // User has only expired/canceled subscriptions
      return {
        hasActiveSubscription: false,
        subscriptionStatus: UserSubscriptionStatus.EXPIRED,
        subscriptionDetails: null,
        message: 'No active subscription found',
      };
    } catch (error) {
      this.logger.error(
        `Error checking subscription for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async assignFreePlanToUser(userId: string): Promise<any> {
    const freePlan = await this.subscriptionPlanService.findOneByOptions({
      name: ILike('%free%'),
    });
    if (!freePlan) {
      throw new Error('Free plan not found in the system');
    }
    const assignFreePlan = await this.userSubscriptionService.create({
      userId,
      status: UserSubscriptionStatus.ACTIVE,
      subscriptionPlanId: freePlan.id,
    });
    if (!assignFreePlan) {
      throw new Error('Failed to assign free plan to user');
    }
    return {
      plan: freePlan,
      assigned: assignFreePlan,
    };
  }

  private calculateDaysRemaining(endDate: Date): number {
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }
}

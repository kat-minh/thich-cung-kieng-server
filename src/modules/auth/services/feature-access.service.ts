import { Injectable, Logger } from '@nestjs/common';
import { UserSubscriptionService } from 'src/modules/user-subscription/user-subscription.service';
import { UserSubscriptionStatus } from 'src/common/enums/user-subscription.enum';

export interface FeatureAccessResult {
  hasAccess: boolean;
  reason?: string;
  userPlan?: string;
  requiredFeature?: string;
  userFeatures?: string[];
}

@Injectable()
export class FeatureAccessService {
  private readonly logger = new Logger(FeatureAccessService.name);

  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  /**
   * Kiểm tra xem user có quyền truy cập vào một tính năng cụ thể hay không
   * @param userId - ID của user
   * @param requiredFeature - Tên tính năng cần thiết
   * @returns FeatureAccessResult
   */
  async checkFeatureAccess(
    userId: string,
    requiredFeature: string,
  ): Promise<FeatureAccessResult> {
    try {
      this.logger.log(
        `Checking feature access for user ${userId}, feature: ${requiredFeature}`,
      );

      // Lấy thông tin subscription của user với đầy đủ relations
      const userSubscription =
        await this.userSubscriptionService.findOneByOptions({ userId }, [
          'subscriptionPlan',
          'subscriptionPlan.planFeatures',
          'subscriptionPlan.planFeatures.subscriptionFeature',
        ]);

      if (!userSubscription) {
        this.logger.warn(`No subscription found for user ${userId}`);
        return {
          hasAccess: false,
          reason: 'No subscription found',
          requiredFeature,
        };
      }

      // Kiểm tra trạng thái subscription
      if (userSubscription.status !== UserSubscriptionStatus.ACTIVE) {
        this.logger.warn(
          `User ${userId} has inactive subscription: ${userSubscription.status}`,
        );
        return {
          hasAccess: false,
          reason: `Subscription is ${userSubscription.status}`,
          requiredFeature,
          userPlan: userSubscription.subscriptionPlan?.name,
        };
      }

      // Kiểm tra subscription có hết hạn không
      if (userSubscription.endDate && userSubscription.endDate < new Date()) {
        this.logger.warn(`User ${userId} subscription has expired`);
        return {
          hasAccess: false,
          reason: 'Subscription has expired',
          requiredFeature,
          userPlan: userSubscription.subscriptionPlan?.name,
        };
      }

      // Lấy danh sách features mà user có
      const userFeatures = this.getUserFeatures(userSubscription);
      
      this.logger.log(
        `User ${userId} has features: ${userFeatures.join(', ')}`,
      );

      // Kiểm tra xem user có feature cần thiết không
      const hasFeature = userFeatures.includes(requiredFeature);

      if (hasFeature) {
        this.logger.log(
          `User ${userId} has access to feature: ${requiredFeature}`,
        );
        return {
          hasAccess: true,
          userPlan: userSubscription.subscriptionPlan?.name,
          userFeatures,
        };
      } else {
        this.logger.warn(
          `User ${userId} does not have access to feature: ${requiredFeature}`,
        );
        return {
          hasAccess: false,
          reason: 'Feature not included in current plan',
          requiredFeature,
          userPlan: userSubscription.subscriptionPlan?.name,
          userFeatures,
        };
      }
    } catch (error) {
      this.logger.error(
        `Error checking feature access for user ${userId}: ${error.message}`,
      );
      return {
        hasAccess: false,
        reason: 'Error checking feature access',
        requiredFeature,
      };
    }
  }

  /**
   * Kiểm tra xem user có quyền truy cập vào nhiều tính năng hay không (cần tất cả)
   * @param userId - ID của user
   * @param requiredFeatures - Danh sách tính năng cần thiết
   * @returns FeatureAccessResult
   */
  async checkMultipleFeatureAccess(
    userId: string,
    requiredFeatures: string[],
  ): Promise<FeatureAccessResult> {
    this.logger.log(
      `Checking multiple feature access for user ${userId}, features: ${requiredFeatures.join(', ')}`,
    );

    for (const feature of requiredFeatures) {
      const result = await this.checkFeatureAccess(userId, feature);
      if (!result.hasAccess) {
        return result;
      }
    }

    return {
      hasAccess: true,
      userFeatures: await this.getUserAllFeatures(userId),
    };
  }

  /**
   * Kiểm tra xem user có quyền truy cập vào ít nhất một trong các tính năng hay không
   * @param userId - ID của user
   * @param requiredFeatures - Danh sách tính năng (cần ít nhất một cái)
   * @returns FeatureAccessResult
   */
  async checkAnyFeatureAccess(
    userId: string,
    requiredFeatures: string[],
  ): Promise<FeatureAccessResult> {
    this.logger.log(
      `Checking any feature access for user ${userId}, features: ${requiredFeatures.join(', ')}`,
    );

    let lastResult: FeatureAccessResult | null = null;

    for (const feature of requiredFeatures) {
      const result = await this.checkFeatureAccess(userId, feature);
      lastResult = result;
      if (result.hasAccess) {
        return result;
      }
    }

    return (
      lastResult || {
        hasAccess: false,
        reason: 'No features available',
      }
    );
  }

  /**
   * Lấy danh sách tất cả features mà user hiện tại có
   * @param userId - ID của user
   * @returns Danh sách tên features
   */
  async getUserAllFeatures(userId: string): Promise<string[]> {
    try {
      const userSubscription =
        await this.userSubscriptionService.findOneByOptions({ userId }, [
          'subscriptionPlan',
          'subscriptionPlan.planFeatures',
          'subscriptionPlan.planFeatures.subscriptionFeature',
        ]);

      if (!userSubscription) {
        return [];
      }

      return this.getUserFeatures(userSubscription);
    } catch (error) {
      this.logger.error(
        `Error getting user features for user ${userId}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Helper method để extract features từ userSubscription object
   * @param userSubscription - UserSubscription object với relations
   * @returns Danh sách tên features
   */
  private getUserFeatures(userSubscription: any): string[] {
    if (
      !userSubscription?.subscriptionPlan?.planFeatures ||
      !Array.isArray(userSubscription.subscriptionPlan.planFeatures)
    ) {
      return [];
    }

    return userSubscription.subscriptionPlan.planFeatures
      .map((planFeature: any) => planFeature.subscriptionFeature?.name)
      .filter((name: string) => name); // Loại bỏ undefined/null values
  }
}
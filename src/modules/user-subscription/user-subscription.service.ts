import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { UserSubscription } from './entities/user-subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterUserSubsciptionDto } from './dto/filter-user-subscription.dto';
import { UserSubscriptionStatus } from 'src/common/enums/user-subscription.enum';

@Injectable()
export class UserSubscriptionService extends BaseService<UserSubscription> {
  protected readonly logger = new Logger(UserSubscriptionService.name);

  constructor(
    @InjectRepository(UserSubscription, 'postgresql')
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    private readonly redisService: RedisService,
  ) {
    super(userSubscriptionRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['user', 'subscriptionPlan', 'payment'];
  }

  protected getSearchableFields(): string[] {
    return [];
  }

  protected createQueryBuilder(
    filters: FilterUserSubsciptionDto,
  ): SelectQueryBuilder<UserSubscription> {
    const aliasName = UserSubscription.name.toLowerCase();
    const queryBuilder = this.userSubscriptionRepository
      .createQueryBuilder(`${aliasName}`)
      .where(`${aliasName}.deletedAt IS NULL`);

    if (filters?.userId) {
      queryBuilder.andWhere(`${aliasName}.userId = :userId`, {
        userId: filters.userId,
      });
    }

    if (filters?.subscriptionPlanId) {
      queryBuilder.andWhere(
        `${aliasName}.subscriptionPlanId = :subscriptionPlanId`,
        { subscriptionPlanId: filters.subscriptionPlanId },
      );
    }

    if (filters?.status) {
      queryBuilder.andWhere(`${aliasName}.status = :status`, {
        status: filters.status,
      });
    }

    if (filters?.autoRenew !== undefined) {
      queryBuilder.andWhere(`${aliasName}.autoRenew = :autoRenew`, {
        autoRenew: filters.autoRenew,
      });
    }

    return queryBuilder;
  }

  /**
   * Deactivate all other active or pending subscriptions for a user
   * This ensures user only has one active subscription at a time
   * @param userId - The user ID to deactivate subscriptions for
   * @param excludeSubscriptionId - Optional subscription ID to exclude from deactivation
   */
  async deactivateOtherSubscriptions(
    userId: string,
    excludeSubscriptionId?: string,
  ): Promise<{ deactivatedCount: number; deactivatedSubscriptions: string[] }> {
    try {
      this.logger.log(`Deactivating other subscriptions for user: ${userId}`);

      // Find all active or pending subscriptions for this user
      const queryBuilder = this.userSubscriptionRepository
        .createQueryBuilder('userSubscription')
        .where('userSubscription.userId = :userId', { userId })
        .andWhere('userSubscription.deletedAt IS NULL')
        .andWhere(
          'userSubscription.status IN (:...statuses)',
          { 
            statuses: [
              UserSubscriptionStatus.ACTIVE, 
              UserSubscriptionStatus.PENDING
            ] 
          }
        );

      // Exclude specific subscription if provided
      if (excludeSubscriptionId) {
        queryBuilder.andWhere('userSubscription.id != :excludeId', {
          excludeId: excludeSubscriptionId,
        });
      }

      const subscriptionsToDeactivate = await queryBuilder.getMany();

      if (subscriptionsToDeactivate.length === 0) {
        this.logger.log(`No subscriptions to deactivate for user: ${userId}`);
        return { deactivatedCount: 0, deactivatedSubscriptions: [] };
      }

      // Update all found subscriptions to CANCELED status
      const subscriptionIds = subscriptionsToDeactivate.map(sub => sub.id);
      
      await this.userSubscriptionRepository
        .createQueryBuilder()
        .update(UserSubscription)
        .set({ 
          status: UserSubscriptionStatus.CANCELED,
          updatedAt: new Date(),
          updatedBy: 'system'
        })
        .where('id IN (:...ids)', { ids: subscriptionIds })
        .execute();

      this.logger.log(
        `Successfully deactivated ${subscriptionsToDeactivate.length} subscriptions for user: ${userId}`,
        { deactivatedSubscriptions: subscriptionIds }
      );

      return {
        deactivatedCount: subscriptionsToDeactivate.length,
        deactivatedSubscriptions: subscriptionIds,
      };
    } catch (error) {
      this.logger.error(
        `Failed to deactivate subscriptions for user ${userId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Restore previously deactivated subscriptions when payment is cancelled
   * @param userId - The user ID to restore subscriptions for 
   * @param deactivatedSubscriptionIds - Array of subscription IDs that were deactivated
   */
  async restoreDeactivatedSubscriptions(
    userId: string,
    deactivatedSubscriptionIds: string[],
  ): Promise<{ restoredCount: number; restoredSubscriptions: string[] }> {
    try {
      this.logger.log(`Restoring deactivated subscriptions for user: ${userId}`);

      if (!deactivatedSubscriptionIds || deactivatedSubscriptionIds.length === 0) {
        this.logger.log(`No subscriptions to restore for user: ${userId}`);
        return { restoredCount: 0, restoredSubscriptions: [] };
      }

      // Find the subscriptions that were deactivated and still exist
      const subscriptionsToRestore = await this.userSubscriptionRepository
        .createQueryBuilder('userSubscription')
        .where('userSubscription.userId = :userId', { userId })
        .andWhere('userSubscription.id IN (:...ids)', { ids: deactivatedSubscriptionIds })
        .andWhere('userSubscription.status = :status', { status: UserSubscriptionStatus.CANCELED })
        .andWhere('userSubscription.deletedAt IS NULL')
        .getMany();

      if (subscriptionsToRestore.length === 0) {
        this.logger.log(`No valid subscriptions to restore for user: ${userId}`);
        return { restoredCount: 0, restoredSubscriptions: [] };
      }

      // Check if any of these subscriptions are still valid (not expired)
      const now = new Date();
      const validSubscriptions = subscriptionsToRestore.filter(sub => 
        sub.endDate && sub.endDate > now
      );

      if (validSubscriptions.length === 0) {
        this.logger.log(`No valid (non-expired) subscriptions to restore for user: ${userId}`);
        return { restoredCount: 0, restoredSubscriptions: [] };
      }

      // Restore the most recent valid subscription
      const mostRecentSubscription = validSubscriptions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      await this.userSubscriptionRepository
        .createQueryBuilder()
        .update(UserSubscription)
        .set({ 
          status: UserSubscriptionStatus.ACTIVE,
          updatedAt: new Date(),
          updatedBy: 'system'
        })
        .where('id = :id', { id: mostRecentSubscription.id })
        .execute();

      this.logger.log(
        `Successfully restored subscription ${mostRecentSubscription.id} for user: ${userId}`
      );

      return {
        restoredCount: 1,
        restoredSubscriptions: [mostRecentSubscription.id],
      };
    } catch (error) {
      this.logger.error(
        `Failed to restore subscriptions for user ${userId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}

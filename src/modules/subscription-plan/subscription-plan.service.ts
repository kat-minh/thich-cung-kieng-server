import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterSubscriptionPlanDto } from './dto/filter-subscription-plan.dto';
import { SubscriptionFeatureService } from '../subscription-feature/subscription-feature.service';
import { PlanFeatureService } from '../plan-feature/plan-feature.service';

@Injectable()
export class SubscriptionPlanService extends BaseService<SubscriptionPlan> {
  constructor(
    @InjectRepository(SubscriptionPlan, 'postgresql')
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
    private readonly redisService: RedisService,
    private readonly subscriptionFeatureService: SubscriptionFeatureService,
    private readonly planFeatureService: PlanFeatureService,
  ) {
    super(subscriptionPlanRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return ['name'];
  }

  protected getDefaultRelations(): string[] {
    return [
      'userSubscriptions',
      'planFeatures',
      'planFeatures.subscriptionFeature',
    ];
  }

  protected getSearchableFields(): string[] {
    return ['name', 'description'];
  }

  protected createQueryBuilder(
    filter: FilterSubscriptionPlanDto,
  ): SelectQueryBuilder<SubscriptionPlan> {
    const aliasName = SubscriptionPlan.name.toLowerCase();
    const queryBuilder =
      this.subscriptionPlanRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.name) {
      queryBuilder.andWhere(`${aliasName}.name ILIKE :name`, {
        name: `%${filter.name}%`,
      });
    }

    if (filter.description) {
      queryBuilder.andWhere(`${aliasName}.description ILIKE :description`, {
        description: `%${filter.description}%`,
      });
    }

    if (filter.price) {
      queryBuilder.andWhere(`${aliasName}.price = :price`, {
        price: filter.price,
      });
    }

    if (filter.durationDays) {
      queryBuilder.andWhere(`${aliasName}.durationDays = :durationDays`, {
        durationDays: filter.durationDays,
      });
    }
    return queryBuilder;
  }

  protected async createRelationships(
    manager: EntityManager,
    mainEntity: SubscriptionPlan,
    relationData?: Record<string, any>,
  ): Promise<void> {
    if (relationData?.planFeatures?.length) {
      // First validate all features exist
      for (const feature of relationData.planFeatures) {
        const isFeatureExist = await this.subscriptionFeatureService.findOne(
          feature.subscriptionFeatureId,
        );
        if (!isFeatureExist) {
          throw new BadRequestException(
            `Feature with id ${feature.subscriptionFeatureId} does not exist`,
          );
        }
        this.logger.log(
          `Feature ${feature.subscriptionFeatureId} validation passed`,
        );
      }

      // Then create plan-feature relationships
      const promises: Promise<any>[] = [];
      for (const feature of relationData.planFeatures) {
        const planFeatureData = {
          subscriptionPlanId: mainEntity.id,
          subscriptionFeatureId: feature.subscriptionFeatureId,
        };
        this.logger.log(`Creating plan-feature:`, planFeatureData);
        promises.push(this.planFeatureService.create(planFeatureData));
      }

      if (promises.length > 0) {
        const results = await Promise.all(promises);
        this.logger.log(
          `Successfully created ${results.length} plan-feature relationships`,
        );
      }
    } else {
      this.logger.log('No planFeatures to create');
    }
  }

  protected async updateRelationships(
    manager: EntityManager,
    mainEntity: SubscriptionPlan,
    relationData?: Record<string, any>,
  ): Promise<void> {
    const promises: Promise<any>[] = [];

    // Smart feature updates - only change what's different
    if (relationData?.planFeatures) {
      const existingFeatures = await this.planFeatureService.findAllByOptions({
        subscriptionPlanId: mainEntity.id,
      });
      const inputFeatures = relationData.planFeatures;

      // Create maps for easy lookup
      const existingMap = new Map(
        (existingFeatures ?? []).map((o) => [o.subscriptionFeatureId, o]),
      );
      const inputMap = new Map(
        inputFeatures.map((o) => [o.subscriptionFeatureId, o]),
      );

      // Find what to add, update, and remove
      const toAdd = inputFeatures.filter(
        (input) => !existingMap.has(input.subscriptionFeatureId),
      );
      const toRemove = (existingFeatures ?? []).filter(
        (existing) => !inputMap.has(existing.subscriptionFeatureId),
      );

      // Execute changes
      for (const feature of toAdd) {
        promises.push(
          this.planFeatureService.create({
            subscriptionPlanId: mainEntity.id,
            subscriptionFeatureId: feature.subscriptionFeatureId,
          }),
        );
      }

      for (const feature of toRemove) {
        promises.push(
          this.planFeatureService.remove(feature.subscriptionFeatureId),
        );
      }
    }
    if (promises.length > 0) {
      await Promise.all(promises);
      this.logger.log(
        `Optimized update completed: ${promises.length} operations`,
      );
    }
  }
}

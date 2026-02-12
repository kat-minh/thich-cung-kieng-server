import { Injectable } from '@nestjs/common';
import { CreatePlanFeatureDto } from './dto/create-plan-feature.dto';
import { UpdatePlanFeatureDto } from './dto/update-plan-feature.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanFeature } from './entities/plan-feature.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { BaseService } from 'src/common/base/service/service.base';
import { FilterPlanFeatureDto } from './dto/filter-plan-feature.dto';

@Injectable()
export class PlanFeatureService extends BaseService<PlanFeature> {
  constructor(
    @InjectRepository(PlanFeature, 'postgresql')
    private readonly planFeatureRepository: Repository<PlanFeature>,
    private readonly redisService: RedisService,
  ) {
    super(planFeatureRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['subscriptionPlan', 'subscriptionFeature'];
  }

  protected getSearchableFields(): string[] {
    return ['subscriptionPlanId', 'subscriptionFeatureId'];
  }

  protected createQueryBuilder(
    filter: FilterPlanFeatureDto,
  ): SelectQueryBuilder<PlanFeature> {
    const aliasName = PlanFeature.name.toLowerCase();
    const queryBuilder =
      this.planFeatureRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.subscriptionPlanId) {
      queryBuilder.andWhere(
        `${aliasName}.subscriptionPlanId = :subscriptionPlanId`,
        {
          subscriptionPlanId: filter.subscriptionPlanId,
        },
      );
    }

    if (filter.subscriptionFeatureId) {
      queryBuilder.andWhere(
        `${aliasName}.subscriptionFeatureId = :subscriptionFeatureId`,
        {
          subscriptionFeatureId: filter.subscriptionFeatureId,
        },
      );
    }

    return queryBuilder;
  }
}

import { Injectable } from '@nestjs/common';
import { CreateSubscriptionFeatureDto } from './dto/create-subscription-feature.dto';
import { UpdateSubscriptionFeatureDto } from './dto/update-subscription-feature.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionFeature } from './entities/subscription-feature.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { BaseService } from 'src/common/base/service/service.base';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

@Injectable()
export class SubscriptionFeatureService extends BaseService<SubscriptionFeature> {
  constructor(
    @InjectRepository(SubscriptionFeature, 'postgresql')
    private readonly subscriptionFeatureRepository: Repository<SubscriptionFeature>,
    private readonly redisService: RedisService,
  ) {
    super(subscriptionFeatureRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return ['name'];
  }

  protected getDefaultRelations(): string[] {
    return ['planFeatures'];
  }

  protected getSearchableFields(): string[] {
    return ['name', 'description'];
  }

  protected createQueryBuilder(
    filter: BaseFilterDto,
  ): SelectQueryBuilder<SubscriptionFeature> {
    const aliasName = SubscriptionFeature.name.toLowerCase();
    const queryBuilder =
      this.subscriptionFeatureRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    return queryBuilder;
  }
}

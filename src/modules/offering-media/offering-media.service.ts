import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { OfferingMedia } from './entities/offering-media.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterOfferingMediaDto } from './dto/filter-offering-media.dto';

@Injectable()
export class OfferingMediaService extends BaseService<OfferingMedia> {
  constructor(
    @InjectRepository(OfferingMedia, 'postgresql')
    private readonly offeringMediaRepository: Repository<OfferingMedia>,
    private readonly redisService: RedisService,
  ) {
    super(offeringMediaRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['offering'];
  }

  protected getSearchableFields(): string[] {
    return ['url', 'alt'];
  }

  protected createQueryBuilder(
    filter: FilterOfferingMediaDto,
  ): SelectQueryBuilder<OfferingMedia> {
    const aliasName = OfferingMedia.name.toLowerCase();
    const queryBuilder =
      this.offeringMediaRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.url) {
      queryBuilder.andWhere(`${aliasName}.url ILIKE :url`, {
        url: `%${filter.url}%`,
      });
    }

    if (filter.alt) {
      queryBuilder.andWhere(`${aliasName}.alt ILIKE :alt`, {
        alt: `%${filter.alt}%`,
      });
    }

    if (filter.type) {
      queryBuilder.andWhere(`${aliasName}.type = :type`, {
        type: filter.type,
      });
    }

    if (filter.offeringId) {
      queryBuilder.andWhere(`${aliasName}.offeringId = :offeringId`, {
        offeringId: filter.offeringId,
      });
    }

    return queryBuilder;
  }
}

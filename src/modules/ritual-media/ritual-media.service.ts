import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { RitualMedia } from './entities/ritual-media.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterRitualMediaDto } from './dto/filter-ritual-media.dto';

@Injectable()
export class RitualMediaService extends BaseService<RitualMedia> {
  constructor(
    @InjectRepository(RitualMedia, 'postgresql')
    private readonly ritualMediaRepository: Repository<RitualMedia>,
    private readonly redisService: RedisService,
  ) {
    super(ritualMediaRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['ritual'];
  }

  protected getSearchableFields(): string[] {
    return ['url', 'alt'];
  }

  protected createQueryBuilder(
    filter: FilterRitualMediaDto,
  ): SelectQueryBuilder<RitualMedia> {
    const aliasName = RitualMedia.name.toLowerCase();
    const queryBuilder =
      this.ritualMediaRepository.createQueryBuilder(aliasName);

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

    if (filter.ritualId) {
      queryBuilder.andWhere(`${aliasName}.ritualId = :ritualId`, {
        ritualId: filter.ritualId,
      });
    }

    return queryBuilder;
  }
}

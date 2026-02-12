import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { RitualTag } from './entities/ritual-tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterRitualTagDto } from './dto/filter-ritual-tag.dto';

@Injectable()
export class RitualTagService extends BaseService<RitualTag> {
  constructor(
    @InjectRepository(RitualTag, 'postgresql')
    private readonly ritualTagRepository: Repository<RitualTag>,
    private readonly redisService: RedisService,
  ) {
    super(ritualTagRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['ritual', 'tag'];
  }

  protected getSearchableFields(): string[] {
    return [];
  }

  protected createQueryBuilder(
    filter: FilterRitualTagDto,
  ): SelectQueryBuilder<RitualTag> {
    const aliasName = RitualTag.name.toLowerCase();
    const queryBuilder = this.ritualTagRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.ritualId) {
      queryBuilder.andWhere(`${aliasName}.ritualId = :ritualId`, {
        ritualId: filter.ritualId,
      });
    }

    if (filter.tagId) {
      queryBuilder.andWhere(`${aliasName}.tagId = :tagId`, {
        tagId: filter.tagId,
      });
    }

    return queryBuilder;
  }
}

import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { Prayer } from './entities/prayer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterPrayerDto } from './dto/filter-prayer.dto';

@Injectable()
export class PrayerService extends BaseService<Prayer> {
  constructor(
    @InjectRepository(Prayer, 'postgresql')
    private readonly prayerRepository: Repository<Prayer>,
    private readonly redisService: RedisService,
  ) {
    super(prayerRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return ['name'];
  }

  protected getDefaultRelations(): string[] {
    return ['ritual'];
  }

  protected getSearchableFields(): string[] {
    return ['name', 'content', 'description'];
  }

  protected createQueryBuilder(
    filter: FilterPrayerDto,
  ): SelectQueryBuilder<Prayer> {
    const aliasName = Prayer.name.toLowerCase();
    const queryBuilder = this.prayerRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.name) {
      queryBuilder.andWhere(`${aliasName}.name ILIKE :name`, {
        name: `%${filter.name}%`,
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

import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { RitualCategory } from './entities/ritual-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterRitualCategoryDto } from './dto/filter-ritual-category.dto';

@Injectable()
export class RitualCategoryService extends BaseService<RitualCategory> {
  constructor(
    @InjectRepository(RitualCategory, 'postgresql')
    private readonly ritualCategoryRepository: Repository<RitualCategory>,
    private readonly redisService: RedisService,
  ) {
    super(ritualCategoryRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return ['name'];
  }

  protected getDefaultRelations(): string[] {
    return ['rituals'];
  }

  protected getSearchableFields(): string[] {
    return ['name'];
  }

  protected createQueryBuilder(
    filter: FilterRitualCategoryDto,
  ): SelectQueryBuilder<RitualCategory> {
    const aliasName = RitualCategory.name.toLowerCase();
    const queryBuilder =
      this.ritualCategoryRepository.createQueryBuilder(aliasName);

    // Apply filters if provided
    if (filter.name) {
      queryBuilder.andWhere(`${aliasName}.name ILIKE :name`, {
        name: `%${filter.name}%`,
      });
    }
    return queryBuilder;
  }
}

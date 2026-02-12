import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

@Injectable()
export class TagService extends BaseService<Tag> {
  constructor(
    @InjectRepository(Tag, 'postgresql')
    private readonly tagRepository: Repository<Tag>,
    private readonly redisService: RedisService,
  ) {
    super(tagRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return ['name'];
  }

  protected getDefaultRelations(): string[] {
    return ['ritualTags', 'ritualTags.ritual'];
  }

  protected getSearchableFields(): string[] {
    return ['name'];
  }

  protected createQueryBuilder(filter: any): SelectQueryBuilder<Tag> {
    const aliasName = Tag.name.toLowerCase();
    const queryBuilder = this.tagRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    return queryBuilder;
  }
}

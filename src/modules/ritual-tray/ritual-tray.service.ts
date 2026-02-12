import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { BaseService } from 'src/common/base/service/service.base';
import { RitualTray } from './entities/ritual-tray.entity';

@Injectable()
export class RitualTrayService extends BaseService<RitualTray> {
  constructor(
    @InjectRepository(RitualTray, 'postgresql')
    private readonly ritualTrayRepository: Repository<RitualTray>,
    private readonly redisService: RedisService,
  ) {
    super(ritualTrayRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }
  protected getDefaultRelations(): string[] {
    return ['user', 'rituals', 'rituals.prayers', 'rituals.offerings'];
  }
  protected getSearchableFields(): string[] {
    return ['name'];
  }

  protected createQueryBuilder() {
    const aliasName = RitualTray.name.toLowerCase();
    const queryBuilder =
      this.ritualTrayRepository.createQueryBuilder(aliasName);
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);
    return queryBuilder;
  }
}

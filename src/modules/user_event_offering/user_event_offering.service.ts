import { Injectable } from '@nestjs/common';
import { CreateUserEventOfferingDto } from './dto/create-user_event_offering.dto';
import { UpdateUserEventOfferingDto } from './dto/update-user_event_offering.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEventOffering } from './entities/user_event_offering.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { BaseService } from 'src/common/base/service/service.base';

@Injectable()
export class UserEventOfferingService extends BaseService<UserEventOffering> {
  constructor(
    @InjectRepository(UserEventOffering, 'postgresql')
    private readonly userEventOfferingRepository: Repository<UserEventOffering>,
    private readonly redisService: RedisService,
  ) {
    super(userEventOfferingRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['userEvent'];
  }

  protected getSearchableFields(): string[] {
    return ['offeringName', 'note'];
  }

  protected createQueryBuilder(
    filters?: any,
  ): SelectQueryBuilder<UserEventOffering> {
    const aliasName = UserEventOffering.name.toLowerCase();
    const queryBuilder = this.userEventOfferingRepository
      .createQueryBuilder(`${aliasName}`)
      .where(`${aliasName}.deletedAt IS NULL`);

    if (filters?.userEventId) {
      queryBuilder.andWhere(`${aliasName}.userEventId = :userEventId`, {
        userEventId: filters.userEventId,
      });
    }

    if (filters?.offeringName) {
      queryBuilder.andWhere(`${aliasName}.offeringName ILIKE :offeringName`, {
        offeringName: `%${filters.offeringName}%`,
      });
    }

    return queryBuilder;
  }
}

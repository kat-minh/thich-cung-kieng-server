import { Injectable } from '@nestjs/common';
import { CreateUserEventReminderDto } from './dto/create-user_event_reminder.dto';
import { UpdateUserEventReminderDto } from './dto/update-user_event_reminder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEventReminder } from './entities/user_event_reminder.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { BaseService } from 'src/common/base/service/service.base';

@Injectable()
export class UserEventReminderService extends BaseService<UserEventReminder> {
  constructor(
    @InjectRepository(UserEventReminder, 'postgresql')
    private readonly userEventReminderRepository: Repository<UserEventReminder>,
    private readonly redisService: RedisService,
  ) {
    super(userEventReminderRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['userEvent'];
  }

  protected getSearchableFields(): string[] {
    return ['status', 'notifyMethod'];
  }

  protected createQueryBuilder(
    filters?: any,
  ): SelectQueryBuilder<UserEventReminder> {
    const aliasName = UserEventReminder.name.toLowerCase();
    const queryBuilder = this.userEventReminderRepository
      .createQueryBuilder(`${aliasName}`)
      .where(`${aliasName}.deletedAt IS NULL`);

    if (filters?.userEventId) {
      queryBuilder.andWhere(`${aliasName}.userEventId = :userEventId`, {
        userEventId: filters.userEventId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere(`${aliasName}.status = :status`, {
        status: filters.status,
      });
    }

    if (filters?.notifyMethod) {
      queryBuilder.andWhere(`${aliasName}.notifyMethod = :notifyMethod`, {
        notifyMethod: filters.notifyMethod,
      });
    }

    return queryBuilder;
  }
}

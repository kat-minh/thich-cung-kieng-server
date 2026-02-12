import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User, 'postgresql')
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {
    super(userRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return ['email'];
  }

  protected getDefaultRelations(): string[] {
    return ['userSubscriptions', 'chatSession'];
  }

  protected getSearchableFields(): string[] {
    return ['email', 'fullName', 'phone'];
  }

  protected createQueryBuilder(filter: any): SelectQueryBuilder<User> {
    const aliasName = User.name.toLowerCase();
    const queryBuilder = this.userRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.email) {
      queryBuilder.andWhere(`${aliasName}.email ILIKE :email`, {
        email: `%${filter.email}%`,
      });
    }

    if (filter.fullName) {
      queryBuilder.andWhere(`${aliasName}.fullName ILIKE :fullName`, {
        fullName: `%${filter.fullName}%`,
      });
    }

    if (filter.phone) {
      queryBuilder.andWhere(`${aliasName}.phone ILIKE :phone`, {
        phone: `%${filter.phone}%`,
      });
    }

    if (filter.role) {
      queryBuilder.andWhere(`${aliasName}.role = :role`, {
        role: filter.role,
      });
    }

    return queryBuilder;
  }
}

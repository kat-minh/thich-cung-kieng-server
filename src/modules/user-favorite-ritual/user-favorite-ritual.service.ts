import { Injectable } from '@nestjs/common';
import { CreateUserFavoriteRitualDto } from './dto/create-user-favorite-ritual.dto';
import { UpdateUserFavoriteRitualDto } from './dto/update-user-favorite-ritual.dto';
import { UserFavoriteRitual } from './entities/user-favorite-ritual.entity';
import { BaseService } from 'src/common/base/service/service.base';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterUserFavoriteRitualDto } from './dto/filter-user-favorite-ritual.dto';
import { RitualService } from '../ritual/ritual.service';

@Injectable()
export class UserFavoriteRitualService extends BaseService<UserFavoriteRitual> {
  constructor(
    @InjectRepository(UserFavoriteRitual, 'postgresql')
    private readonly userFavoriteRitualRepository: Repository<UserFavoriteRitual>,
    private readonly redisService: RedisService,
    private readonly ritualService: RitualService,
  ) {
    super(userFavoriteRitualRepository, redisService);
  }
  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return [];
  }

  protected getSearchableFields(): string[] {
    return [];
  }
  protected createQueryBuilder(
    filter: FilterUserFavoriteRitualDto,
  ): SelectQueryBuilder<UserFavoriteRitual> {
    const aliasName = UserFavoriteRitual.name.toLowerCase();
    const queryBuilder = this.userFavoriteRitualRepository.createQueryBuilder(
      `${aliasName}`,
    );

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.userId) {
      queryBuilder.andWhere(`${aliasName}.userId = :userId`, {
        userId: filter.userId,
      });
    }

    if (filter.ritualId) {
      queryBuilder.andWhere(`${aliasName}.ritualId = :ritualId`, {
        ritualId: filter.ritualId,
      });
    }

    return queryBuilder;
  }

  protected async validateCreateInput(
    createDto: CreateUserFavoriteRitualDto,
  ): Promise<void> {
    if (!createDto) {
      throw new Error('Invalid input');
    }
    const isRitualExisted = await this.ritualService.findOne(
      createDto.ritualId,
    );
    if (!isRitualExisted) {
      throw new Error('Ritual does not exist');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { RitualReview } from './entities/ritual-review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterRitualReviewDto } from './dto/filter-ritual-review.dto';
import { CreateRitualReviewDto } from './dto/create-ritual-review.dto';
import { RitualService } from '../ritual/ritual.service';

@Injectable()
export class RitualReviewService extends BaseService<RitualReview> {
  constructor(
    @InjectRepository(RitualReview, 'postgresql')
    private readonly ritualReviewRepository: Repository<RitualReview>,
    private readonly redisService: RedisService,
    private readonly ritualService: RitualService,
  ) {
    super(ritualReviewRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['ritual', 'user'];
  }

  protected getSearchableFields(): string[] {
    return ['comment'];
  }

  protected createQueryBuilder(
    filter: FilterRitualReviewDto,
  ): SelectQueryBuilder<RitualReview> {
    const aliasName = RitualReview.name.toLowerCase();
    const queryBuilder =
      this.ritualReviewRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.comment) {
      queryBuilder.andWhere(`${aliasName}.comment ILIKE :comment`, {
        comment: `%${filter.comment}%`,
      });
    }

    if (filter.rating) {
      queryBuilder.andWhere(`${aliasName}.rating = :rating`, {
        rating: filter.rating,
      });
    }

    if (filter.ritualId) {
      queryBuilder.andWhere(`${aliasName}.ritualId = :ritualId`, {
        ritualId: filter.ritualId,
      });
    }

    if (filter.userId) {
      queryBuilder.andWhere(`${aliasName}.userId = :userId`, {
        userId: filter.userId,
      });
    }

    return queryBuilder;
  }
  protected async validateCreateInput(
    createDto: CreateRitualReviewDto,
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

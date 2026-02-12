import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { PaymentLog } from './entities/payment-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterPaymentLogDto } from './dto/filter-payment-log.dto';

@Injectable()
export class PaymentLogService extends BaseService<PaymentLog> {
  constructor(
    @InjectRepository(PaymentLog, 'postgresql')
    private readonly paymentLogRepository: Repository<PaymentLog>,
    private readonly redisService: RedisService,
  ) {
    super(paymentLogRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['payment'];
  }

  protected getSearchableFields(): string[] {
    return ['old_status', 'new_status', 'description'];
  }

  protected createQueryBuilder(
    filter: FilterPaymentLogDto,
  ): SelectQueryBuilder<PaymentLog> {
    const aliasName = PaymentLog.name.toLowerCase();
    const queryBuilder =
      this.paymentLogRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.status) {
      queryBuilder.andWhere(`${aliasName}.status = :status`, {
        status: filter.status,
      });
    }

    if (filter.paymentId) {
      queryBuilder.andWhere(`${aliasName}.paymentId = :paymentId`, {
        paymentId: filter.paymentId,
      });
    }

    return queryBuilder;
  }
}

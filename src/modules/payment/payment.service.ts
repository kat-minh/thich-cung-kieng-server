import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterPaymentDto } from './dto/filter-payment.dto';

@Injectable()
export class PaymentService extends BaseService<Payment> {
  constructor(
    @InjectRepository(Payment, 'postgresql')
    private readonly paymentRepository: Repository<Payment>,
    private readonly redisService: RedisService,
  ) {
    super(paymentRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['user', 'userSubscription', 'paymentLogs'];
  }

  protected getSearchableFields(): string[] {
    return ['currency'];
  }

  protected createQueryBuilder(
    filter: FilterPaymentDto,
  ): SelectQueryBuilder<Payment> {
    const aliasName = Payment.name.toLowerCase();
    const queryBuilder = this.paymentRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    if (filter.status) {
      queryBuilder.andWhere(`${aliasName}.status = :status`, {
        status: filter.status,
      });
    }

    if (filter.provider) {
      queryBuilder.andWhere(`${aliasName}.provider = :provider`, {
        provider: filter.provider,
      });
    }

    if (filter.userId) {
      queryBuilder.andWhere(`${aliasName}.userId = :userId`, {
        userId: filter.userId,
      });
    }

    if (filter.userSubscriptionId) {
      queryBuilder.andWhere(
        `${aliasName}.userSubscriptionId = :userSubscriptionId`,
        {
          userSubscriptionId: filter.userSubscriptionId,
        },
      );
    }

    return queryBuilder;
  }

  async getPaymentTrends(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all completed payments within the date range
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.deletedAt IS NULL')
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere('payment.createdAt >= :startDate', { startDate })
      .andWhere('payment.createdAt <= :endDate', { endDate })
      .orderBy('payment.createdAt', 'ASC')
      .getMany();

    // Group payments by date
    const trendMap = new Map<string, { amount: number; transactions: number }>();

    payments.forEach((payment) => {
      const dateKey = new Date(payment.createdAt).toLocaleDateString('vi-VN');
      const existing = trendMap.get(dateKey) || { amount: 0, transactions: 0 };
      
      trendMap.set(dateKey, {
        amount: existing.amount + Number(payment.totalAmount),
        transactions: existing.transactions + 1,
      });
    });

    // Convert to array format for charts
    const trends = Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      transactions: data.transactions,
    }));

    return trends;
  }
}

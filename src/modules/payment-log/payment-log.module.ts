import { Module } from '@nestjs/common';
import { PaymentLogService } from './payment-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/shared/redis/redis.module';
import { PaymentLog } from './entities/payment-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentLog], 'postgresql'), RedisModule],
  providers: [PaymentLogService],
  exports: [PaymentLogService],
})
export class PaymentLogModule {}

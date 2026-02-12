import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { RedisModule } from 'src/shared/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { AdminStatsController } from './admin-stats.controller';
import { Payment } from '../payment/entities/payment.entity';
import { UserSubscription } from '../user-subscription/entities/user-subscription.entity';
import { Ritual } from '../ritual/entities/ritual.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, Payment, UserSubscription, Ritual],
      'postgresql',
    ),
    RedisModule,
  ],
  controllers: [UserController, AdminStatsController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

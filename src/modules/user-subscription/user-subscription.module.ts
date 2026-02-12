import { Module } from '@nestjs/common';
import { UserSubscriptionService } from './user-subscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubscription } from './entities/user-subscription.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSubscription], 'postgresql'),
    RedisModule,
  ],
  providers: [UserSubscriptionService],
  exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}

import { Module } from '@nestjs/common';
import { SubscriptionFeatureService } from './subscription-feature.service';
import { SubscriptionFeatureController } from './subscription-feature.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionFeature } from './entities/subscription-feature.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionFeature], 'postgresql'),
    RedisModule,
  ],
  controllers: [SubscriptionFeatureController],
  providers: [SubscriptionFeatureService],
  exports: [SubscriptionFeatureService],
})
export class SubscriptionFeatureModule {}

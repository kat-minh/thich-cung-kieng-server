import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { RedisModule } from 'src/shared/redis/redis.module';
import { PlanFeatureModule } from '../plan-feature/plan-feature.module';
import { SubscriptionFeatureModule } from '../subscription-feature/subscription-feature.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan], 'postgresql'),
    RedisModule,
    PlanFeatureModule,
    SubscriptionFeatureModule,
  ],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}

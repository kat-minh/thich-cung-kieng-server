import { Module } from '@nestjs/common';
import { PlanFeatureService } from './plan-feature.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanFeature } from './entities/plan-feature.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlanFeature], 'postgresql'), RedisModule],
  providers: [PlanFeatureService],
  exports: [PlanFeatureService],
})
export class PlanFeatureModule {}

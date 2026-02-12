import { Module } from '@nestjs/common';
import { RitualOfferingService } from './ritual-offering.service';
import { RitualOfferingController } from './ritual-offering.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RitualOffering } from './entities/ritual-offering.entity';
import { RedisModule } from 'src/shared/redis/redis.module';
import { OfferingMediaModule } from '../offering-media/offering-media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RitualOffering], 'postgresql'),
    RedisModule,
    OfferingMediaModule,
  ],
  controllers: [RitualOfferingController],
  providers: [RitualOfferingService],
  exports: [RitualOfferingService],
})
export class RitualOfferingModule {}

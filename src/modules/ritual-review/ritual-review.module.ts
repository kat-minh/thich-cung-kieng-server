import { Module } from '@nestjs/common';
import { RitualReviewService } from './ritual-review.service';
import { RitualReviewController } from './ritual-review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RitualReview } from './entities/ritual-review.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RitualReview], 'postgresql'),
    RedisModule,
  ],
  controllers: [RitualReviewController],
  providers: [RitualReviewService],
})
export class RitualReviewModule {}

import { Module } from '@nestjs/common';
import { OfferingMediaService } from './offering-media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferingMedia } from './entities/offering-media.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfferingMedia], 'postgresql'),
    RedisModule,
  ],
  providers: [OfferingMediaService],
  exports: [OfferingMediaService],
})
export class OfferingMediaModule {}

import { Module } from '@nestjs/common';
import { RitualMediaService } from './ritual-media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RitualMedia } from './entities/ritual-media.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([RitualMedia], 'postgresql'), RedisModule],
  providers: [RitualMediaService],
  exports: [RitualMediaService],
})
export class RitualMediaModule {}

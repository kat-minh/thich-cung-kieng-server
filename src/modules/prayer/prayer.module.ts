import { Module } from '@nestjs/common';
import { PrayerService } from './prayer.service';
import { PrayerController } from './prayer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prayer } from './entities/prayer.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Prayer], 'postgresql'), RedisModule],
  controllers: [PrayerController],
  providers: [PrayerService],
  exports: [PrayerService],
})
export class PrayerModule {}

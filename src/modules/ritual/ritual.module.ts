import { Module } from '@nestjs/common';
import { RitualService } from './ritual.service';
import { RitualController } from './ritual.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ritual } from './entities/ritual.entity';
import { RedisModule } from 'src/shared/redis/redis.module';
import { RitualMediaModule } from '../ritual-media/ritual-media.module';
import { RitualTagModule } from '../ritual-tag/ritual-tag.module';
import { PrayerModule } from '../prayer/prayer.module';
import { TagModule } from '../tag/tag.module';
import { RitualOfferingModule } from '../ritual-offering/ritual-offering.module';
import { RitualTrayModule } from '../ritual-tray/ritual-tray.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ritual], 'postgresql'),
    RedisModule,
    RitualOfferingModule,
    RitualMediaModule,
    RitualTagModule,
    RitualTrayModule,
    TagModule,
    PrayerModule,
  ],
  controllers: [RitualController],
  providers: [RitualService],
  exports: [RitualService],
})
export class RitualModule {}

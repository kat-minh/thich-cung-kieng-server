import { Module } from '@nestjs/common';
import { RitualTrayService } from './ritual-tray.service';
import { RitualTrayController } from './ritual-tray.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RitualTray } from './entities/ritual-tray.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([RitualTray], 'postgresql'), RedisModule],
  controllers: [RitualTrayController],
  providers: [RitualTrayService],
  exports: [RitualTrayService],
})
export class RitualTrayModule {}

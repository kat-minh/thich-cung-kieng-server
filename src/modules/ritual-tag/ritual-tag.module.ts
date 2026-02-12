import { Module } from '@nestjs/common';
import { RitualTagService } from './ritual-tag.service';
import { RitualTagController } from './ritual-tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RitualTag } from './entities/ritual-tag.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([RitualTag], 'postgresql'), RedisModule],
  controllers: [RitualTagController],
  providers: [RitualTagService],
  exports: [RitualTagService],
})
export class RitualTagModule {}

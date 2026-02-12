import { Module } from '@nestjs/common';
import { RitualCategoryService } from './ritual-category.service';
import { RitualCategoryController } from './ritual-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RitualCategory } from './entities/ritual-category.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RitualCategory], 'postgresql'),
    RedisModule,
  ],
  controllers: [RitualCategoryController],
  providers: [RitualCategoryService],
})
export class RitualCategoryModule {}

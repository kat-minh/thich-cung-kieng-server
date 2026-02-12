import { Module } from '@nestjs/common';
import { UserEventOfferingService } from './user_event_offering.service';
import { UserEventOfferingController } from './user_event_offering.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEventOffering } from './entities/user_event_offering.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEventOffering], 'postgresql'),
    RedisModule,
  ],
  controllers: [UserEventOfferingController],
  providers: [UserEventOfferingService],
  exports: [UserEventOfferingService],
})
export class UserEventOfferingModule {}

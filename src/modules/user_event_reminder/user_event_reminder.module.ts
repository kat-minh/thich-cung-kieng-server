import { Module } from '@nestjs/common';
import { UserEventReminderService } from './user_event_reminder.service';
import { UserEventReminderController } from './user_event_reminder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEventReminder } from './entities/user_event_reminder.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEventReminder], 'postgresql'),
    RedisModule,
  ],
  controllers: [UserEventReminderController],
  providers: [UserEventReminderService],
  exports: [UserEventReminderService],
})
export class UserEventReminderModule {}

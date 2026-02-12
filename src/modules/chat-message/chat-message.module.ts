import { RedisModule } from 'src/shared/redis/redis.module';
import { Module } from '@nestjs/common';
import { ChatMessageService } from './chat-message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatMessageController } from './chat-message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage], 'postgresql'), RedisModule],
  controllers: [ChatMessageController],
  providers: [ChatMessageService],
})
export class ChatMessageModule {}

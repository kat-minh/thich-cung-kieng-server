import { Injectable } from '@nestjs/common';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { ChatMessage } from './entities/chat-message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { BaseService } from 'src/common/base/service/service.base';

@Injectable()
export class ChatMessageService extends BaseService<ChatMessage> {
  constructor(
    @InjectRepository(ChatMessage, 'postgresql')
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly redisService: RedisService,
  ) {
    super(chatMessageRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return [];
  }

  protected getSearchableFields(): string[] {
    return ['content'];
  }
}

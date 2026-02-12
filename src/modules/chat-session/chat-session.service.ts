import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { BaseService } from 'src/common/base/service/service.base';
import { FilterChatSessionDto } from './dto/filter-chat-session.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatSessionService extends BaseService<ChatSession> {
  constructor(
    @InjectRepository(ChatSession, 'postgresql')
    private readonly chatSessionRepository: Repository<ChatSession>,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {
    super(chatSessionRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return ['userId'];
  }

  protected getDefaultRelations(): string[] {
    return ['user', 'messages'];
  }

  protected getSearchableFields(): string[] {
    return ['id'];
  }

  protected createQueryBuilder(
    filter: FilterChatSessionDto,
  ): SelectQueryBuilder<ChatSession> {
    const aliasName = ChatSession.name.toLowerCase();
    const queryBuilder =
      this.chatSessionRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.userId) {
      queryBuilder.andWhere(`${aliasName}.userId = :userId`, {
        userId: filter.userId,
      });
    }

    return queryBuilder;
  }

  protected async validateCreateInput(
    dataDto: CreateChatSessionDto,
  ): Promise<void> {
    const { userId } = dataDto;
    const userExists = await this.userService.findOne(userId);
    if (!userExists) {
      throw new NotFoundException('User does not exist');
    }
  }
}

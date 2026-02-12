import { AbstractEntity } from 'src/common/base/entity.base';
import { ChatMessage } from 'src/modules/chat-message/entities/chat-message.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity('chat_sessions')
export class ChatSession extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @OneToMany(() => ChatMessage, (message) => message.session)
  messages: ChatMessage[];

  @OneToOne(() => User, (user) => user.chatSession)
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor(partial: Partial<ChatSession>) {
    super();
    Object.assign(this, partial);
  }
}

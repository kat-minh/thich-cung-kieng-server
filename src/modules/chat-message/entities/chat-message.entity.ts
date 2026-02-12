import { AbstractEntity } from 'src/common/base/entity.base';
import { ChatMessageSender } from 'src/common/enums/chat-message.enum';
import { ChatSession } from 'src/modules/chat-session/entities/chat-session.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: ChatMessageSender,
    default: ChatMessageSender.USER,
  })
  sender: ChatMessageSender;

  @Column()
  content: string;

  @Column()
  sessionId: string;

  @ManyToOne(() => ChatSession, (session) => session.id)
  session: ChatSession;
  constructor(partial: Partial<ChatMessage>) {
    super();
    Object.assign(this, partial);
  }
}

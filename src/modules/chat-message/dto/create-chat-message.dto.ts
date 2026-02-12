import { IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';
import { ChatMessageSender } from 'src/common/enums/chat-message.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatMessageDto {
  @ApiProperty({ enum: ChatMessageSender, description: 'Sender of the message' })
  @IsEnum(ChatMessageSender)
  sender: ChatMessageSender;

  @ApiProperty({ type: String, description: 'Content of the message' })
  @IsString()
  content: string;

  @ApiProperty({ type: String, format: 'uuid', description: 'Session ID' })
  @IsUUID()
  sessionId: string;
}

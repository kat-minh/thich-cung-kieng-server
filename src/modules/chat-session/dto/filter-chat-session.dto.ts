import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

export class FilterChatSessionDto extends PartialType(BaseFilterDto) {
  @ApiPropertyOptional({
    description: 'ID of the user associated with the chat session',
    example: '550e8400-e29b-41d4-a716-446655440000',
    default: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserFavoriteRitualDto {
  @ApiProperty({
    description: 'ID of the user who favorites the ritual',
    example: 'uuid',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID of the ritual being favorited',
    example: 'uuid',
  })
  @IsString()
  ritualId: string;
}

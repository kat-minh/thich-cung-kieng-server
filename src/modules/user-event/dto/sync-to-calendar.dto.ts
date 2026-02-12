import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SyncToCalendarDto {
  @ApiProperty({
    description: 'Google OAuth refresh token to access user calendar',
    example: '1//0gABC123...',
  })
  @IsString()
  @IsNotEmpty()
  googleRefreshToken: string;
}

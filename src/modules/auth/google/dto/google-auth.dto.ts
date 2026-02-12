// src/modules/auth/dto/google-login.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'ID token from Google OAuth for verification',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOTczZWUyZT...',
  })
  @IsString()
  @IsNotEmpty()
  id_token: string;

  @ApiProperty({
    description: 'Access token from Google OAuth',
    example: 'ya29.a0AbVbY6N4uVbDGyP0wK...',
  })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({
    description: 'User email from Google profile (optional)',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User display name from Google profile (optional)',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User profile picture URL (optional)',
    example: 'https://lh3.googleusercontent.com/a/photo.jpg',
  })
  @IsString()
  @IsOptional()
  picture?: string;
}

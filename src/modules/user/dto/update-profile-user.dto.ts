import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateProfileUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Nguyen Van A',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Birthday of the user',
    example: '1990-01-15',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+84987654321',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}

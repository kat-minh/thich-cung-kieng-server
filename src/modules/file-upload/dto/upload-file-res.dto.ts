import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponse {
  @ApiProperty({
    description: 'URL của ảnh đã upload',
    example: 'https://storage.googleapis.com/bucket-name/path/to/image.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Tên file đã upload',
    example: 'image.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'Kích thước của file đã upload (bytes)',
    example: 123456,
  })
  size: number;

  @ApiProperty({
    description: 'Định dạng của file đã upload',
    example: 'image/jpeg',
  })
  contentType: string;
}

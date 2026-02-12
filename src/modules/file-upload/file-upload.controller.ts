import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadImageResponse } from './dto/upload-file-res.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('file-upload')
@Public()
export class FileUploadController {
  constructor(private readonly fileService: FileUploadService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload single image file',
    description: 'Upload một file ảnh lên Firebase Storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh cần upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Upload thành công',
    type: UploadImageResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'File ảnh không hợp lệ hoặc lỗi upload',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadImageResponse> {
    try {
      const url = await this.fileService.uploadFile(file);
      return {
        url: url,
        filename: file.originalname,
        size: file.size,
        contentType: file.mimetype,
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  @Post('upload-multiple') // Change the route path
  @ApiOperation({
    summary: 'Upload multiple files',
    description: 'Upload nhiều file lên Firebase Storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description: 'File cần upload',
          },
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Upload thành công',
    type: [UploadImageResponse], // Array type
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc lỗi upload',
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Change to FilesInterceptor
  async uploadMultipleImage(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadImageResponse[]> {
    try {
      const urls = await this.fileService.uploadMultipleFiles(files);
      return files.map((file, idx) => ({
        url: urls[idx],
        filename: file.originalname,
        size: file.size,
        contentType: file.mimetype,
      }));
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Delete file',
    description: 'Xoá file khỏi Firebase Storage',
  })
  @ApiResponse({
    status: 200,
    description: 'Xoá file thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'URL file không hợp lệ hoặc lỗi xoá',
  })
  @ApiBody({
    description: 'URL của file cần xoá',
    type: String,
  })
  @ApiBody({
    description: 'Delete file by URL',
    schema: {
      type: 'object',
      properties: {
        fileUrl: {
          type: 'string',
          description: 'Url file cần xoá',
        },
      },
      required: ['fileUrl'],
    },
  })
  @UseInterceptors(FileInterceptor('fileUrl')) // Use FileInterceptor for single string input
  async deleteImage(
    @Body('fileUrl') fileUrl: string,
  ): Promise<{ message: string }> {
    try {
      await this.fileService.deleteFile(fileUrl);
      return { message: 'Xoá ảnh thành công' };
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}

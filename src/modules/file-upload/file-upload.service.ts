import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from 'src/shared/firebase/firebase.service';
import { FILE_UPLOAD_CONFIG } from 'src/common/constants/file-types.constant';

@Injectable()
export class FileUploadService {
constructor(private readonly firebaseService: FirebaseService) {}

  private validateFile(file: Express.Multer.File): void {
    if (!file || !file.buffer) {
      throw new HttpException('No file uploaded or file is empty', 400);
    }
    const allowedMimeTypes = FILE_UPLOAD_CONFIG.getAllowedTypes();
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const allowedExtensions = Object.values(
        FILE_UPLOAD_CONFIG.getExtensionsMapping(),
      ).join(',');
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed formats: ${allowedExtensions}`,
      );
    }
    if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds the limit of ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`,
      );
    }
    if (file.originalname.length > FILE_UPLOAD_CONFIG.MAX_FILENAME_LENGTH) {
      throw new BadRequestException(
        `File name is too long. Maximum length is ${FILE_UPLOAD_CONFIG.MAX_FILENAME_LENGTH} characters.`,
      );
    }
  }

  private validateFiles(files: Express.Multer.File[]): void {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded or files are empty', 400);
    }
    const allowedMimeTypes = FILE_UPLOAD_CONFIG.getAllowedTypes();
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        const allowedExtensions = Object.values(
          FILE_UPLOAD_CONFIG.getExtensionsMapping(),
        ).join(',');
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Allowed formats: ${allowedExtensions}`,
        );
      }
      if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File size exceeds the limit of ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`,
        );
      }
      if (file.originalname.length > FILE_UPLOAD_CONFIG.MAX_FILENAME_LENGTH) {
        throw new BadRequestException(
          `File name is too long. Maximum length is ${FILE_UPLOAD_CONFIG.MAX_FILENAME_LENGTH} characters.`,
        );
      }
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      this.validateFile(file);
      // Tạo path
      const fileName = `${Date.now()}_${file.originalname}`;
      const downloadToken = uuidv4();
      // Upload và trả về URL
      const bucket = this.firebaseService.getStorage();
      const filePath = bucket.file(fileName);
      await filePath.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${downloadToken}`;
      return fileUrl;
    } catch (error) {
      throw new HttpException(`Failed to upload file: ${error.message}`, 500);
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    this.validateFiles(files);
    const fileUrls: string[] = [];
    const bucket = this.firebaseService.getStorage();
    for (const file of files) {
      const fileName = `${Date.now()}_${file.originalname}`;
      const downloadToken = uuidv4();
      const filePath = bucket.file(fileName);
      await filePath.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${downloadToken}`;
      fileUrls.push(fileUrl);
    }
    return fileUrls;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) {
      throw new HttpException('File URL is required', 400);
    }
    const bucket = this.firebaseService.getStorage();
    const fileName = fileUrl.split('/o/')[1].split('?')[0];
    const filePath = bucket.file(decodeURIComponent(fileName));
    await filePath.delete().catch((error) => {
      throw new HttpException(`Failed to delete file: ${error.message}`, 500);
    });
  }
}

// src/modules/document/config/file-types.config.ts
export const FILE_UPLOAD_CONFIG = {
  // Document files
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],

  // Images
  IMAGES: ['image/jpg', 'image/png', 'image/jpeg'],

  // Size limits (bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILENAME_LENGTH: 100,

  // Get all allowed types
  getAllowedTypes(): string[] {
    return [...this.DOCUMENTS, ...this.IMAGES];
  },

  // Get file extensions mapping
  getExtensionsMapping(): Record<string, string> {
    return {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'XLSX',
      'text/plain': 'TXT',
      'image/jpeg': 'JPEG',
      'image/jpg': 'JPG',
      'image/png': 'PNG',
    };
  },
};

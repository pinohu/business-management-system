import { config } from 'dotenv';
config();

export const pdfConfig = {
  maxSize: parseInt(process.env.PDF_MAX_SIZE || '10485760'), // 10MB
  allowedTypes: ['application/pdf'],
  processing: {
    extractText: true,
    extractImages: true,
    extractMetadata: true,
    extractAttachments: true,
    ocr: {
      enabled: true,
      lang: process.env.TESSERACT_LANG || 'eng',
    },
  },
  output: {
    text: {
      format: 'txt',
      encoding: 'utf-8',
    },
    images: {
      format: 'png',
      quality: 90,
      maxWidth: 2000,
      maxHeight: 2000,
    },
    metadata: {
      format: 'json',
    },
  },
  security: {
    passwordProtected: false,
    encryption: {
      algorithm: 'AES-256',
      keyLength: 32,
    },
  },
  compression: {
    enabled: true,
    level: 9,
  },
};

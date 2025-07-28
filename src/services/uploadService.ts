import multer from 'multer';
import { Request } from 'express';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    // Videos
    'video/mp4', 'video/webm', 'video/quicktime',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
  }
};

// Configure multer upload
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter
});

// Upload file to Cloudinary
export const uploadFile = async (
  file: Express.Multer.File,
  folder: string = 'taskio'
): Promise<{
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}> => {
  try {
    // Generate a unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, fileName, folder);
    
    return result;
  } catch (error: any) {
    console.error('❌ Upload service error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from Cloudinary
export const deleteFile = async (publicId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    return await deleteFromCloudinary(publicId);
  } catch (error: any) {
    console.error('❌ Delete service error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    // Example URL: https://res.cloudinary.com/dkpglmxjj/image/upload/v1627293456/taskio/abc123.jpg
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error extracting public ID:', error);
    return null;
  }
};

// Get file type from mimetype
export const getFileType = (mimetype: string): 'image' | 'document' | 'video' | 'audio' | 'other' => {
  if (mimetype.startsWith('image/')) {
    return 'image';
  } else if (mimetype.startsWith('video/')) {
    return 'video';
  } else if (mimetype.startsWith('audio/')) {
    return 'audio';
  } else if (
    mimetype === 'application/pdf' ||
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.ms-powerpoint' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimetype === 'text/plain' ||
    mimetype === 'text/csv'
  ) {
    return 'document';
  } else {
    return 'other';
  }
};

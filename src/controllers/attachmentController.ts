import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse, Attachment } from '../types';
import multer from 'multer';
import AWS from 'aws-sdk';
import path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'));
    }
  }
});

const uploadToS3 = async (file: Express.Multer.File, userId: string, taskId: string): Promise<string> => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${userId}/${taskId}/${Date.now()}${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

export const uploadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.taskId;

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as ApiResponse);

      return;
    }

    // Verify task belongs to user
    const taskResult = await query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);

      return;
    }

    // Upload file to S3
    const fileUrl = await uploadToS3(req.file, userId, taskId);

    // Determine file type
    let fileType: 'image' | 'audio' | 'document' = 'document';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      fileType = 'document'; // Videos are treated as documents for now
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    } else if (req.file.mimetype === 'application/pdf') {
      fileType = 'document';
    }

    // Save attachment record
    const result = await query(
      `INSERT INTO attachments (task_id, file_url, file_type, file_name, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [taskId, fileUrl, fileType, req.file.originalname, req.file.size]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'File uploaded successfully'
    } as ApiResponse<Attachment>);
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    } as ApiResponse);
  }
};

export const getAttachments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.taskId;

    // Verify task belongs to user
    const taskResult = await query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);

      return;
    }

    const result = await query(
      'SELECT * FROM attachments WHERE task_id = $1 ORDER BY created_at DESC',
      [taskId]
    );

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse<Attachment[]>);
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get attachments'
    } as ApiResponse);
  }
};

export const deleteAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const attachmentId = req.params.id;

    // Get attachment with task verification
    const result = await query(
      `SELECT a.*, t.user_id 
       FROM attachments a
       JOIN tasks t ON a.task_id = t.id
       WHERE a.id = $1 AND t.user_id = $2`,
      [attachmentId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Attachment not found'
      } as ApiResponse);

      return;
    }

    const attachment = result.rows[0];

    // Delete from S3
    try {
      const urlParts = attachment.file_url.split('/');
      const key = urlParts.slice(-3).join('/'); // Get the last 3 parts as the key
      
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key
      }).promise();
    } catch (s3Error) {
      console.error('S3 deletion error:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await query('DELETE FROM attachments WHERE id = $1', [attachmentId]);

    res.json({
      success: true,
      message: 'Attachment deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attachment'
    } as ApiResponse);
  }
};

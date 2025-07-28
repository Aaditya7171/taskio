import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse, Attachment } from '../types';
import { upload, uploadFile, deleteFile, getPublicIdFromUrl, getFileType } from '../services/uploadService';

// Export upload middleware from uploadService
export { upload };

// Upload file to Cloudinary
const uploadToCloudinary = async (file: Express.Multer.File, userId: string, taskId: string): Promise<{
  url: string;
  publicId: string;
}> => {
  const folder = `taskio/attachments/${userId}/${taskId}`;
  const result = await uploadFile(file, folder);

  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }

  return {
    url: result.url!,
    publicId: result.publicId!
  };
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

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, userId, taskId);

    // Determine file type
    const fileType = getFileType(req.file.mimetype);

    // Save attachment record
    const result = await query(
      `INSERT INTO attachments (task_id, file_url, file_type, file_name, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [taskId, uploadResult.url, fileType, req.file.originalname, req.file.size]
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

    // Delete from Cloudinary
    try {
      const publicId = getPublicIdFromUrl(attachment.file_url);
      if (publicId) {
        await deleteFile(publicId);
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
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

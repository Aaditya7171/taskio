import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkpglmxjj',
  api_key: process.env.CLOUDINARY_API_KEY || '382647182754348',
  api_secret: process.env.CLOUDINARY_API_SECRET || '9Tpzni0DOaj6Ot3Uu1UznqCpiiw',
  secure: true
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'taskio'
): Promise<{
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}> => {
  try {
    return new Promise((resolve) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: fileName,
          resource_type: 'auto', // Automatically detect file type
          overwrite: true,
          invalidate: true,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            resolve({
              success: false,
              error: error.message
            });
          } else if (result) {
            console.log('✅ File uploaded to Cloudinary:', result.secure_url);
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id
            });
          } else {
            resolve({
              success: false,
              error: 'Unknown upload error'
            });
          }
        }
      ).end(fileBuffer);
    });
  } catch (error: any) {
    console.error('❌ Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ File deleted from Cloudinary:', publicId);
      return { success: true };
    } else {
      console.error('❌ Failed to delete from Cloudinary:', result);
      return {
        success: false,
        error: 'Failed to delete file'
      };
    }
  } catch (error: any) {
    console.error('❌ Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get optimized image URL
export const getOptimizedImageUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
} = {}): string => {
  const {
    width = 800,
    height = 600,
    quality = 'auto:good',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality,
    fetch_format: format,
    secure: true
  });
};

// Test Cloudinary connection
export const testCloudinaryConnection = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Try to get account details to test connection
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Cloudinary connection successful');
      return { success: true };
    } else {
      console.error('❌ Cloudinary connection failed:', result);
      return {
        success: false,
        error: 'Connection test failed'
      };
    }
  } catch (error: any) {
    console.error('❌ Cloudinary connection error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default cloudinary;

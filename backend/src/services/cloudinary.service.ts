import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env';
import logger from '../utils/logger';

function isConfigured(): boolean {
  return !!(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
}

if (isConfigured()) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME!,
    api_key: env.CLOUDINARY_API_KEY!,
    api_secret: env.CLOUDINARY_API_SECRET!,
  });
}

/**
 * Upload a profile/avatar image buffer to Cloudinary.
 * Returns the public secure URL. Requires CLOUDINARY_* env vars.
 */
export async function uploadProfileImage(
  fileBuffer: Buffer,
  _originalFilename?: string | null
): Promise<string> {
  if (!isConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for avatar uploads.'
    );
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'dockit-avatars',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error', { error });
          reject(error);
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Cloudinary did not return a URL'));
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export default cloudinary;

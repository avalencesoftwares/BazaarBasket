// packages/functions/src/utils/cloudinary.ts
// Cloudinary SDK setup and image helpers

import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

let isConfigured = false;

/**
 * Initialize Cloudinary with environment credentials.
 * Call once at startup.
 */
export function initCloudinary(config?: CloudinaryConfig): void {
  if (isConfigured) {
    return;
  }

  const cloudName = config?.cloudName || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = config?.apiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = config?.apiSecret || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn('Cloudinary not configured: missing environment variables', {
      action: 'initCloudinary',
    });
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
  logger.info('Cloudinary initialized', { action: 'initCloudinary' });
}

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  thumbnailUrl: string;
}

/**
 * Upload a base64-encoded image to Cloudinary.
 * Automatically generates a thumbnail transformation URL.
 */
export async function uploadImage(
  base64Data: string,
  folder: string,
  fileName: string,
): Promise<UploadResult> {
  initCloudinary();

  const dataUri = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: fileName.replace(/\.[^.]+$/, ''),
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'webp' },
    ],
  });

  const thumbnailUrl = cloudinary.url(result.public_id, {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'webp',
    secure: true,
  });

  logger.info('Image uploaded to Cloudinary', {
    action: 'uploadImage',
    publicId: result.public_id,
    folder,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    thumbnailUrl,
  };
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteImage(publicId: string): Promise<void> {
  initCloudinary();

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });

  logger.info('Image deleted from Cloudinary', {
    action: 'deleteImage',
    publicId,
  });
}

/**
 * Generate a Cloudinary transformation URL for a given public_id.
 */
export function getTransformUrl(
  publicId: string,
  options: { width: number; height: number; crop?: string },
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: 'auto',
    fetch_format: 'webp',
    secure: true,
  });
}

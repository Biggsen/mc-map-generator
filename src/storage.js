import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logInfo, logError, formatFileSize } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the generated-maps directory path
const generatedMapsDir = path.join(__dirname, '..', 'generated-maps');

/**
 * Ensure the generated-maps directory exists
 */
async function ensureDirectoryExists() {
  try {
    await fs.access(generatedMapsDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(generatedMapsDir, { recursive: true });
      logInfo('Created generated-maps directory', { directory: generatedMapsDir });
    } else {
      throw error;
    }
  }
}

/**
 * Save image buffer to file
 * @param {Buffer} buffer - Image buffer
 * @param {string} filename - Filename to save as
 * @returns {Promise<string>} Full file path
 */
export async function saveImage(buffer, filename) {
  try {
    await ensureDirectoryExists();
    
    const filePath = path.join(generatedMapsDir, filename);
    await fs.writeFile(filePath, buffer);
    
    const stats = await fs.stat(filePath);
    const fileSize = formatFileSize(stats.size);
    
    logInfo('Image saved successfully', {
      filename,
      filePath,
      fileSize,
      sizeBytes: stats.size
    });
    
    return filePath;
  } catch (error) {
    logError('Failed to save image', {
      filename,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get public URL for generated image
 * @param {string} filename - Image filename
 * @returns {string} Public URL for the image
 */
export function getImageUrl(filename) {
  // Use BASE_URL environment variable or default to localhost
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
  return `${baseUrl}/generated-maps/${filename}`;
}

/**
 * Get full file path for an image
 * @param {string} filename - Image filename
 * @returns {string} Full file path
 */
export function getImagePath(filename) {
  return path.join(generatedMapsDir, filename);
}

/**
 * Check if image file exists
 * @param {string} filename - Image filename
 * @returns {Promise<boolean>} True if file exists
 */
export async function imageExists(filename) {
  try {
    const filePath = getImagePath(filename);
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get image file stats
 * @param {string} filename - Image filename
 * @returns {Promise<Object|null>} File stats or null if not found
 */
export async function getImageStats(filename) {
  try {
    const filePath = getImagePath(filename);
    const stats = await fs.stat(filePath);
    
    return {
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    logError('Failed to get image stats', {
      filename,
      error: error.message
    });
    return null;
  }
}

/**
 * Delete image file
 * @param {string} filename - Image filename
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteImage(filename) {
  try {
    const filePath = getImagePath(filename);
    await fs.unlink(filePath);
    
    logInfo('Image deleted successfully', { filename });
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      logInfo('Image file not found for deletion', { filename });
      return true; // File doesn't exist, consider it deleted
    }
    
    logError('Failed to delete image', {
      filename,
      error: error.message
    });
    return false;
  }
}

/**
 * List all images in the generated-maps directory
 * @returns {Promise<Array>} Array of image file info
 */
export async function listImages() {
  try {
    await ensureDirectoryExists();
    const files = await fs.readdir(generatedMapsDir);
    
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.png') || 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg')
    );
    
    const imageInfo = await Promise.all(
      imageFiles.map(async (filename) => {
        const stats = await getImageStats(filename);
        return {
          filename,
          ...stats
        };
      })
    );
    
    return imageInfo;
  } catch (error) {
    logError('Failed to list images', { error: error.message });
    return [];
  }
}

/**
 * Get storage usage information
 * @returns {Promise<Object>} Storage usage stats
 */
export async function getStorageInfo() {
  try {
    const images = await listImages();
    const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
    const fileCount = images.length;
    
    return {
      totalFiles: fileCount,
      totalSizeBytes: totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
      images
    };
  } catch (error) {
    logError('Failed to get storage info', { error: error.message });
    return {
      totalFiles: 0,
      totalSizeBytes: 0,
      totalSizeFormatted: '0 Bytes',
      images: []
    };
  }
}

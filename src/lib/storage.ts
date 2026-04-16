import fs from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

const UPLOADS_DIR = process.env.UPLOAD_DIR || './uploads';
const CLIPS_DIR = path.join(UPLOADS_DIR, 'clips');
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');

/**
 * Initialize storage directories
 */
export async function initializeStorage(): Promise<void> {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    await mkdir(CLIPS_DIR, { recursive: true });
    await mkdir(TEMP_DIR, { recursive: true });
    console.log('✅ Storage directories initialized');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Get video upload path
 */
export function getVideoPath(filename: string): string {
  return path.join(UPLOADS_DIR, filename);
}

/**
 * Get clip output path
 */
export function getClipPath(clipId: string, format: string = '.mp4'): string {
  return path.join(CLIPS_DIR, `${clipId}${format}`);
}

/**
 * Get thumbnail path
 */
export function getThumbnailPath(clipId: string): string {
  return path.join(CLIPS_DIR, `${clipId}-thumbnail.jpg`);
}

/**
 * Get temp file path
 */
export function getTempPath(filename: string): string {
  return path.join(TEMP_DIR, filename);
}

/**
 * Clean up temporary files
 */
export async function cleanupTemp(filePath: string): Promise<void> {
  try {
    if (filePath.startsWith(TEMP_DIR)) {
      await fs.unlink(filePath);
      console.log(`🗑️  Cleaned up: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to cleanup ${filePath}:`, error);
  }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Get all clips for a video
 */
export async function getVideoClips(videoId: string): Promise<string[]> {
  try {
    const files = await fs.readdir(CLIPS_DIR);
    return files
      .filter((f) => f.startsWith(`${videoId}-clip-`))
      .map((f) => path.join(CLIPS_DIR, f));
  } catch (error) {
    console.error('Failed to read clips directory:', error);
    return [];
  }
}

/**
 * Delete file
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log(`🗑️  Deleted: ${filePath}`);
  } catch (error) {
    console.error(`Failed to delete ${filePath}:`, error);
  }
}

export const storageConfig = {
  UPLOADS_DIR,
  CLIPS_DIR,
  TEMP_DIR,
};

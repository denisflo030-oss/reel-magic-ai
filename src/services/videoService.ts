import { v4 as uuidv4 } from 'uuid';
import { getVideoMetadata } from '../lib/ffmpeg.js';
import { db } from '../lib/database.js';
import { VideoFile } from '../types/index.js';

/**
 * Save uploaded video and extract metadata
 */
export async function processUploadedVideo(
  filePath: string,
  originalFilename: string,
  fileSize: number
): Promise<VideoFile> {
  try {
    console.log(`📹 Processing uploaded video: ${originalFilename}`);

    const videoId = uuidv4();
    const metadata = await getVideoMetadata(filePath);

    const video: VideoFile = {
      id: videoId,
      filename: originalFilename,
      path: filePath,
      size: fileSize,
      metadata,
      uploadedAt: new Date(),
    };

    db.saveVideo(video);
    console.log(`✅ Video saved with ID: ${videoId}`);

    return video;
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
}

/**
 * Get video by ID
 */
export function getVideoById(videoId: string): VideoFile | undefined {
  return db.getVideo(videoId);
}

/**
 * Get all videos
 */
export function getAllVideos(): VideoFile[] {
  return db.getAllVideos();
}

/**
 * Delete video
 */
export function deleteVideoById(videoId: string): boolean {
  return db.deleteVideo(videoId);
}
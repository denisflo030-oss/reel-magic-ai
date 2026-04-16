import { v4 as uuidv4 } from 'uuid';
import { getVideoMetadata } from '../lib/ffmpeg.js';
import { db } from '../lib/database.js';
import { VideoFile } from '../types/index.js';
import { createWriteStream } from 'fs';
import { get } from 'https';
import { parse } from 'url';
import { basename } from 'path';

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
 * Download video from URL and process it
 */
export async function downloadVideoFromUrl(url: string): Promise<VideoFile> {
  try {
    console.log(`📥 Downloading video from URL: ${url}`);

    const parsedUrl = parse(url);
    if (!parsedUrl.protocol || !parsedUrl.hostname) {
      throw new Error('Invalid URL');
    }

    const filename = basename(parsedUrl.pathname || 'video.mp4');
    const tempPath = `${process.env.UPLOAD_DIR || './uploads'}/${uuidv4()}-${filename}`;

    await new Promise<void>((resolve, reject) => {
      const file = createWriteStream(tempPath);
      const request = get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      });

      request.on('error', (err) => {
        reject(err);
      });

      file.on('error', (err) => {
        reject(err);
      });
    });

    // Get file size
    const fs = await import('fs/promises');
    const stats = await fs.stat(tempPath);
    const fileSize = stats.size;

    console.log(`✅ Video downloaded: ${tempPath} (${fileSize} bytes)`);

    // Process like uploaded video
    return await processUploadedVideo(tempPath, filename, fileSize);
  } catch (error) {
    console.error('Video download error:', error);
    throw error;
  }
}
}

/**
 * Delete video
 */
export function deleteVideoById(videoId: string): boolean {
  return db.deleteVideo(videoId);
}
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { VideoMetadata } from '../types/index.js';

/**
 * Get metadata from a video file
 */
export async function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const stream = metadata.streams.find((s) => s.codec_type === 'video');
      if (!stream) {
        reject(new Error('No video stream found'));
        return;
      }

      const fps = stream.r_frame_rate
        ? parseFloat(stream.r_frame_rate.split('/')[0]) /
          parseFloat(stream.r_frame_rate.split('/')[1])
        : 30;

      resolve({
        duration: metadata.format.duration || 0,
        width: stream.width || 0,
        height: stream.height || 0,
        fps,
      });
    });
  });
}

/**
 * Extract a segment from a video (cut and save)
 */
export async function extractSegment(
  inputPath: string,
  outputPath: string,
  startTime: number,
  duration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(startTime)
      .duration(duration)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .output(outputPath)
      .on('end', () => {
        console.log(`✅ Clip extracted: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Extract audio from video for transcription
 */
export async function extractAudio(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .audioCodec('libmp3lame')
      .audioFrequency(16000)
      .format('mp3')
      .on('end', () => {
        console.log(`✅ Audio extracted: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg audio extraction error:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Convert video to vertical format (9:16)
 */
export async function convertToVertical(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .size('1080x1920')
      .aspect('9:16')
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .output(outputPath)
      .on('end', () => {
        console.log(`✅ Converted to vertical: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * Add subtitles to a video
 */
export async function addSubtitles(
  inputPath: string,
  subtitlePath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .input(subtitlePath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .output(outputPath)
      .outputOptions([`-vf subtitles=${subtitlePath.replace(/\\/g, '\\\\')}`])
      .on('end', () => {
        console.log(`✅ Subtitles added: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * Generate thumbnail from video
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  timeSeconds: number = 5
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timeSeconds],
        filename: 'thumbnail.jpg',
        folder: path.dirname(outputPath),
        size: '320x240',
      })
      .on('end', () => {
        const filePath = path.join(path.dirname(outputPath), 'thumbnail.jpg');
        console.log(`✅ Thumbnail generated: ${filePath}`);
        resolve(filePath);
      })
      .on('error', (err) => {
        console.error('Thumbnail generation error:', err);
        reject(err);
      });
  });
}

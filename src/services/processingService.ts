import { extractSegment, generateThumbnail } from '../lib/ffmpeg.js';
import { getClipPath, getThumbnailPath } from '../lib/storage.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Extract and save a clip from video
 */
export async function extractClip(
  inputPath: string,
  startTime: number,
  endTime: number
): Promise<{
  clipId: string;
  clipPath: string;
  duration: number;
}> {
  try {
    const clipId = uuidv4();
    const duration = endTime - startTime;
    const clipPath = getClipPath(clipId);

    console.log(
      `✂️  Extracting clip ${clipId}: ${startTime}s to ${endTime}s (${duration}s)`
    );

    await extractSegment(inputPath, clipPath, startTime, duration);

    console.log(`✅ Clip saved: ${clipPath}`);

    return { clipId, clipPath, duration };
  } catch (error) {
    console.error('Clip extraction error:', error);
    throw error;
  }
}

/**
 * Generate thumbnail for a clip
 */
export async function generateClipThumbnail(
  clipPath: string,
  clipId: string,
  timeSeconds: number = 2
): Promise<string> {
  try {
    console.log(`🖼️  Generating thumbnail for clip ${clipId}...`);

    const thumbnailPath = getThumbnailPath(clipId);
    const thumbPath = await generateThumbnail(clipPath, thumbnailPath, timeSeconds);

    console.log(`✅ Thumbnail saved: ${thumbPath}`);
    return thumbPath;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    // Don't fail if thumbnail generation fails
    return '';
  }
}

/**
 * Process multiple clips in parallel
 */
export async function processClipsParallel(
  inputPath: string,
  segments: Array<{ startTime: number; endTime: number }>
): Promise<
  Array<{
    clipId: string;
    clipPath: string;
    duration: number;
  }>
> {
  try {
    console.log(`⚡ Processing ${segments.length} clips in parallel...`);

    const clipPromises = segments.map((seg) =>
      extractClip(inputPath, seg.startTime, seg.endTime)
    );

    const clips = await Promise.all(clipPromises);
    console.log(`✅ All ${clips.length} clips processed`);

    return clips;
  } catch (error) {
    console.error('Parallel processing error:', error);
    throw error;
  }
}
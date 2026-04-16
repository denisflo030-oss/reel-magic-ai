import path from 'path';
import { extractAudio } from '../lib/ffmpeg.js';
import { transcribeAudio, generateSRT, generateVTT } from '../lib/subtitles.js';
import { getTempPath, getThumbnailPath, cleanupTemp } from '../lib/storage.js';
import fs from 'fs/promises';

/**
 * Transcribe a video file using Whisper
 */
export async function transcribeVideo(videoPath: string): Promise<string> {
  try {
    console.log('🎤 Starting video transcription...');

    // Extract audio from video
    const audioPath = getTempPath(`audio-${Date.now()}.mp3`);
    await extractAudio(videoPath, audioPath);

    // Transcribe audio
    const transcript = await transcribeAudio(audioPath);

    // Clean up temp audio file
    await cleanupTemp(audioPath);

    return transcript;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

/**
 * Generate subtitles for a transcript
 */
export async function generateSubtitles(
  transcript: string,
  duration: number,
  format: 'srt' | 'vtt' = 'srt',
  outputPath?: string
): Promise<string> {
  try {
    console.log(`📝 Generating ${format.toUpperCase()} subtitles...`);

    const subPath = outputPath || getTempPath(`subtitles-${Date.now()}.${format}`);

    if (format === 'vtt') {
      return await generateVTT(transcript, duration, subPath);
    } else {
      return await generateSRT(transcript, duration, subPath);
    }
  } catch (error) {
    console.error('Subtitle generation error:', error);
    throw error;
  }
}

/**
 * Get transcript for a video (cached or new)
 */
const transcriptCache = new Map<string, string>();

export function cacheTranscript(videoId: string, transcript: string): void {
  transcriptCache.set(videoId, transcript);
}

export function getTranscriptFromCache(videoId: string): string | undefined {
  return transcriptCache.get(videoId);
}

export function clearTranscriptCache(videoId: string): void {
  transcriptCache.delete(videoId);
}
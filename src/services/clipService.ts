import { v4 as uuidv4 } from 'uuid';
import { GeneratedClip, ProcessingJob } from '../types/index.js';
import { db } from '../lib/database.js';
import * as videoServiceModule from './videoService.js';
import * as transcriptionServiceModule from './transcriptionService.js';
import * as processingServiceModule from './processingService.js';
import { analyzeVideoTranscript } from '../lib/ai.js';
import { generateSRT } from '../lib/subtitles.js';
import { generateClipThumbnail } from './processingService.js';
import { getClipPath } from '../lib/storage.js';

/**
 * Start async job to generate clips from a video
 */
export async function startClipGenerationJob(
  videoId: string,
  options: {
    numClips?: number;
    format?: 'vertical' | 'horizontal';
  } = {}
): Promise<ProcessingJob> {
  try {
    const jobId = uuidv4();
    const video = videoServiceModule.getVideoById(videoId);

    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    console.log(`🚀 Starting clip generation job ${jobId} for video ${videoId}`);

    const job: ProcessingJob = {
      id: jobId,
      videoId,
      status: 'pending',
      progress: 0,
      clips: [],
      createdAt: new Date(),
    };

    db.saveJob(job);

    // Start background processing (non-blocking)
    processClipsAsync(jobId, video.path, video.metadata.duration);

    return job;
  } catch (error) {
    console.error('Job start error:', error);
    throw error;
  }
}

/**
 * Background job processing (async, non-blocking)
 */
async function processClipsAsync(
  jobId: string,
  videoPath: string,
  videoDuration: number
): Promise<void> {
  try {
    const job = db.getJob(jobId);
    if (!job) return;

    // Step 1: Transcribe
    db.updateJob(jobId, { status: 'transcribing', progress: 10 });
    const transcript = await transcriptionServiceModule.transcribeVideo(videoPath);
    db.updateJob(jobId, { progress: 30 });

    // Step 2: Analyze with AI
    db.updateJob(jobId, { status: 'analyzing', progress: 40 });
    const analysis = await analyzeVideoTranscript(transcript, videoDuration);
    db.updateJob(jobId, { progress: 60 });

    // Step 3: Process clips
    db.updateJob(jobId, { status: 'processing', progress: 70 });
    const clips = await processingServiceModule.processClipsParallel(
      videoPath,
      analysis.clipSegments
    );
    db.updateJob(jobId, { progress: 80 });

    // Step 4: Create clip records with metadata
    const generatedClips: GeneratedClip[] = [];

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const metadata = analysis.clipMetadata[i];

      // Generate subtitles for this clip
      const subtitlePath = getClipPath(`${clip.clipId}-subtitles`, '.srt');
      await generateSRT(transcript, clip.duration, subtitlePath);

      // Generate thumbnail
      const thumbnailPath = await generateClipThumbnail(clip.clipPath, clip.clipId, 1);

      const generatedClip: GeneratedClip = {
        id: clip.clipId,
        videoId: job.videoId,
        title: metadata.title,
        description: metadata.description,
        segment: metadata.segment,
        viralScore: metadata.viralScore,
        hashtags: metadata.hashtags,
        filePath: clip.clipPath,
        subtitles: transcript.substring(0, 200), // Preview of subtitles
        thumbnailPath,
        createdAt: new Date(),
      };

      db.saveClip(generatedClip);
      generatedClips.push(generatedClip);
    }

    // Complete job
    db.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      clips: generatedClips,
      completedAt: new Date(),
    });

    console.log(`✅ Job ${jobId} completed with ${generatedClips.length} clips`);
  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error);
    db.updateJob(jobId, {
      status: 'failed',
      error: (error as Error).message,
      completedAt: new Date(),
    });
  }
}

/**
 * Generate clips synchronously (for immediate UI response)
 */
export async function generateClipsSync(videoId: string): Promise<GeneratedClip[]> {
  try {
    const video = videoServiceModule.getVideoById(videoId);
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    console.log(`🎬 Generating clips synchronously for video ${videoId}`);

    // Step 1: Transcribe
    const transcript = await transcriptionServiceModule.transcribeVideo(video.path);

    // Step 2: Analyze with AI
    const analysis = await analyzeVideoTranscript(transcript, video.metadata.duration);

    // Step 3: Process clips
    const clips = await processingServiceModule.processClipsParallel(
      video.path,
      analysis.clipSegments
    );

    // Step 4: Create clip records with metadata
    const generatedClips: GeneratedClip[] = [];

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const metadata = analysis.clipMetadata[i];

      // Generate subtitles for this clip
      const subtitlePath = getClipPath(`${clip.clipId}-subtitles`, '.srt');
      await generateSRT(transcript, clip.duration, subtitlePath);

      // Generate thumbnail
      const thumbnailPath = await generateClipThumbnail(clip.clipPath, clip.clipId, 1);

      const generatedClip: GeneratedClip = {
        id: clip.clipId,
        videoId: videoId,
        title: metadata.title,
        description: metadata.description,
        segment: metadata.segment,
        viralScore: metadata.viralScore,
        hashtags: metadata.hashtags,
        filePath: clip.clipPath,
        subtitles: transcript.substring(0, 200), // Preview of subtitles
        thumbnailPath,
        createdAt: new Date(),
      };

      db.saveClip(generatedClip);
      generatedClips.push(generatedClip);
    }

    console.log(`✅ Generated ${generatedClips.length} clips for video ${videoId}`);
    return generatedClips;
  } catch (error) {
    console.error('Sync clip generation error:', error);
    throw error;
  }
}

/**
 * Get clip by ID
 */
export function getClipById(clipId: string): GeneratedClip | undefined {
  return db.getClip(clipId);
}

/**
 * Get clips by video
 */
export function getClipsByVideo(videoId: string): GeneratedClip[] {
  return db.getClipsByVideo(videoId);
}

/**
 * Get all clips
 */
export function getAllClips(): GeneratedClip[] {
  return db.getAllClips();
}

/**
 * Delete clip
 */
export function deleteClipById(clipId: string): boolean {
  return db.deleteClip(clipId);
}

export default {
  startClipGenerationJob,
  getJobStatus,
  getClipById,
  getClipsByVideo,
  getAllClips,
  deleteClipById,
};
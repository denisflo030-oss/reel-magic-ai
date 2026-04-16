import { Request, Response } from 'express';
import { videoService, clipService } from '../services/index.js';

/**
 * Upload and process a video file
 */
export async function uploadVideo(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const video = await videoService.processUploadedVideo(
      req.file.path,
      req.file.originalname,
      req.file.size
    );

    // Generate clips immediately
    const clips = await clipService.generateClipsSync(video.id);

    res.status(201).json({
      success: true,
      data: {
        videoId: video.id,
        filename: video.filename,
        size: video.size,
        duration: video.metadata.duration,
        width: video.metadata.width,
        height: video.metadata.height,
        fps: video.metadata.fps,
        uploadedAt: video.uploadedAt,
      },
      clips: clips.map(c => ({
        id: c.id,
        title: c.title,
        download_url: `/api/clips/download/${c.id}`,
      })),
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload video',
      message: (error as Error).message,
    });
  }
}

/**
 * Get video information
 */
export async function getVideoInfo(req: Request, res: Response): Promise<void> {
  try {
    const { videoId } = req.params;
    const video = videoService.getVideoById(videoId);

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        videoId: video.id,
        filename: video.filename,
        size: video.size,
        duration: video.metadata.duration,
        width: video.metadata.width,
        height: video.metadata.height,
        fps: video.metadata.fps,
        uploadedAt: video.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Get video info error:', error);
    res.status(500).json({
      error: 'Failed to retrieve video info',
      message: (error as Error).message,
    });
  }
}

/**
 * Analyze video from URL
 */
export async function analyzeVideoUrl(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    // Download and process video from URL
    const video = await videoService.downloadVideoFromUrl(url);

    // Generate clips immediately
    const clips = await clipService.generateClipsSync(video.id);

    res.status(201).json({
      success: true,
      data: {
        videoId: video.id,
        filename: video.filename,
        size: video.size,
        duration: video.metadata.duration,
        width: video.metadata.width,
        height: video.metadata.height,
        fps: video.metadata.fps,
        uploadedAt: video.uploadedAt,
      },
      clips: clips.map(c => ({
        id: c.id,
        title: c.title,
        download_url: `/api/clips/download/${c.id}`,
      })),
    });
  } catch (error) {
    console.error('Analyze URL error:', error);
    res.status(500).json({
      error: 'Failed to analyze video from URL',
      message: (error as Error).message,
    });
  }
}

import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
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
 * Delete a video file
 */
export async function deleteVideo(req: Request, res: Response): Promise<void> {
  try {
    const { videoId } = req.params;
    const deleted = videoService.deleteVideoById(videoId);

    if (!deleted) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Video deleted successfully',
      videoId,
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      error: 'Failed to delete video',
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

/**
 * Process YouTube video
 */
export async function processYouTubeVideo(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    // Get video ID first
    const videoId = await new Promise<string>((resolve, reject) => {
      exec(`yt-dlp --print "%(id)s" "${url}"`, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to get video ID: ${error.message}`));
        } else {
          resolve(stdout.trim());
        }
      });
    });

    const outputPath = `/tmp/${videoId}.mp4`;

    // Download video
    await new Promise<void>((resolve, reject) => {
      exec(`yt-dlp -f "best[ext=mp4]" -o "${outputPath}" "${url}"`, { timeout: 300000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Download failed: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    // Get file size
    const stats = await fs.stat(outputPath);
    const fileSize = stats.size;

    // Process like uploaded video
    const video = await videoService.processUploadedVideo(outputPath, `${videoId}.mp4`, fileSize);

    // Generate clips
    const clips = await clipService.generateClipsSync(video.id);

    res.status(201).json({
      clips: clips.map(c => ({
        id: c.id,
        title: c.title,
        download_url: `/api/clips/download/${c.id}`,
      })),
    });
  } catch (error) {
    console.error('YouTube processing error:', error);
    res.status(500).json({ error: 'YouTube download failed' });
  }
}

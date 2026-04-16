import { Request, Response } from 'express';
import { videoService } from '../services/index.js';

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

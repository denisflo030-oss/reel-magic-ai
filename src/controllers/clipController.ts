import { Request, Response } from 'express';
import { clipService } from '../services/index.js';
import { createReadStream } from 'fs';

/**
 * Generate viral clips from a video using AI
 */
export async function generateClips(req: Request, res: Response): Promise<void> {
  try {
    const { videoId, numClips = 3, format = 'vertical' } = req.body;

    if (!videoId) {
      res.status(400).json({
        error: 'videoId is required',
      });
      return;
    }

    const job = await clipService.startClipGenerationJob(videoId, {
      numClips,
      format: format as 'vertical' | 'horizontal',
    });

    res.status(202).json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        videoId: job.videoId,
        createdAt: job.createdAt,
      },
      message: 'Clip generation started. Check status with the jobId.',
    });
  } catch (error) {
    console.error('Generate clips error:', error);
    res.status(500).json({
      error: 'Failed to generate clips',
      message: (error as Error).message,
    });
  }
}

/**
 * Get the status of a clip generation job
 */
export async function getClipStatus(req: Request, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = clipService.getJobStatus(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        videoId: job.videoId,
        clipsGenerated: job.clips.length,
        clips: job.clips.map((c) => ({
          clipId: c.id,
          title: c.title,
          viralScore: c.viralScore,
          duration: c.segment.duration,
          thumbnailUrl: `/api/clips/thumbnail/${c.id}`,
        })),
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      },
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve job status',
      message: (error as Error).message,
    });
  }
}

/**
 * Download a generated clip
 */
export async function downloadClip(req: Request, res: Response): Promise<void> {
  try {
    const { clipId } = req.params;
    const clip = clipService.getClipById(clipId);

    if (!clip) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }

    // Check if clip file exists
    const fs = await import('fs');
    if (!fs.existsSync(clip.filePath)) {
      res.status(404).json({ error: 'Clip file not found' });
      return;
    }

    // Set response headers for download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${clip.title.replace(/[^a-z0-9]/gi, '_')}.mp4"`
    );

    // Stream file to client
    const fileStream = createReadStream(clip.filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download clip' });
      }
    });
  } catch (error) {
    console.error('Download clip error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to download clip',
        message: (error as Error).message,
      });
    }
  }
}

/**
 * Get clip thumbnail
 */
export async function getClipThumbnail(req: Request, res: Response): Promise<void> {
  try {
    const { clipId } = req.params;
    const clip = clipService.getClipById(clipId);

    if (!clip || !clip.thumbnailPath) {
      res.status(404).json({ error: 'Thumbnail not found' });
      return;
    }

    const fs = await import('fs');
    if (!fs.existsSync(clip.thumbnailPath)) {
      res.status(404).json({ error: 'Thumbnail file not found' });
      return;
    }

    res.setHeader('Content-Type', 'image/jpeg');
    const fileStream = createReadStream(clip.thumbnailPath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Thumbnail error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to retrieve thumbnail' });
      }
    });
  } catch (error) {
    console.error('Get thumbnail error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to retrieve thumbnail',
        message: (error as Error).message,
      });
    }
  }
}

/**
 * List all generated clips
 */
export async function listClips(req: Request, res: Response): Promise<void> {
  try {
    const { videoId, limit = '10', offset = '0' } = req.query;
    const pageLimit = parseInt(limit as string);
    const pageOffset = parseInt(offset as string);

    let clips = clipService.getAllClips();

    if (videoId) {
      clips = clipService.getClipsByVideo(videoId as string);
    }

    // Pagination
    const total = clips.length;
    const paginatedClips = clips.slice(pageOffset, pageOffset + pageLimit);

    res.json({
      success: true,
      data: {
        clips: paginatedClips.map((c) => ({
          clipId: c.id,
          videoId: c.videoId,
          title: c.title,
          description: c.description,
          viralScore: c.viralScore,
          hashtags: c.hashtags,
          duration: c.segment.duration,
          downloadUrl: `/api/clips/download/${c.id}`,
          thumbnailUrl: `/api/clips/thumbnail/${c.id}`,
          createdAt: c.createdAt,
        })),
        pagination: {
          total,
          limit: pageLimit,
          offset: pageOffset,
          hasMore: pageOffset + pageLimit < total,
        },
      },
    });
  } catch (error) {
    console.error('List clips error:', error);
    res.status(500).json({
      error: 'Failed to list clips',
      message: (error as Error).message,
    });
  }
}

/**
 * Get clip details
 */
export async function getClipDetails(req: Request, res: Response): Promise<void> {
  try {
    const { clipId } = req.params;
    const clip = clipService.getClipById(clipId);

    if (!clip) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        clipId: clip.id,
        videoId: clip.videoId,
        title: clip.title,
        description: clip.description,
        segment: {
          startTime: clip.segment.startTime,
          endTime: clip.segment.endTime,
          duration: clip.segment.duration,
        },
        viralScore: clip.viralScore,
        hashtags: clip.hashtags,
        subtitles: clip.subtitles,
        downloadUrl: `/api/clips/download/${clip.id}`,
        thumbnailUrl: `/api/clips/thumbnail/${clip.id}`,
        createdAt: clip.createdAt,
      },
    });
  } catch (error) {
    console.error('Get clip details error:', error);
    res.status(500).json({
      error: 'Failed to retrieve clip details',
      message: (error as Error).message,
    });
  }
}

/**
 * Delete a generated clip
 */
export async function deleteClip(req: Request, res: Response): Promise<void> {
  try {
    const { clipId } = req.params;
    const deleted = clipService.deleteClipById(clipId);

    if (!deleted) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Clip deleted successfully',
      clipId,
    });
  } catch (error) {
    console.error('Delete clip error:', error);
    res.status(500).json({
      error: 'Failed to delete clip',
      message: (error as Error).message,
    });
  }
}

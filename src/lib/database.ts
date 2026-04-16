import {
  VideoFile,
  GeneratedClip,
  ProcessingJob,
} from '../types/index.js';

/**
 * In-memory database for development/demo
 * In production, replace with PostgreSQL/MongoDB
 */
class Database {
  private videos: Map<string, VideoFile> = new Map();
  private clips: Map<string, GeneratedClip> = new Map();
  private jobs: Map<string, ProcessingJob> = new Map();

  // Video operations
  saveVideo(video: VideoFile): void {
    this.videos.set(video.id, video);
  }

  getVideo(id: string): VideoFile | undefined {
    return this.videos.get(id);
  }

  getAllVideos(): VideoFile[] {
    return Array.from(this.videos.values());
  }

  deleteVideo(id: string): boolean {
    return this.videos.delete(id);
  }

  // Clip operations
  saveClip(clip: GeneratedClip): void {
    this.clips.set(clip.id, clip);
  }

  getClip(id: string): GeneratedClip | undefined {
    return this.clips.get(id);
  }

  getClipsByVideo(videoId: string): GeneratedClip[] {
    return Array.from(this.clips.values()).filter(
      (clip) => clip.videoId === videoId
    );
  }

  getAllClips(): GeneratedClip[] {
    return Array.from(this.clips.values());
  }

  deleteClip(id: string): boolean {
    return this.clips.delete(id);
  }

  // Job operations
  saveJob(job: ProcessingJob): void {
    this.jobs.set(job.id, job);
  }

  getJob(id: string): ProcessingJob | undefined {
    return this.jobs.get(id);
  }

  updateJob(id: string, updates: Partial<ProcessingJob>): void {
    const job = this.jobs.get(id);
    if (job) {
      this.jobs.set(id, { ...job, ...updates });
    }
  }

  getAllJobs(): ProcessingJob[] {
    return Array.from(this.jobs.values());
  }

  // Statistics
  getStats() {
    return {
      totalVideos: this.videos.size,
      totalClips: this.clips.size,
      activeJobs: Array.from(this.jobs.values()).filter(
        (j) => j.status !== 'completed' && j.status !== 'failed'
      ).length,
    };
  }
}

// Export singleton instance
export const db = new Database();

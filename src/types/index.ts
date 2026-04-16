export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
}

export interface VideoFile {
  id: string;
  filename: string;
  path: string;
  size: number;
  metadata: VideoMetadata;
  uploadedAt: Date;
}

export interface ClipSegment {
  startTime: number;
  endTime: number;
  duration: number;
}

export interface GeneratedClip {
  id: string;
  videoId: string;
  title: string;
  description: string;
  segment: ClipSegment;
  viralScore: number;
  hashtags: string[];
  filePath: string;
  subtitles: string;
  thumbnailPath?: string;
  createdAt: Date;
}

export interface AnalysisResult {
  transcript: string;
  clipSegments: ClipSegment[];
  clipMetadata: Array<{
    segment: ClipSegment;
    title: string;
    description: string;
    viralScore: number;
    hashtags: string[];
  }>;
}

export interface ProcessingJob {
  id: string;
  videoId: string;
  status: 'pending' | 'analyzing' | 'transcribing' | 'processing' | 'completed' | 'failed';
  progress: number;
  clips: GeneratedClip[];
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

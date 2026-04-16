# Integration Manual & Examples

Complete guide for integrating and using Reel Magic AI backend.

## System Overview

Reel Magic AI provides an AI-powered video analysis and clip generation API. It:

1. **Accepts video uploads** (any size up to 2GB)
2. **Transcribes audio** using OpenAI Whisper
3. **Analyzes content** using GPT-4o to find viral moments
4. **Generates clips** automatically using FFmpeg
5. **Returns ready-to-use assets** with metadata

All processing is **asynchronous** and **non-blocking**, so your API requests return immediately while the server processes in the background.

## Getting Started

### 1. Start the Server

```bash
npm install
npm run dev
```

Server runs at `http://localhost:3000`

### 2. Verify It's Working

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"..."}
```

## Complete Workflow Example

### Step 1: Upload a Video

```bash
curl -X POST -F "video=@my-podcast.mp4" \
  http://localhost:3000/api/videos/upload
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "my-podcast.mp4",
    "size": 524288000,
    "duration": 3600,
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "uploadedAt": "2026-04-16T10:30:00.000Z"
  }
}
```

**Important:** Save the `videoId` for next steps.

### Step 2: Start Clip Generation

```bash
curl -X POST http://localhost:3000/api/clips/generate \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "numClips": 3,
    "format": "vertical"
  }'
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job-7c8d9e0f-a1b2-c3d4-e5f6-g7h8i9j0k1l2",
    "status": "pending",
    "progress": 0,
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-16T10:30:05.000Z"
  },
  "message": "Clip generation started. Check status with the jobId."
}
```

**Save the `jobId`** to monitor progress.

### Step 3: Monitor Job Status

Poll the status endpoint to track progress:

```bash
curl http://localhost:3000/api/clips/status/job-7c8d9e0f-a1b2-c3d4-e5f6-g7h8i9j0k1l2
```

**Response (while processing):**
```json
{
  "success": true,
  "data": {
    "jobId": "job-7c8d9e0f-a1b2-c3d4-e5f6-g7h8i9j0k1l2",
    "status": "transcribing",
    "progress": 20,
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "clipsGenerated": 0,
    "clips": [],
    "createdAt": "2026-04-16T10:30:05.000Z"
  }
}
```

**Processing stages:**
- `transcribing` (10-30%) - Extracting audio and using Whisper
- `analyzing` (30-60%) - Using GPT-4o to find viral moments
- `processing` (60-80%) - Cutting clips with FFmpeg
- `completed` (100%) - Ready!

### Step 4: Retrieve Generated Clips

Once status is `completed`, clips are ready:

```bash
curl http://localhost:3000/api/clips/status/job-7c8d9e0f-a1b2-c3d4-e5f6-g7h8i9j0k1l2
```

**Response (when complete):**
```json
{
  "success": true,
  "data": {
    "jobId": "job-7c8d9e0f-a1b2-c3d4-e5f6-g7h8i9j0k1l2",
    "status": "completed",
    "progress": 100,
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "clipsGenerated": 3,
    "clips": [
      {
        "clipId": "clip-001",
        "title": "OMG Plot Twist!",
        "viralScore": 9,
        "duration": 30,
        "thumbnailUrl": "/api/clips/thumbnail/clip-001"
      },
      {
        "clipId": "clip-002",
        "title": "Best Moment Ever",
        "viralScore": 8,
        "duration": 25,
        "thumbnailUrl": "/api/clips/thumbnail/clip-002"
      },
      {
        "clipId": "clip-003",
        "title": "You Won't Believe This",
        "viralScore": 7,
        "duration": 20,
        "thumbnailUrl": "/api/clips/thumbnail/clip-003"
      }
    ],
    "createdAt": "2026-04-16T10:30:05.000Z",
    "completedAt": "2026-04-16T10:35:30.000Z"
  }
}
```

### Step 5: Get Clip Details

For detailed information about a clip:

```bash
curl http://localhost:3000/api/clips/clip-001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clipId": "clip-001",
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "OMG Plot Twist!",
    "description": "The shocking moment everyone missed",
    "segment": {
      "startTime": 1234.5,
      "endTime": 1264.5,
      "duration": 30
    },
    "viralScore": 9,
    "hashtags": [
      "#viral",
      "#plot",
      "#drama",
      "#shocked",
      "#entertainment"
    ],
    "subtitles": "Preview of the transcript...",
    "downloadUrl": "/api/clips/download/clip-001",
    "thumbnailUrl": "/api/clips/thumbnail/clip-001",
    "createdAt": "2026-04-16T10:35:30.000Z"
  }
}
```

### Step 6: Download Clips

Download the actual MP4 file:

```bash
curl http://localhost:3000/api/clips/download/clip-001 -o my-viral-clip.mp4
```

Or embed in HTML:
```html
<a href="/api/clips/download/clip-001" download="viral-clip.mp4">
  Download Clip
</a>
```

### Step 7: Display Thumbnails

Show clip thumbnails:

```html
<img 
  src="/api/clips/thumbnail/clip-001" 
  alt="Viral clip thumbnail"
  width="320"
  height="240"
/>
```

## Frontend Integration Examples

### React Example

```typescript
import { useState } from 'react';

function VideoUploadComponent() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('video', file);

    const res = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setVideoId(data.data.videoId);
  };

  const handleGenerateClips = async () => {
    if (!videoId) return;

    const res = await fetch('/api/clips/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId,
        numClips: 3,
        format: 'vertical',
      }),
    });
    const data = await res.json();
    setJobId(data.data.jobId);

    // Poll for updates
    pollJobStatus(data.data.jobId);
  };

  const pollJobStatus = async (id: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/clips/status/${id}`);
      const data = await res.json();

      setProgress(data.data.progress);

      if (data.data.status === 'completed') {
        setClips(data.data.clips);
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      />
      <button onClick={handleGenerateClips} disabled={!videoId}>
        Generate Clips
      </button>

      {jobId && <p>Progress: {progress}%</p>}

      {clips.map((clip) => (
        <div key={clip.clipId}>
          <h3>{clip.title}</h3>
          <img src={clip.thumbnailUrl} alt={clip.title} />
          <a href={`/api/clips/download/${clip.clipId}`}>Download</a>
        </div>
      ))}
    </div>
  );
}

export default VideoUploadComponent;
```

### JavaScript Vanilla Example

```javascript
const API_URL = 'http://localhost:3000';

async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch(`${API_URL}/api/videos/upload`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

async function generateClips(videoId) {
  const response = await fetch(`${API_URL}/api/clips/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoId,
      numClips: 3,
      format: 'vertical',
    }),
  });

  return response.json();
}

async function checkJobStatus(jobId) {
  const response = await fetch(`${API_URL}/api/clips/status/${jobId}`);
  return response.json();
}

async function downloadClip(clipId, filename = 'clip.mp4') {
  const response = await fetch(`${API_URL}/api/clips/download/${clipId}`);
  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// Usage
document.getElementById('upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const uploadRes = await uploadVideo(file);
  const videoId = uploadRes.data.videoId;

  const clipRes = await generateClips(videoId);
  const jobId = clipRes.data.jobId;

  // Poll status
  const statusCheck = setInterval(async () => {
    const status = await checkJobStatus(jobId);
    console.log(`Progress: ${status.data.progress}%`);

    if (status.data.status === 'completed') {
      clearInterval(statusCheck);
      status.data.clips.forEach((clip) => {
        console.log(`Download: ${clip.clipId}`);
      });
    }
  }, 2000);
});
```

## Advanced Usage

### Batch Processing Multiple Videos

```bash
#!/bin/bash

for video in videos/*.mp4; do
  echo "Processing: $video"
  
  # Upload
  RESPONSE=$(curl -s -X POST -F "video=@$video" \
    http://localhost:3000/api/videos/upload)
  VIDEO_ID=$(echo "$RESPONSE" | jq -r '.data.videoId')
  
  # Generate clips
  CLIP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/clips/generate \
    -H "Content-Type: application/json" \
    -d "{\"videoId\": \"$VIDEO_ID\"}")
  JOB_ID=$(echo "$CLIP_RESPONSE" | jq -r '.data.jobId')
  
  echo "Job ID: $JOB_ID"
done
```

### Webhook Integration

For production, listen to job completion events:

```typescript
// In your frontend/backend
const checkStatus = async (jobId: string) => {
  const response = await fetch(`/api/clips/status/${jobId}`);
  const data = await response.json();
  
  if (data.data.status === 'completed') {
    // Send to webhook
    await fetch('https://your-app.com/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        clips: data.data.clips,
        timestamp: new Date(),
      }),
    });
  }
};
```

### Error Handling

```typescript
async function safeGenerateClips(videoId: string) {
  try {
    const response = await fetch('/api/clips/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Generation failed:', error.message);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}
```

## Monitoring & Analytics

Track available metrics:

```bash
curl http://localhost:3000/api/info | jq '.stats'
```

Response:
```json
{
  "totalVideos": 42,
  "totalClips": 156,
  "activeJobs": 3
}
```

## Production Considerations

### 1. Database Integration

Replace in-memory storage:

```typescript
// src/lib/database.ts
import pg from 'pg';

export async function saveVideo(video: VideoFile) {
  const client = new pg.Client();
  await client.query(
    'INSERT INTO videos (id, filename, duration) VALUES ($1, $2, $3)',
    [video.id, video.filename, video.metadata.duration]
  );
}
```

### 2. Job Queue

Use Redis + BullMQ for reliability:

```typescript
import Bull from 'bull';

const clipQueue = new Bull('clip-generation', {
  redis: { url: process.env.REDIS_URL },
});

clipQueue.process(async (job) => {
  // Process clip generation
  return await processClipsAsync(
    job.data.jobId,
    job.data.videoPath,
    job.data.duration
  );
});
```

### 3. Cloud Storage

Store videos on S3:

```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export async function uploadToS3(filePath: string) {
  const fileContent = fs.readFileSync(filePath);
  await s3.putObject({
    Bucket: 'my-bucket',
    Key: path.basename(filePath),
    Body: fileContent,
  }).promise();
}
```

## Testing

Run the integration test:

```bash
./test-api.sh path/to/video.mp4
```

Or use provided `test-api.sh` script.

---

For complete API reference, see [API.md](./API.md)

# Reel Magic AI - API Documentation

## Overview

Reel Magic AI is a production-ready AI video processing backend that automatically analyzes videos, generates viral clips, transcribes audio, and creates short-form content optimized for social media platforms like TikTok, Instagram Reels, and YouTube Shorts.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API is open. For production deployment, add API key authentication in `src/middleware/auth.ts`.

## Response Format

All responses are JSON. Errors include a message and optional details:

```json
{
  "success": true,
  "data": { ...  },
  "message": "Optional message"
}
```

Error responses:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## Endpoints

### Server

#### Health Check
```http
GET /health
```

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-16T10:30:00.000Z"
}
```

#### Server Info
```http
GET /api/info
```

Returns server statistics and information.

**Response:**
```json
{
  "status": "ok",
  "server": "Reel Magic AI - AI Video Processing Backend",
  "version": "1.0.0",
  "stats": {
    "totalVideos": 5,
    "totalClips": 15,
    "activeJobs": 2
  },
  "timestamp": "2026-04-16T10:30:00.000Z"
}
```

---

### Videos

#### Upload Video
```http
POST /api/videos/upload
Content-Type: multipart/form-data

{
  "video": <file>
}
```

Uploads and processes a video file. Extracts metadata using FFmpeg.

**Parameters:**
- `video` (File, required): Video file (MP4, MOV, AVI, MKV). Max 2GB.

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "my-video.mp4",
    "size": 1024000,
    "duration": 120.5,
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "uploadedAt": "2026-04-16T10:30:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST -F "video=@video.mp4" http://localhost:3000/api/videos/upload
```

---

#### Get Video Info
```http
GET /api/videos/:videoId
```

Retrieves information about an uploaded video.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "my-video.mp4",
    "size": 1024000,
    "duration": 120.5,
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "uploadedAt": "2026-04-16T10:30:00.000Z"
  }
}
```

---

#### Delete Video
```http
DELETE /api/videos/:videoId
```

Deletes a video and all associated clips.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Video deleted successfully",
  "videoId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Clips

#### Generate Clips (Start Job)
```http
POST /api/clips/generate
Content-Type: application/json

{
  "videoId": "550e8400-e29b-41d4-a716-446655440000",
  "numClips": 3,
  "format": "vertical"
}
```

Starts a background job to analyze the video and generate viral clips using AI.

**Request Body:**
- `videoId` (string, required): ID of the video to analyze
- `numClips` (integer, optional): Number of clips to generate (default: 3)
- `format` (string, optional): Clip format - `vertical` or `horizontal` (default: vertical)

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "jobId": "job-550e8400-e29b-41d4-a716",
    "status": "pending",
    "progress": 0,
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-16T10:30:00.000Z"
  },
  "message": "Clip generation started. Check status with the jobId."
}
```

**Processing Steps:**
1. `transcribing` - Extracting and transcribing audio (10-30% progress)
2. `analyzing` - Using GPT-4o to identify viral moments (30-60% progress)
3. `processing` - Cutting video clips with FFmpeg (60-80% progress)
4. `completed` - All clips ready (100% progress)

---

#### Get Job Status
```http
GET /api/clips/status/:jobId
```

Retrieves the status of a clip generation job.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "jobId": "job-550e8400-e29b-41d4-a716",
    "status": "completed",
    "progress": 100,
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "clipsGenerated": 3,
    "clips": [
      {
        "clipId": "clip-123",
        "title": "OMG This Plot Twist!",
        "viralScore": 9,
        "duration": 30,
        "thumbnailUrl": "/api/clips/thumbnail/clip-123"
      },
      {
        "clipId": "clip-124",
        "title": "The Best Moment",
        "viralScore": 8,
        "duration": 25,
        "thumbnailUrl": "/api/clips/thumbnail/clip-124"
      },
      {
        "clipId": "clip-125",
        "title": "You Won't Believe This",
        "viralScore": 7,
        "duration": 20,
        "thumbnailUrl": "/api/clips/thumbnail/clip-125"
      }
    ],
    "createdAt": "2026-04-16T10:30:00.000Z",
    "completedAt": "2026-04-16T10:35:00.000Z"
  }
}
```

---

#### List Clips
```http
GET /api/clips?videoId=xxx&limit=10&offset=0
```

Lists generated clips with pagination.

**Query Parameters:**
- `videoId` (string, optional): Filter by video ID
- `limit` (integer, optional): Results per page (default: 10)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clips": [
      {
        "clipId": "clip-123",
        "videoId": "550e8400-e29b-41d4-a716-446655440000",
        "title": "OMG This Plot Twist!",
        "description": "The shocking moment nobody expected",
        "viralScore": 9,
        "hashtags": ["#viral", "#drama", "#wow", "#trending", "#plot"],
        "duration": 30,
        "downloadUrl": "/api/clips/download/clip-123",
        "thumbnailUrl": "/api/clips/thumbnail/clip-123",
        "createdAt": "2026-04-16T10:35:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

#### Get Clip Details
```http
GET /api/clips/:clipId
```

Retrieves full details of a generated clip.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clipId": "clip-123",
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "OMG This Plot Twist!",
    "description": "The shocking moment nobody expected",
    "segment": {
      "startTime": 45.5,
      "endTime": 75.5,
      "duration": 30
    },
    "viralScore": 9,
    "hashtags": ["#viral", "#drama", "#wow", "#trending", "#plot"],
    "subtitles": "Here is the transcript preview...",
    "downloadUrl": "/api/clips/download/clip-123",
    "thumbnailUrl": "/api/clips/thumbnail/clip-123",
    "createdAt": "2026-04-16T10:35:00.000Z"
  }
}
```

---

#### Download Clip
```http
GET /api/clips/download/:clipId
```

Downloads the generated clip video file (MP4).

**Response:** `200 OK`
- Content-Type: `video/mp4`
- File attachment with proper headers

**Example:**
```bash
curl http://localhost:3000/api/clips/download/clip-123 -o my-clip.mp4
```

Or use in HTML:
```html
<a href="/api/clips/download/clip-123">Download Clip</a>
```

---

#### Get Clip Thumbnail
```http
GET /api/clips/thumbnail/:clipId
```

Gets the thumbnail image for a clip (JPEG).

**Response:** `200 OK`
- Content-Type: `image/jpeg`

**Example:**
```html
<img src="/api/clips/thumbnail/clip-123" alt="Clip thumbnail" />
```

---

#### Delete Clip
```http
DELETE /api/clips/:clipId
```

Deletes a generated clip and associated files.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Clip deleted successfully",
  "clipId": "clip-123"
}
```

---

## Examples

### Complete Workflow

#### 1. Upload a video
```bash
curl -X POST -F "video=@podcast.mp4" http://localhost:3000/api/videos/upload
# Returns: { videoId: "vid-xxx" }
```

#### 2. Get video info
```bash
curl http://localhost:3000/api/videos/vid-xxx
```

#### 3. Generate clips (start async job)
```bash
curl -X POST http://localhost:3000/api/clips/generate \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "vid-xxx",
    "numClips": 3,
    "format": "vertical"
  }'
# Returns: { jobId: "job-yyy" }
```

#### 4. Check job status (poll)
```bash
curl http://localhost:3000/api/clips/status/job-yyy
# Shows progress and clips when ready
```

#### 5. Download a clip
```bash
curl http://localhost:3000/api/clips/download/clip-zzz -o clip.mp4
```

#### 6. List all clips from a video
```bash
curl "http://localhost:3000/api/clips?videoId=vid-xxx"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "videoId is required"
}
```

### 404 Not Found
```json
{
  "error": "Video not found"
}
```

### 413 Payload Too Large
```json
{
  "error": "File too large",
  "message": "Maximum file size is 2GB"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process video",
  "message": "Detailed error message"
}
```

---

## Architecture

### Processing Pipeline

```
Video Upload
    ↓
FFmpeg Extract Audio
    ↓
Whisper Transcription
    ↓
GPT-4o Analysis (Find Viral Moments)
    ↓
FFmpeg Clip Extraction (Parallel)
    ↓
Generate Subtitles & Thumbnails
    ↓
Return Clip Metadata
```

### Technology Stack

- **Server**: Express.js (Node.js)
- **Language**: TypeScript
- **AI**: OpenAI GPT-4o + Whisper API
- **Video**: FFmpeg + fluent-ffmpeg
- **Storage**: Local filesystem (swap for S3 in production)
- **Database**: In-memory (swap for PostgreSQL in production)

---

## Deployment

### Environment Variables

```bash
OPENAI_API_KEY=sk-...              # Required: OpenAI API key
PORT=3000                          # Optional: Server port
NODE_ENV=production               # Optional: Environment
UPLOAD_DIR=./uploads              # Optional: Upload directory
```

### Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

**start command:** `npm start`
**build command:** `npm run build`

See `render.yaml` for full configuration.

---

## Rate Limiting

For production, add rate limiting:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Production Checklist

- [ ] Replace in-memory database with PostgreSQL
- [ ] Add Redis for job queue (BullMQ)
- [ ] Use S3/GCS for video storage
- [ ] Add API authentication (JWT or API keys)
- [ ] Add rate limiting
- [ ] Enable HTTPS only
- [ ] Add CORS restrictions
- [ ] Set up monitoring & logging (Sentry, DataDog)
- [ ] Add input validation & sanitization
- [ ] Enable request logging
- [ ] Set up CI/CD pipeline
- [ ] Add database backups
- [ ] Configure CDN for clip downloads

---

## Support

For issues or questions, check the [README.md](../README.md) or create an issue on GitHub.

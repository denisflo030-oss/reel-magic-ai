# 🎬 Reel Magic AI

AI-powered video processing backend for generating viral clips. Automatically analyze videos, extract highlights, generate subtitles, and create short-form content optimized for social media (TikTok, Instagram Reels, YouTube Shorts).

**Production-ready SaaS AI backend** — like Ssemble, but fully customizable.

## ✨ Features

- **📹 Video Upload & Processing** — Handle large video files with FFmpeg
- **🤖 AI-Powered Analysis** — Use OpenAI GPT-4o to identify viral moments in seconds
- **🎤 Automatic Transcription** — Generate high-quality transcripts with Whisper API
- **✂️ Smart Clip Generation** — Automatically extract and export viral segments
- **📱 Format Conversion** — Convert to vertical (9:16) format for mobile-first platforms
- **📝 Subtitle Generation** — Auto-generate SRT/VTT subtitles for accessibility
- **🎨 Thumbnail Generation** — Create clip thumbnails automatically
- **⚡ Async Processing** — Non-blocking background jobs for fast API responses
- **🔄 REST API** — Fully RESTful API with JSON responses, designed for integration
- **📊 Job Status Tracking** — Real-time progress updates (0-100%)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Reel Magic AI                             │
├─────────────────────────────────────────────────────────────┤
│  Express.js Server (TypeScript) with CORS & Async handling  │
├─────────────────┬──────────────┬──────────────┬─────────────┤
│  Video Upload   │ Clip Gen Job │ Transcription│  Download   │
│  & Metadata     │  Orchestration│  & Subtitles│  & Streaming│
├─────────────────┴──────────────┴──────────────┴─────────────┤
│                                                               │
│  FFmpeg         GPT-4o          Whisper API   Local Storage  │
│  (video)        (analysis)      (audio→text)  (clips/video)  │
└─────────────────────────────────────────────────────────────┘
```

Processing Pipeline:
```
Upload → Transcribe → Analyze → Process Clips → Save → Return URLs
          (Whisper)  (GPT-4o)  (FFmpeg)         (Metadata)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** with npm
- **FFmpeg** installed on system:
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `apt-get install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- **OpenAI API key** (from [platform.openai.com](https://platform.openai.com))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd reel-magic-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   PORT=3000
   NODE_ENV=development
   UPLOAD_DIR=./uploads
   ```

4. **Build TypeScript:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   # Development (with hot reload)
   npm run dev

   # Production
   npm start
   ```

The server will be available at `http://localhost:3000`

6. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

## 📚 API Quick Reference

### Upload a Video
```bash
curl -X POST -F "video=@example.mp4" http://localhost:3000/api/videos/upload
```

### Generate Viral Clips
```bash
curl -X POST http://localhost:3000/api/clips/generate \
  -H "Content-Type: application/json" \
  -d '{"videoId": "vid-xxx", "numClips": 3}'
```

### Check Job Status
```bash
curl http://localhost:3000/api/clips/status/job-xxx
```

### List All Clips
```bash
curl http://localhost:3000/api/clips
```

### Download a Clip
```bash
curl http://localhost:3000/api/clips/download/clip-xxx -o my-clip.mp4
```

For full API documentation, see [API.md](./API.md)

## 📁 Project Structure

```
reel-magic-ai/
├── src/
│   ├── index.ts                    # Server entry point
│   ├── app.ts                      # Express app configuration
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── lib/
│   │   ├── ffmpeg.ts              # FFmpeg video processing
│   │   ├── ai.ts                  # OpenAI GPT-4o integration
│   │   ├── subtitles.ts           # Whisper transcription
│   │   ├── database.ts            # In-memory data storage
│   │   └── storage.ts             # File system management
│   ├── services/
│   │   ├── videoService.ts        # Video upload logic
│   │   ├── transcriptionService.ts# Audio transcription
│   │   ├── processingService.ts   # FFmpeg orchestration
│   │   ├── clipService.ts         # Main orchestration
│   │   └── index.ts               # Service exports
│   ├── controllers/
│   │   ├── videoController.ts     # /api/videos endpoints
│   │   └── clipController.ts      # /api/clips endpoints
│   └── routes/
│       ├── videos.ts              # Video routes
│       └── clips.ts               # Clip routes
├── public/
│   └── index.html                 # Dashboard/status page
├── dist/                          # Compiled JavaScript (generated)
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── API.md                         # Full API documentation
├── render.yaml                    # Render deployment config
└── README.md                      # This file
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev       # Start dev server with hot reload (tsx watch)
npm run build     # Compile TypeScript to dist/
npm start         # Run production server
npm run lint      # Run ESLint for code quality
npm run format    # Format code with Prettier
```

### Debugging

Enable detailed logs in development:
```bash
NODE_ENV=development npm run dev
```

### Code Quality

The project uses:
- **TypeScript** — Full type safety
- **ESLint** — Code quality rules
- **Prettier** — Code formatting
- **Strict Mode** — TypeScript strict mode enabled

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create service in `src/services/` if needed
3. Add route in `src/routes/`
4. Update types in `src/types/`

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | — | OpenAI API key for GPT-4o and Whisper |
| `PORT` | ❌ No | `3000` | Server port |
| `NODE_ENV` | ❌ No | `development` | Environment (development/production) |
| `UPLOAD_DIR` | ❌ No | `./uploads` | Video upload directory |

## 📊 Processing Status

Jobs have 5 states:

| Status | Progress | Description |
|--------|----------|-------------|
| `pending` | 0% | Job queued, waiting to start |
| `transcribing` | 10-30% | Extracting audio and transcribing with Whisper |
| `analyzing` | 30-60% | Using GPT-4o to find viral moments |
| `processing` | 60-80% | Cutting video clips with FFmpeg |
| `completed` | 100% | All clips ready for download |
| `failed` | — | Error during processing (see error message) |

Monitor progress:
```bash
curl http://localhost:3000/api/clips/status/job-xxx
```

## 🚢 Production Deployment

### Render (Recommended)

1. **Push to GitHub** (if not already there)

2. **Create Render Service:**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repository
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Add Environment Variables:**
   - `OPENAI_API_KEY` - your API key
   - `NODE_ENV` - set to `production`

4. **Deploy:** Click "Deploy"

Render will automatically run `npm install` and your deployment will be live.

### Docker (Alternative)

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t reel-magic-ai .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... reel-magic-ai
```

### Important for Production

- [ ] **Database**: Replace in-memory database with PostgreSQL
  ```typescript
  // src/lib/database.ts
  // Replace Map() with PostgreSQL queries
  ```

- [ ] **Job Queue**: Use Redis + BullMQ for reliable background jobs
  ```bash
  npm install bull redis
  ```

- [ ] **Storage**: Use AWS S3 or similar for video storage
  ```typescript
  // src/lib/storage.ts
  // Replace fs with S3 uploads
  ```

- [ ] **API Authentication**: Add API key validation
  ```typescript
  // src/middleware/auth.ts
  ```

- [ ] **Rate Limiting**: Prevent abuse
  ```typescript
  import rateLimit from 'express-rate-limit';
  ```

- [ ] **Monitoring**: Set up error tracking
  ```bash
  npm install @sentry/node
  ```

- [ ] **Logging**: Replace console.log with proper logging
  ```bash
  npm install winston
  ```

- [ ] **HTTPS**: Force HTTPS in production
- [ ] **CORS**: Restrict to your domain
- [ ] **Input Validation**: Validate all inputs
- [ ] **Caching**: Add Redis caching for frequently accessed clips

## 📝 Costs & Pricing

### API Costs

**OpenAI:**
- GPT-4o: ~$0.015/1K input tokens (3-5 min video = ~$0.05-0.10)
- Whisper: $0.02 per minute of audio (~$0.30 for 15 min video)
- Total per video: ~$0.40 per video

**AWS S3** (if using cloud storage):
- Storage: $0.023/GB/month
- Transfers: $0.09/GB

**Example SaaS Pricing:**
- Free tier: 1 video/month
- Pro: $9.99/month (5 videos)
- Enterprise: Custom

## 🔒 Security

- Validate file uploads (size, type)
- Sanitize user input
- Use HTTPS in production
- Add rate limiting
- Enable CORS restrictions
- Validate API requests
- Store API keys securely (.env, not in git)

## 🐛 Troubleshooting

### FFmpeg not found
```bash
# Check FFmpeg is installed
ffmpeg -version

# Install on Ubuntu
sudo apt-get install ffmpeg

# Install on macOS
brew install ffmpeg
```

### OpenAI API errors
```bash
# Check API key is valid
# Check account has credits
# Check rate limits aren't exceeded
```

### Large file uploads timeout
```bash
# Increase timeout in app.ts
app.use(express.json({ timeout: '60000ms' }));
```

### Storage permission errors
```bash
# Create uploads directory
mkdir -p uploads/clips
chmod 755 uploads
```

## 📈 Performance Tips

1. **Parallel Processing** — The system processes multiple clips in parallel
2. **Caching** — Cache transcripts to avoid re-transcribing
3. **CDN** — Serve clips from CDN (CloudFlare, AWS CloudFront)
4. **Compression** — Pre-compress videos before upload
5. **Database Indexing** — Index videos and clips by ID

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

MIT — See LICENSE file

## 🙋 Support

- 📖 Read [API.md](./API.md) for full API documentation
- 🐛 Report bugs on GitHub Issues
- 💬 Ask questions in Discussions

## 🎯 Roadmap

- [ ] Web UI for video upload and clip preview
- [ ] Webhooks for job completion
- [ ] Batch processing
- [ ] Custom AI models
- [ ] Multi-language support
- [ ] API rate limiting tiers
- [ ] User accounts and authentication
- [ ] Watermark customization
- [ ] Music/sound effects library
- [ ] Export to TikTok/Instagram directly

---

**Made with ❤️ for creators and developers**
# 🚀 Render Deployment Guide - Reel Magic AI

Complete step-by-step guide to deploy AI video processing SaaS to Render.

## ✅ Prerequisites

- GitHub account with pushed code (already done ✓)
- Render account (free tier available)
- OpenAI API key
- ~2 minutes to deploy

## 📋 Step-by-Step Deployment

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click "Sign Up"
3. Use GitHub account to sign in
4. Authorize Render to access your repositories

### Step 2: Connect Repository

1. On Render dashboard, click **New +** → **Web Service**
2. Select **GitHub** as the repository source
3. Click **Connect account** if needed
4. Search for `reel-magic-ai`
5. Click **Connect** next to the repository

### Step 3: Configure Web Service

**Name:**
```
reel-magic-ai
```

**Environment:**
```
Node
```

**Build Command:** (IMPORTANT - includes FFmpeg)
```bash
apt-get update && apt-get install -y ffmpeg && npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Instance Type:**
```
Standard (start with this, upgrade if needed)
```

### Step 4: Add Environment Variables

Click **Environment** on the sidebar, then add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `OPENAI_API_KEY` | `sk-proj-...` | Paste your OpenAI API key |
| `NODE_ENV` | `production` | Important for performance |
| `PORT` | `10000` | Render default |

### Step 5: Deploy

1. Scroll to bottom
2. Click **Create Web Service**
3. Wait for deployment (2-5 minutes)
4. Once deployed, you'll see a URL like: `https://reel-magic-ai.onrender.com`

### Step 6: Verify Deployment

Once the deployment shows **Live**, test it:

```bash
curl https://reel-magic-ai.onrender.com/health
```

You should get:
```json
{"status":"ok","timestamp":"..."}
```

---

## 🎯 Your Live SaaS Backend

Once deployed, you have a production AI video processing API:

### Upload a Video
```bash
curl -X POST -F "video=@video.mp4" \
  https://reel-magic-ai.onrender.com/api/videos/upload
```

### Generate Viral Clips
```bash
curl -X POST https://reel-magic-ai.onrender.com/api/clips/generate \
  -H "Content-Type: application/json" \
  -d '{"videoId": "vid-xxx"}'
```

### Check Progress
```bash
curl https://reel-magic-ai.onrender.com/api/clips/status/job-xxx
```

### Download Clips
```bash
curl https://reel-magic-ai.onrender.com/api/clips/download/clip-xxx \
  -o my-viral-clip.mp4
```

---

## 🔧 Render Configuration Details

### Build Command Breakdown

```bash
apt-get update && apt-get install -y ffmpeg && npm install && npm run build
```

1. `apt-get update` - Update package manager
2. `apt-get install -y ffmpeg` - Install FFmpeg (required for video processing)
3. `npm install` - Install Node dependencies
4. `npm run build` - Compile TypeScript to JavaScript

This ensures FFmpeg is available in the production container.

### Start Command

```bash
npm start
```

Runs the compiled server from `dist/index.js`

### Health Check

Render pings `/health` endpoint to verify the server is running.

---

## 📊 Monitoring & Logs

### View Logs

1. Go to your service on Render
2. Click **Logs** tab
3. See real-time server logs

### Common Issues

**FFmpeg not found:**
- Already fixed in build command ✓
- Render installs FFmpeg during build

**OpenAI API errors:**
- Check API key is correct
- Verify key starts with `sk-proj-`
- Ensure your OpenAI account has credits

**Video processing slow:**
- Normal for large videos (10-30 min video takes 5-10 minutes)
- Standard tier may be slower
- Upgrade to Professional tier for better performance

---

## 💰 Render Pricing

| Plan | Price | Good For |
|------|-------|----------|
| **Free** | $0 | Testing (auto-spins down) |
| **Standard** | $7/month | Production (recommended) |
| **Professional** | $12+/month | High traffic |

**Recommended:** Start with Standard ($7/month)

---

## 🔄 Continuous Deployment

Once deployed, Render automatically deploys when you push to GitHub:

1. Update code locally
2. Commit changes
3. Push to GitHub
4. Render automatically rebuilds and deploys
5. No manual intervention needed

---

## 📈 Scaling on Render

### Database (Currently In-Memory)

For production, replace in-memory database:

**Option 1: Free PostgreSQL on Render**
1. Create Postgres database on Render
2. Connect string in environment variables
3. Update `src/lib/database.ts` to use PostgreSQL

**Option 2: MongoDB Atlas**
1. Free tier available
2. Easy to set up
3. Update database service

### Storage (Currently Local Filesystem)

For production, use cloud storage:

**Option: AWS S3**
1. Create S3 bucket
2. Create IAM credentials
3. Update `src/lib/storage.ts` to use S3
4. Add access keys to environment variables

---

## 🎁 Features Available

✅ AI video analysis (GPT-4o)
✅ Video upload (2GB max)
✅ Whisper transcription
✅ FFmpeg processing
✅ Async clip generation
✅ Job progress tracking
✅ Clip downloads
✅ Thumbnail generation
✅ Subtitle generation

---

## 📞 Support

### Render Help
- [Render Docs](https://render.com/docs)
- [Render Status](https://status.render.com)

### Reel Magic AI
- Check [API.md](../API.md) for API reference
- Check [INTEGRATION.md](../INTEGRATION.md) for examples
- Read [README.md](../README.md) for overview

---

## 🚀 Next Steps

1. ✅ Deploy to Render (completed above)
2. 🧪 Test the health endpoint
3. 📤 Upload a test video
4. 🎬 Generate clips
5. 💾 Download results

---

## 📲 Integration Examples

### Frontend (React)

```typescript
const API_URL = 'https://reel-magic-ai.onrender.com';

async function uploadVideo(file: File) {
  const formData = new FormData();
  formData.append('video', file);
  
  const response = await fetch(`${API_URL}/api/videos/upload`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}
```

### Frontend (JavaScript)

```javascript
const API_URL = 'https://reel-magic-ai.onrender.com';

document.getElementById('upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('video', file);
  
  const res = await fetch(`${API_URL}/api/videos/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  console.log('Video ID:', data.data.videoId);
});
```

---

## 🎯 Render Deployment Checklist

- [ ] Render account created
- [ ] Repository connected
- [ ] Build command set (with FFmpeg)
- [ ] Start command set
- [ ] Environment variables added:
  - [ ] OPENAI_API_KEY
  - [ ] NODE_ENV=production
  - [ ] PORT=10000
- [ ] Service created
- [ ] Deployment started
- [ ] Health check passing
- [ ] Video upload tested
- [ ] Clip generation tested

---

## 🔐 Security Notes

1. **Never commit `.env` file** (already in .gitignore ✓)
2. **API keys in Render dashboard** (environment variables)
3. **HTTPS enabled** (Render automatic)
4. **CORS enabled** (Express configured)
5. **Input validation** (All endpoints validate)

---

**✅ Your Reel Magic AI is now live on Render!**

Share your URL with others to start processing videos.

---

Last Updated: April 16, 2026

# 🚀 Render Deployment Guide

Deploy Reel Magic AI to Render in **5 minutes**. Completely free tier available.

## Prerequisites

✅ GitHub account with the repo pushed
✅ OpenAI API key (from platform.openai.com)
✅ Render account (free at render.com)

---

## Step 1: Push to GitHub

Ensure your code is on GitHub:

```bash
cd /workspaces/reel-magic-ai

# Initialize Git (if not already done)
git config user.name "Your Name"
git config user.email "your@email.com"

# Create GitHub repo and push
git add .
git commit -m "Initial Reel Magic AI backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reel-magic-ai.git
git push -u origin main
```

✅ Your code is now on GitHub

---

## Step 2: Create Render Web Service

### 2.1 Go to [render.com](https://render.com)

- Sign up (free account)
- Click **"New +"** → **"Web Service"**

### 2.2 Connect GitHub Repository

- Click **"Connect account"** (GitHub)
- Select your **reel-magic-ai** repository
- Click **"Connect"**

### 2.3 Configure Web Service

Fill in the following:

**General Settings:**
- **Name:** `reel-magic-ai`
- **Environment:** `Node`
- **Region:** Choose closest to you (or US East for default)
- **Branch:** `main`
- **Build Command:**
  ```
  apt-get update && apt-get install -y ffmpeg && npm install && npm run build
  ```
- **Start Command:**
  ```
  npm start
  ```

**Plan:**
- Select **Free** tier (or Standard for production)

### 2.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these 3 variables:

| Key | Value | Notes |
|-----|-------|-------|
| `OPENAI_API_KEY` | `sk-proj-...` | Your actual API key |
| `NODE_ENV` | `production` | Required |
| `PORT` | `3000` | Already set in Render |

⚠️ **IMPORTANT:** 
- Copy your actual OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Paste it in the `OPENAI_API_KEY` field
- This value is **encrypted** on Render (not visible in logs)
- Never commit API keys to GitHub

### 2.5 Deploy

- Click **"Create Web Service"**
- Render starts building (~2-3 minutes)
- Watch the **Logs** tab for progress

```
Building...
Installing dependencies...
Compiling TypeScript...
Installing FFmpeg...
Build complete! ✅
Server running on port 3000
```

✅ Deployment complete!

---

## Step 3: Test Your Deployment

Once the build completes, you'll get a **public URL**:
```
https://reel-magic-ai.onrender.com
```

### Test Health Check
```bash
curl https://reel-magic-ai.onrender.com/health
# Response: {"status":"ok","timestamp":"..."}
```

### Test Server Info
```bash
curl https://reel-magic-ai.onrender.com/api/info
# Shows server statistics
```

✅ Your backend is now live!

---

## Step 4: Use the Live API

### Upload a Video
```bash
curl -X POST -F "video=@video.mp4" \
  https://reel-magic-ai.onrender.com/api/videos/upload
```

### Generate AI Clips
```bash
curl -X POST https://reel-magic-ai.onrender.com/api/clips/generate \
  -H "Content-Type: application/json" \
  -d '{"videoId": "vid-xxx", "numClips": 3}'
```

### Check Progress
```bash
curl https://reel-magic-ai.onrender.com/api/clips/status/job-xxx
```

✅ Everything works the same as local!

---

## Common Render Issues & Solutions

### ❌ `ffmpeg: command not found`

**Problem:** FFmpeg not installed on Render container

**Solution:** Already fixed in `render.yaml`!
```bash
apt-get update && apt-get install -y ffmpeg && npm install && npm run build
```

If you still get the error, manually add to build command in Render dashboard.

### ❌ `Build failed: ENOSPC: no space left on device`

**Problem:** Out of storage during build

**Solution:** 
1. Go to **Settings** → **Clear build cache**
2. Trigger rebuild
3. If persists, upgrade to Standard plan

### ❌ `OpenAI API error: Unauthorized`

**Problem:** API key is wrong or missing

**Solution:**
1. Go to **Settings** → **Environment**
2. Verify `OPENAI_API_KEY` is set correctly
3. Copy fresh key from platform.openai.com
4. Restart service (top right menu)

### ❌ `Timeout waiting for HTTP response`

**Problem:** Server taking too long to start

**Solution:**
1. Check **Logs** for errors
2. Ensure all dependencies are in `package.json`
3. May need to upgrade plan if Free tier is overloaded

### ❌ Video upload returns error

**Problem:** Upload directory issue on Render

**Solution:** Render uses `/tmp` for temporary storage
```
UPLOAD_DIR=/tmp/reel-magic-uploads
```
(Already configured in render.yaml)

---

## Monitoring Your Deployment

### View Logs
```
Render Dashboard → Your Service → Logs tab
```

See real-time:
- Server startup messages
- Upload activity
- Processing progress
- Error messages

### Monitor Performance
```
Render Dashboard → Your Service → Metrics tab
```

Track:
- CPU usage
- Memory usage
- Request count
- Error rate

### Get Notifications
```
Render Dashboard → Account Settings → Notifications
```

Enable:
- Build failures
- Service crashes
- Disk full warnings

---

## Keeping Code Updated

After changes to your GitHub repo:

### Auto-Deploy (Recommended)
Render automatically redeploys when you push to main:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Render automatically rebuilds and deploys! 🚀
```

### Manual Redeploy
In Render dashboard:
1. Click **"Manual Deploy"** button
2. Select branch
3. Click **"Deploy"**

---

## Production Best Practices

### 🔒 Secure Your API Key

**Never:**
```bash
git add .env          # ❌ Don't commit API keys!
export API_KEY=value  # ❌ Don't hardcode in files!
```

**Always:**
1. Use Render's Environment Variables
2. Rotate keys regularly
3. Use separate keys for dev/prod

### 📊 Monitor Costs

**Free Tier Limits:**
- Up to 750 hours/month of free hours
- Shared instance (low power)
- Spins down after 15 min of inactivity

**For Production:**
- Upgrade to **Standard** plan ($7/month)
- 24/7 uptime
- Dedicated instance
- Better performance

### ⚡ Optimize Performance

1. **Reduce API calls:** Cache transcripts
2. **Parallel processing:** Already implemented ✅
3. **Optimize video size:** Recommend max 500MB uploads
4. **Use CDN:** For clip downloads (future upgrade)

---

## Troubleshooting Checklist

- [ ] GitHub repo is public/accessible
- [ ] API key is test/valid (not expired)
- [ ] Build command includes FFmpeg install
- [ ] Environment variables are set in Render (not in code)
- [ ] Health check passes (`/health` endpoint)
- [ ] Server starts without errors (check Logs)
- [ ] Can upload a test video
- [ ] Can request clip generation

---

## Next Steps

### After Deployment

1. **Test thoroughly** - Try uploading a video
2. **Monitor logs** - Watch for errors
3. **Set up alerting** - Get notified of issues
4. **Consider upgrade** - If using more than free tier
5. **Add authentication** - Protect your API (future)
6. **Add database** - Store data persistently (future)

### Deploy a Frontend

Connect a frontend to your API:
- React/Next.js app
- Vue/Nuxt app
- Svelte app
- Static HTML/JS

Your API is ready to accept requests from anywhere!

---

## Useful Resources

- 📖 [Render Docs](https://render.com/docs)
- 🔑 [OpenAI API Keys](https://platform.openai.com/api-keys)
- 📹 [FFmpeg Documentation](https://ffmpeg.org/)
- 📝 [Your API Documentation](./API.md)
- 🧪 [Integration Guide](./INTEGRATION.md)

---

## Success! 🎉

Your Reel Magic AI backend is now:

✅ **Deployed** on Render (public URL)
✅ **Running** with FFmpeg support
✅ **Connected** to OpenAI API
✅ **Accepting** video uploads
✅ **Processing** with AI
✅ **Generating** viral clips

Share your public URL and start using it immediately!

---

**Questions?** Check logs, read the docs, or file an issue on GitHub.

**Ready for production?** Upgrade to Standard plan and add monitoring.

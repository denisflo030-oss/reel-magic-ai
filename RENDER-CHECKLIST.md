# ✅ RENDER DEPLOYMENT CHECKLIST

**Your code is now on GitHub.** Follow this checklist to deploy to Render.

---

## 📍 STATUS: READY TO DEPLOY

```
✅ GitHub: https://github.com/denisflo030-oss/reel-magic-ai
✅ Code: 17 TypeScript files, fully typed
✅ Build: TypeScript → JavaScript compilation ready
✅ Start: npm start ready
✅ FFmpeg: Included in build command
✅ API Key: Ready (you'll add in Render)
```

---

## 🎯 RENDER DEPLOYMENT (5 MINUTES)

### STEP 1: Open Render

```
https://render.com
```

Create account or login (free)

---

### STEP 2: Create Web Service

```
Dashboard → New + → Web Service
```

Click **"Connect account"** next to GitHub
- Authorize Render on GitHub
- Select your repo: `reel-magic-ai`
- Click **"Connect"**

---

### STEP 3: Configure Service

Fill in these fields:

| Field | Value |
|-------|-------|
| **Service Name** | `reel-magic-ai` |
| **Environment** | `Node` |
| **Region** | Your region (or US East) |
| **Plan** | `Free` (or Standard $7/mo) |

---

### STEP 4: Build & Start Commands

✅ **Render will auto-detect from render.yaml:**

**Build Command:**
```
apt-get update && apt-get install -y ffmpeg && npm install && npm run build
```
*(FFmpeg automatically installed)*

**Start Command:**
```
npm start
```

**Health Check Path:**
```
/health
```

---

### STEP 5: Add Environment Variables

Click **"Advanced"** then **"Add Environment Variable"**

Add **3 variables:**

#### 1️⃣ OpenAI API Key
```
Key:   OPENAI_API_KEY
Value: sk-proj-YOUR_ACTUAL_KEY_HERE
```
⚠️ Get from: https://platform.openai.com/api-keys

#### 2️⃣ Node Environment
```
Key:   NODE_ENV
Value: production
```

#### 3️⃣ Port
```
Key:   PORT
Value: 3000
```

---

### STEP 6: DEPLOY! 🚀

Click **"Create Web Service"**

Render starts building:
- 📦 Installing dependencies
- 🔨 Installing FFmpeg
- 🏗️ Compiling TypeScript
- ✅ Starting server

**Wait 2-3 minutes...**

---

## ✅ VERIFICATION

Once deployed, Render shows your URL:

```
https://reel-magic-ai.onrender.com
```

### Test 1: Health Check
```bash
curl https://reel-magic-ai.onrender.com/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

### Test 2: Server Info
```bash
curl https://reel-magic-ai.onrender.com/api/info
```

Expected response:
```json
{
  "status": "ok",
  "server": "Reel Magic AI",
  "stats": {
    "totalVideos": 0,
    "totalClips": 0,
    "activeJobs": 0
  }
}
```

✅ **Both work? You're live!**

---

## ⚠️ IF ERRORS OCCUR

### Error: `FFmpeg missing`
✅ **Already fixed!** render.yaml includes:
```bash
apt-get install -y ffmpeg
```
Render builds automatically.

### Error: `npm install timeout`
✅ **Normal on first deploy**
- Wait 3-5 minutes
- If still fails, click "Retry Deploy"

### Error: `Build failed`
✅ **Check Render Logs:**
1. Go to: Render Dashboard → reel-magic-ai
2. Click **"Logs"** tab
3. See what failed
4. Click **"Redeploy"** to try again

### Error: `OPENAI_API_KEY undefined`
✅ **Check in Render:**
1. Settings → Environment → Verify key is there
2. Restart service (click "Suspend" then "Resume")

### Error: `Port already in use`
✅ **Not your problem!** Render manages ports
- Delete service
- Create new one
- Try again

---

## 🎬 USE YOUR API

Once live, you can:

### Upload Video
```bash
curl -X POST -F "video=@test.mp4" \
  https://reel-magic-ai.onrender.com/api/videos/upload
```

### Generate AI Clips
```bash
curl -X POST https://reel-magic-ai.onrender.com/api/clips/generate \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video-id-here",
    "numClips": 3
  }'
```

### Check Status
```bash
curl https://reel-magic-ai.onrender.com/api/clips/status/job-id-here
```

---

## 📚 DOCUMENTATION

| File | Purpose |
|------|---------|
| [DEPLOY-NOW.md](./DEPLOY-NOW.md) | Step-by-step guide |
| [API.md](./API.md) | Complete API reference |
| [INTEGRATION.md](./INTEGRATION.md) | Frontend integration |
| [RENDER-DEPLOY.md](./RENDER-DEPLOY.md) | Advanced troubleshooting |

---

## 🔄 AUTO-REDEPLOY

Every time you push to GitHub, Render automatically redeploys:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Render automatically rebuilds and redeploys! ✅
```

---

## 💰 PRICING

- **Free tier:** $0/month (spins down after 15 min)
- **Standard:** $7/month (24/7 uptime)
- **API costs:** ~$0.35 per video (OpenAI)

---

## ✅ FINAL CHECKLIST

- [ ] Account created on render.com
- [ ] GitHub repository connected
- [ ] Web Service created
- [ ] ffmpeg in build command ✅ (already there)
- [ ] Environment variables added (OPENAI_API_KEY, NODE_ENV, PORT)
- [ ] "Create Web Service" clicked
- [ ] Build successful (check Logs)
- [ ] Health check passes (GET /health)
- [ ] Server info works (GET /api/info)

**All checked?** 🎉 **Your API is live!**

---

## 📝 IMPORTANT

1. **Never commit API key** - Use Render env vars only
2. **Monitor logs** - Check Logs tab if issues appear
3. **Free tier limits** - Spins down after 15 min (upgrade to Standard)
4. **Upload directory** - Render uses `/tmp` (not persistent)

---

## 🎊 YOU'RE DONE!

Your AI video backend is now:

✅ Live on internet (https://reel-magic-ai.onrender.com)
✅ Processing videos with AI
✅ Creating viral clips automatically
✅ Accessible from anywhere

**Next:** Build a frontend! 🚀

---

Questions? Check [RENDER-DEPLOY.md](./RENDER-DEPLOY.md) for detailed troubleshooting.

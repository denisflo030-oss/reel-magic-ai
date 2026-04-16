# 🎯 RENDER UI WALKTHROUGH

**What you'll see and click in Render.**

---

## 1️⃣ RENDER DASHBOARD

```
https://render.com

┌─────────────────────────────────────┐
│  Dashboard                          │
│                                     │
│  [Your Services] [Settings] [Help]  │
│                                     │
│  ┌─ New + ──────────────────────┐  │
│  │ Web Service                  │  │
│  │ Background Worker            │  │
│  │ Cron Job                      │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Click:** `[New +]` → `Web Service`

---

## 2️⃣ CONNECT GITHUB

```
┌──────────────────────────────────────┐
│  Connect a repository                │
│                                      │
│  Select source code                  │
│  ┌──────────────────────────────┐   │
│  │ GitHub                       │▼  │
│  │ (Connect account)            │   │
│  └──────────────────────────────┘   │
│                                      │
│  [Authorize Render on GitHub]        │
└──────────────────────────────────────┘
```

**Click:** `[Authorize Render on GitHub]`

---

## 3️⃣ SELECT REPO

```
┌──────────────────────────────────────┐
│  Repositories                        │
│  Search: _______________             │
│                                      │
│  ✓ reel-magic-ai                    │
│    by: denisflo030-oss              │
│                                      │
│                    [Connect] [Skip]  │
└──────────────────────────────────────┘
```

**Click repo:** `reel-magic-ai`
**Click:** `[Connect]`

---

## 4️⃣ CONFIGURE SERVICE

```
┌──────────────────────────────────────┐
│  Service details                     │
│                                      │
│  Name:              reel-magic-ai   │
│  Environment:       Node  (auto)    │
│  Builder:           Buildpacks      │
│  Root Directory:    /               │
│                                      │
│  Build Command:                      │
│  ├─ apt-get update                  │
│  ├─ apt-get install ffmpeg          │
│  ├─ npm install                     │
│  └─ npm run build                   │
│    (auto-detected from render.yaml) │
│                                      │
│  Start Command:     npm start        │
│    (auto-detected)                  │
│                                      │
│  Region:            US East   ▼     │
│  Plan:              Free       ▼     │
│                                      │
│  [Advanced] [Create Web Service]    │
└──────────────────────────────────────┘
```

**Verify:**
- ✅ Build Command has FFmpeg
- ✅ Start Command is `npm start`
- ✅ Region selected

**Click:** `[Advanced]` for env vars

---

## 5️⃣ ADD ENVIRONMENT VARIABLES

```
┌──────────────────────────────────────┐
│  Advanced                            │
│                                      │
│  Environment Variables               │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ OPENAI_API_KEY  sk-proj-... │   │
│  │ NODE_ENV        production  │   │
│  │ PORT            3000        │   │
│  └─────────────────────────────┘   │
│                                      │
│  [+ Add Environment Variable]        │
│                                      │
│  [Cancel] [Create Web Service]      │
└──────────────────────────────────────┘
```

**Add three variables:**

1. **OPENAI_API_KEY**
   - Key: `OPENAI_API_KEY`
   - Value: `sk-proj-YOUR_KEY_HERE`

2. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

3. **PORT**
   - Key: `PORT`
   - Value: `3000`

**Click:** `[Create Web Service]`

---

## 6️⃣ DEPLOYMENT IN PROGRESS

```
┌──────────────────────────────────────┐
│  reel-magic-ai                       │
│                                      │
│  Building...          ████░░░░ 40%  │
│                                      │
│  ┌─ Logs ──────────────────────┐   │
│  │ > npm install              │   │
│  │ ✓ npm install (2.3s)       │   │
│  │ > apt-get install ffmpeg   │   │
│  │ ✓ ffmpeg installed (8.4s)  │   │
│  │ > npm run build            │   │
│  │ ✓ TypeScript compiled (5s) │   │
│  │ > npm start                │   │
│  │ ✓ Server started on 3000   │   │
│  │ Ready ✅                    │   │
│  └────────────────────────────────┘  │
│                                      │
│  Status: Live                        │
│  URL: https://reel-magic-ai...     │
└──────────────────────────────────────┘
```

**Wait 2-3 minutes...**

✅ You see: `Status: Live` and a public URL

---

## 7️⃣ YOUR PUBLIC API

```
Service: reel-magic-ai
Status:  🟢 Live

URL: https://reel-magic-ai.onrender.com

Events:
├─ Deploy completed ✅
├─ Build successful ✅
├─ Server running ✅

Metrics:
├─ CPU:    2%
├─ Memory: 120 MB
└─ Requests: 0
```

---

## ✅ TEST YOUR API

### Copy your URL:
```
https://reel-magic-ai.onrender.com
```

### Test in terminal:

```bash
# Health check
curl https://reel-magic-ai.onrender.com/health

# Server info
curl https://reel-magic-ai.onrender.com/api/info

# Expected response:
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

✅ **See this? You're live!**

---

## 🔄 CHECK LOGS ANYTIME

```
Render Dashboard
    ↓
Your Service (reel-magic-ai)
    ↓
[Logs] tab
    ↓
See all output
```

Used for troubleshooting if anything breaks.

---

## ⚡ QUICK REFERENCE

| What | Where |
|------|-------|
| **View logs** | Dashboard → Logs tab |
| **Restart** | Settings → Suspend/Resume |
| **Update code** | Git push → Auto-redeploy |
| **Change env vars** | Settings → Environment |
| **Monitor performance** | Metrics tab |
| **Check status** | Dashboard → Status indicator |

---

## 📊 WHAT'S HAPPENING IN BACKGROUND

When you click "Create Web Service":

```
1. Render clones your GitHub repo
2. Reads render.yaml
3. Runs build command:
   ├─ apt-get update
   ├─ apt-get install ffmpeg
   ├─ npm install
   └─ npm run build
4. Runs start command:
   └─ npm start
5. Verifies health check (/health)
6. Assigns public URL
7. Shows "Live" ✅
```

All automatic! You just wait.

---

## 🎯 DEPLOY SUMMARY

```
GitHub Repo (reel-magic-ai)
    ↓
[Push to main]
    ↓
Render (Web Service)
    ↓
[Auto-detect from render.yaml]
    ↓
Public URL 🌍
    ↓
https://reel-magic-ai.onrender.com ✅
```

---

## 🎊 YOU'RE DONE!

Your AI video backend is now:
- ✅ In the cloud
- ✅ Publicly accessible
- ✅ Processing videos with GPT-4o
- ✅ Creating viral clips

Ready to build a frontend! 🚀

---

**Questions? See [RENDER-CHECKLIST.md](./RENDER-CHECKLIST.md) or [RENDER-DEPLOY.md](./RENDER-DEPLOY.md)**

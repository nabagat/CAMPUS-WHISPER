# CampusVoice: GitHub & Vercel Deployment Guide

This guide provides simple, step-by-step instructions to push **CampusVoice** to your GitHub repository and deploy it live to **Vercel** with one click.

---

## 🐙 Step 1: Push to GitHub

Open a terminal (PowerShell or Command Prompt) in the project folder (`c:\Users\nabag\OneDrive\Desktop\CAMPUS WHISPER`) and run these commands:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files (secrets and build caches are already git-ignored)
git add .

# 3. Create your initial commit
git commit -m "feat: complete CampusVoice full-stack platform with Inbuilt Firebase engine"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub repository (replace with your real GitHub repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/campus-voice.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🚀 Step 2: Deploy to Vercel

Because we have pre-configured [`vercel.json`](file:///c:/Users/nabag/OneDrive/Desktop/CAMPUS%20WHISPER/vercel.json) and [`api/index.js`](file:///c:/Users/nabag/OneDrive/Desktop/CAMPUS%20WHISPER/api/index.js), Vercel will deploy both the React Frontend and Node Express API automatically!

1. Go to **[vercel.com](https://vercel.com/)** and log in with your GitHub account.
2. Click the **"Add New..."** button &rarr; Select **"Project"**.
3. Under *Import Git Repository*, find your **`campus-voice`** repo and click **"Import"**.
4. In the Project Configuration:
   * **Framework Preset**: `Vite` (automatically detected)
   * **Root Directory**: `./` (leave as default)
   * **Build and Output Settings**: Vercel reads [`vercel.json`](file:///c:/Users/nabag/OneDrive/Desktop/CAMPUS%20WHISPER/vercel.json) automatically.
5. **Environment Variables** (expand the accordion and add these 3):
   * `JWT_SECRET`: `campus_voice_secure_jwt_secret_dev_2026`
   * `ANONYMITY_SALT`: `campus_voice_anonymity_salt_key_2026`
   * `GEMINI_API_KEY`: *(Optional: Paste your Google Gemini API key if you have one, or leave blank to use the built-in offline NLP engine)*
6. Click **"Deploy"**!

---

## ⚡ Step 3: Verify Your Live Deployment

Once Vercel completes the build (approx. 45 seconds):
* Your site will be live at: `https://campus-voice-xxxxx.vercel.app`
* You can test:
  * **Student Login**: `student@campus.edu` / `Password123!` (or click **Student 🎓** in the top navbar)
  * **Moderator Login**: `moderator@campus.edu` / `Password123!`
  * **Admin Dashboard**: `admin@campus.edu` / `Password123!`
  * **Live API Health**: `https://campus-voice-xxxxx.vercel.app/api/health`

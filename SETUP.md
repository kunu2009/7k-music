# 7K Music - Setup & Installation Guide

## 📋 Step-by-Step Setup Instructions

### Step 1: Install Node.js

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the **LTS version** (v18 or higher recommended)
3. Run the installer and follow the prompts
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### Step 2: Get YouTube API Key

#### A. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **Select a project** → **New Project**
4. Enter project name: "7K Music App"
5. Click **Create**

#### B. Enable YouTube Data API v3

1. In your new project, go to **APIs & Services** → **Library**
2. Search for "YouTube Data API v3"
3. Click on it and press **Enable**

#### C. Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the API key (you'll use this later)
4. Click **Edit API Key** (optional but recommended):
   - Under **API restrictions**, select **Restrict key**
   - Select **YouTube Data API v3**
   - Click **Save**

### Step 3: Clone and Setup Project

```powershell
# Navigate to your project folder
cd "C:\Desktop\7K\7KAPPS\7K MUSIC"

# Install dependencies
npm install
```

### Step 4: Configure Environment

1. Copy the example environment file:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` in your text editor
3. Replace `your_youtube_api_key_here` with your actual API key:
   ```env
   VITE_YOUTUBE_API_KEY=AIzaSyC...your...actual...key...here
   ```

### Step 5: Run the App

```powershell
# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

---

## 🚀 Building for Production

### Build the app:
```powershell
npm run build
```

### Test production build:
```powershell
npm run preview
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```powershell
   npm install -g vercel
   ```

2. Deploy:
   ```powershell
   vercel
   ```

3. Set environment variable in Vercel dashboard:
   - Go to project settings → Environment Variables
   - Add `VITE_YOUTUBE_API_KEY` with your key

### Option 2: Netlify

1. Install Netlify CLI:
   ```powershell
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```powershell
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. Set environment variable in Netlify:
   - Go to Site settings → Build & deploy → Environment
   - Add `VITE_YOUTUBE_API_KEY`

### Option 3: GitHub Pages

1. Install gh-pages:
   ```powershell
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. Deploy:
   ```powershell
   npm run deploy
   ```

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module 'vite'"
**Solution**: Run `npm install`

### Issue: "API Key not found"
**Solution**: 
1. Check that `.env` file exists in project root
2. Verify the variable name is exactly `VITE_YOUTUBE_API_KEY`
3. Restart the dev server after changing `.env`

### Issue: "YouTube API quota exceeded"
**Solution**: 
- You've reached the daily free limit (10,000 units)
- Wait until midnight PST for reset
- Or request quota increase in Google Cloud Console

### Issue: Port already in use
**Solution**:
```powershell
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

---

## 📊 Understanding YouTube API Costs

| Action | Cost (units) | Example |
|--------|-------------|---------|
| Get trending videos | 1 | Loading home page |
| Search videos | 100 | Each search query |
| Get video details | 1 | Loading video metadata |

**Daily Free Quota**: 10,000 units = ~100 searches + many video loads

---

## 🎨 Customization

### Change Brand Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  'gable-green': '#13262f',   // Dark background
  'chathams-blue': '#17557b', // Secondary
  'calypso': '#366e8d',       // Primary accent
  'timberwolf': '#d3d0cb',    // Text
}
```

### Change App Name

1. `index.html`: Update `<title>` and meta tags
2. `vite.config.ts`: Update PWA manifest name
3. `src/components/Navigation.tsx`: Update logo text

---

## 📱 Installing as PWA

### On Desktop (Chrome/Edge):
1. Click the install icon in address bar
2. Or go to Settings → Install 7K Music

### On Mobile (iOS):
1. Open in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

### On Mobile (Android):
1. Open in Chrome
2. Tap menu (⋮)
3. Tap "Install app"

---

## 🧹 Maintenance

### Update Dependencies
```powershell
npm update
```

### Clear Cache
```powershell
npm run build -- --force
```

### Reset Everything
```powershell
Remove-Item -Recurse -Force node_modules, dist, .vite
npm install
```

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#-common-issues--solutions) section
2. Review [YouTube API documentation](https://developers.google.com/youtube/v3)
3. Open an issue on GitHub
4. Contact: support@7kapps.com

---

**Happy Music Streaming! 🎵**

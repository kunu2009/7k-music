# 🚀 Getting Started with 7K Music

Welcome to **7K Music**! This guide will help you get up and running in just a few minutes.

---

## 📹 What is 7K Music?

7K Music is a **legal, ethical music video streaming app** that uses YouTube's official APIs to let you:

- 🎵 Discover trending music videos
- 🔍 Search for your favorite songs and artists  
- ❤️ Save favorites for quick access
- 📝 Create custom playlists
- 🎮 Control playback with a mini player

**Everything streams from YouTube** — no downloading, no copyright violations, 100% legal.

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites

You need:
- ✅ **Node.js** (v18+) - [Download here](https://nodejs.org/)
- ✅ **YouTube API Key** (free) - [Get it here](https://console.cloud.google.com/)

### Installation

Open PowerShell in this folder and run:

```powershell
# Option 1: Automated setup (recommended)
.\setup.ps1

# Option 2: Manual setup
npm install
Copy-Item .env.example .env
# Edit .env and add your API key
npm run dev
```

That's it! The app will open at `http://localhost:5173`

---

## 🔑 Getting Your YouTube API Key

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name it **"7K Music App"** and click **Create**

### Step 2: Enable YouTube Data API

1. In your project, click **"APIs & Services"** → **"Library"**
2. Search for **"YouTube Data API v3"**
3. Click it and press **"Enable"**

### Step 3: Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Copy the key (looks like: `AIzaSyC...`)
4. **(Optional)** Click **"Edit API Key"** → Restrict to YouTube Data API v3

### Step 4: Add to Your App

1. Open the `.env` file in your project
2. Replace `your_youtube_api_key_here` with your actual key:
   ```
   VITE_YOUTUBE_API_KEY=AIzaSyC_your_actual_key_here
   ```
3. Save the file

---

## 🎮 Using the App

### Home Page (Trending)
- See the hottest music videos right now
- Click any video to start playing
- Click the ❤️ to save to favorites

### Search Page
- Type a song name, artist, or genre
- Press Enter to search
- Results are filtered to music videos only

### Favorites Page
- Access all your saved videos
- Click to play instantly
- Remove by clicking ❤️ again

### Playlists Page
- Create custom playlists
- Add videos from any page
- Organize your music your way

### Mini Player
- Always visible at the bottom when playing
- Controls: Previous | Play/Pause | Next
- Click ❤️ to favorite current song
- Progress bar shows playback position

---

## 🎨 Understanding the Interface

### Color Scheme
The app uses 7K's brand colors:
- **Dark Blue (#13262f)** - Main background
- **Ocean Blue (#17557b)** - Secondary elements
- **Sky Blue (#366e8d)** - Buttons and accents
- **Light Gray (#d3d0cb)** - Text

### Navigation
Top bar has 4 sections:
- 🏠 **Home** - Trending videos
- 🔍 **Search** - Find videos
- ❤️ **Favorites** - Your saved videos
- 📚 **Playlists** - Your collections

---

## 💡 Tips & Tricks

### Saving Videos
- Click the ❤️ icon on any video card
- Favorites are saved locally (works offline!)
- Create playlists to organize by mood/genre

### Keyboard Shortcuts
- **Space** - Play/Pause
- **→** - Skip forward
- **←** - Skip backward
- **M** - Mute/Unmute

### Performance Tips
- Thumbnails are cached for faster loading
- Close other tabs if video stutters
- Use "medium" quality on slow connections

### API Quota Management
- Free quota: 10,000 units/day
- Trending page: ~1 unit
- Search: ~100 units per search
- Tip: Use favorites to avoid re-searching

---

## 🔧 Troubleshooting

### "API Key not found"
**Fix**: 
1. Check that `.env` file exists
2. Verify variable name is `VITE_YOUTUBE_API_KEY`
3. Restart dev server: `Ctrl+C` then `npm run dev`

### "Quota exceeded"
**Fix**: 
- You've hit the daily limit (10,000 units)
- Wait until midnight PST for reset
- Or request increase in Google Cloud Console

### "Videos won't play"
**Fix**:
1. Check internet connection
2. Try a different video
3. Clear browser cache
4. Check browser console (F12) for errors

### "Slow loading"
**Fix**:
- Enable caching in browser settings
- Close unnecessary tabs
- Check your internet speed
- Try lower video quality

---

## 📱 Installing as an App

### Desktop (Chrome/Edge)
1. Click the **⊕** install icon in address bar
2. Or: Menu → **"Install 7K Music"**
3. App launches in its own window!

### iOS (iPhone/iPad)
1. Open in **Safari**
2. Tap the **Share** button
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**

### Android
1. Open in **Chrome**
2. Tap menu **(⋮)**
3. Tap **"Install app"** or **"Add to Home screen"**

---

## 🌟 Features to Explore

### Queue Management
- Videos auto-play in sequence
- Skip forward/backward through queue
- Queue persists while browsing

### Offline Support
- App interface works offline
- Favorites and playlists accessible
- Videos require internet (legal requirement!)

### Responsive Design
- Works on phone, tablet, desktop
- Touch-friendly controls
- Adapts to screen size

---

## 🆘 Getting Help

### Resources
- 📖 **README.md** - Full documentation
- 🔧 **SETUP.md** - Detailed setup guide
- ⚖️ **LEGAL.md** - Compliance information

### Support
- 🐛 **Issues**: Check GitHub issues
- 📧 **Email**: support@7kapps.com
- 💬 **Community**: Join our Discord (coming soon)

### Common Questions

**Q: Can I download videos?**  
A: No, that would violate YouTube's ToS. We stream only.

**Q: Can I play music in background?**  
A: Only through YouTube's player controls (follow their rules).

**Q: Is my data private?**  
A: Yes! Everything is stored locally in your browser.

**Q: Why do I see YouTube branding?**  
A: It's required by YouTube's ToS. We must display it.

**Q: Can I use this for my podcast/stream?**  
A: Only if you comply with YouTube's embedding policies.

---

## 🎯 Next Steps

Now that you're set up:

1. ✅ Browse trending music videos
2. ✅ Search for your favorite artists
3. ✅ Create your first playlist
4. ✅ Save some favorites
5. ✅ Explore the mini player controls

**Enjoy legal, ethical music streaming!** 🎵

---

## 📊 Understanding API Costs

Your free YouTube API quota (10,000 units/day) allows:

| Action | Cost | Daily Limit |
|--------|------|-------------|
| Load trending | 1 unit | 10,000 times |
| Search | 100 units | 100 searches |
| Video details | 1 unit | 10,000 times |

**Typical Usage**: ~20-50 searches per day is comfortable.

---

## 🔒 Privacy & Security

### What We Store
- ✅ Video IDs (public data)
- ✅ Your playlists (local only)
- ✅ Your favorites (local only)

### What We DON'T Store
- ❌ Personal information
- ❌ Passwords or credentials
- ❌ Copyrighted content
- ❌ Usage analytics

**Everything is stored in your browser's IndexedDB.**

---

## 🎊 Welcome to 7K Music!

You're all set! Start discovering amazing music videos the legal way.

**Remember**: 
- Respect creators and copyright
- Follow YouTube's Terms of Service  
- Enjoy responsibly

*Play. Discover. Create — Legally.* 🎵

---

**Made with ❤️ by 7K Apps**

# 🎵 7K Music

**Play. Discover. Create — Legally.**

A modern, ethical Progressive Web App (PWA) for streaming music videos from YouTube with a beautiful Spotify-style interface. Built with React, TypeScript, and Vite.

![7K Music Banner](https://img.shields.io/badge/7K%20Music-Legal%20%26%20Ethical-366e8d?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

---

## ✨ Features

### 🎬 Legal Music Video Streaming
- Stream music videos through **official YouTube IFrame Player API**
- Fetch trending music using **YouTube Data API v3**
- Search for music videos by song, artist, or genre
- No downloading, no scraping — 100% compliant with YouTube ToS

### 🎨 Spotify-Style UI
- Clean, dark interface with 7K brand colors
- Mini player with playback controls
- Video cards with thumbnails and metadata
- Responsive design for mobile, tablet, and desktop

### 💾 Offline-Ready Features
- **IndexedDB** for local data storage
- Save favorites and create playlists
- Recently played history
- Service worker for app shell caching

### 🎛️ Playback Controls
- Play/Pause/Next/Previous
- Progress bar with seek functionality
- Queue management
- Volume and mute controls
- Auto-play next video

### 📱 PWA Capabilities
- Install as standalone app
- Offline app shell caching
- Responsive and mobile-friendly
- Fast loading with Vite

---

## 🎨 7K Brand Colors

```css
Gable Green:   #13262f  (Dark background)
Chathams Blue: #17557b  (Secondary)
Calypso:       #366e8d  (Accent/Primary actions)
Timberwolf:    #d3d0cb  (Text/Subtle elements)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **YouTube Data API v3 Key** (free from Google Cloud Console)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "7K MUSIC"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Your YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **YouTube Data API v3**:
   - Navigate to **APIs & Services > Library**
   - Search for "YouTube Data API v3"
   - Click **Enable**
4. Create credentials:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > API Key**
   - Copy your API key

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your YouTube API key:

```env
VITE_YOUTUBE_API_KEY=your_actual_api_key_here
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build for Production

### Build the App

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Deploy

You can deploy the `dist/` folder to:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop the `dist/` folder
- **GitHub Pages**: Use `gh-pages` package
- **Firebase Hosting**: `firebase deploy`

---

## 📁 Project Structure

```
7K MUSIC/
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── VideoCard.tsx
│   │   ├── MiniPlayer.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Navigation.tsx
│   │   └── common.tsx
│   ├── context/          # React Context (Player state)
│   │   └── PlayerContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useYouTubePlayer.ts
│   │   └── useStorage.ts
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── FavoritesPage.tsx
│   │   └── PlaylistsPage.tsx
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── youtube.ts    # YouTube API integration
│   │   └── storage.ts    # IndexedDB wrapper
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔑 API Usage & Quota

### YouTube Data API v3

- **Free Quota**: 10,000 units/day
- **Typical Usage**:
  - Trending videos: ~1 unit per request
  - Search: ~100 units per request
  - Video details: ~1 unit per video

### Best Practices

- Cache results in IndexedDB
- Implement rate limiting
- Use `maxResults` parameter wisely
- Consider upgrading quota for production

---

## 🛡️ Legal & Ethical Compliance

### ✅ What We Do

- ✅ Stream videos through **official YouTube IFrame API**
- ✅ Display **YouTube branding and controls**
- ✅ Follow **YouTube Terms of Service**
- ✅ Cache only **app shell and thumbnails** (not content)
- ✅ Respect **copyright and content ownership**

### ❌ What We DON'T Do

- ❌ Download or extract audio/video from YouTube
- ❌ Remove YouTube branding or ads
- ❌ Store copyrighted content
- ❌ Bypass YouTube's playback restrictions
- ❌ Violate any Terms of Service

### 📜 YouTube API Terms

By using this app, you agree to comply with:
- [YouTube Terms of Service](https://www.youtube.com/t/terms)
- [YouTube API Services Terms](https://developers.google.com/youtube/terms/api-services-terms-of-service)
- [Google Privacy Policy](https://policies.google.com/privacy)

---

## 🎯 Features Roadmap

### Current Version (v1.0)
- ✅ Trending music videos
- ✅ Search functionality
- ✅ Favorites management
- ✅ Playlist creation
- ✅ Mini player with controls
- ✅ PWA support

### Planned Features (v2.0)
- 🔄 Creative Commons music integration (Jamendo, FMA)
- 🔄 Background audio with Capacitor
- 🔄 Lyrics display (via third-party APIs)
- 🔄 Music recommendations
- 🔄 Social sharing
- 🔄 Theme customization

---

## 🧪 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **TailwindCSS** | Styling |
| **React Router** | Navigation |
| **IndexedDB (idb)** | Local storage |
| **YouTube IFrame API** | Video playback |
| **YouTube Data API v3** | Video metadata |
| **Lucide React** | Icons |
| **Workbox** | Service worker |

---

## 🐛 Troubleshooting

### "YouTube API Key Not Found"

**Solution**: Make sure you've created a `.env` file with `VITE_YOUTUBE_API_KEY=your_key`

### "API Quota Exceeded"

**Solution**: 
- Wait 24 hours for quota reset
- Implement caching to reduce API calls
- Request quota increase from Google Cloud Console

### "Videos Not Playing"

**Solution**:
- Check browser console for errors
- Ensure YouTube IFrame API is loaded
- Verify YouTube is not blocked by network/firewall

### "Build Errors"

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Guidelines

- Follow existing code style
- Add TypeScript types for all new code
- Test all features before submitting
- Ensure legal compliance for any new features

---

## 📄 License

This project is licensed under the **MIT License**.

**Important**: While the code is MIT licensed, you must comply with:
- YouTube Terms of Service
- YouTube API Services Terms
- All applicable copyright laws

---

## 🙏 Acknowledgments

- **YouTube** for providing the IFrame Player and Data APIs
- **Google Fonts** for the Inter font family
- **Lucide** for beautiful icons
- **Tailwind CSS** for the utility-first CSS framework

---

## 📧 Contact

**7K Apps**  
Email: [your-email@example.com](mailto:your-email@example.com)  
Website: [https://7kapps.com](https://7kapps.com)

---

## 🎵 Enjoy Legal Music Streaming!

**7K Music** — *Play. Discover. Create — Legally.*

Made with ❤️ by 7K Apps

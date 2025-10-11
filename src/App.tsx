import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';
import { Navigation } from '@/components/Navigation';
import { MiniPlayer } from '@/components/MiniPlayer';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { PlaylistsPage } from '@/pages/PlaylistsPage';
import { MyMusicPage } from '@/pages/MyMusicPage';
import { NowPlayingPage } from '@/pages/NowPlayingPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { useFavorites } from '@/hooks/useStorage';

function PlayerWrapper() {
  const {
    currentVideo,
    isPlaying,
    currentTime,
    duration,
    playPause,
    next,
    previous,
    seekTo,
    toggleMute,
    isMuted,
    initPlayer,
  } = usePlayer();

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once!
    if (hasInitialized.current) {
      console.log('⏭️ Player already initialized, skipping...');
      return;
    }

    const timer = setTimeout(() => {
      console.log('🎬 Attempting to initialize player...');
      const playerContainer = document.getElementById('youtube-player');
      if (playerContainer) {
        console.log('✅ Found player container, initializing...');
        initPlayer('youtube-player');
        hasInitialized.current = true;
      } else {
        console.error('❌ Player container still not found!');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only run once!

  const handleToggleFavorite = async () => {
    if (currentVideo) {
      if (isFavorite(currentVideo.id)) {
        await removeFavorite(currentVideo.id);
      } else {
        await addFavorite(currentVideo);
      }
    }
  };

  return (
    <>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/my-music" element={<MyMusicPage />} />
        <Route path="/now-playing" element={<NowPlayingPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Mini Player */}
      {currentVideo && (
        <MiniPlayer
          video={currentVideo}
          isPlaying={isPlaying}
          isFavorite={isFavorite(currentVideo.id)}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={playPause}
          onNext={next}
          onPrevious={previous}
          onSeek={seekTo}
          onToggleFavorite={handleToggleFavorite}
          onToggleMute={toggleMute}
          isMuted={isMuted}
        />
      )}
    </>
  );
}

function App() {
  useEffect(() => {
    // Add player div directly to body on mount
    const existingDiv = document.getElementById('youtube-player');
    if (!existingDiv) {
      const playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-player';
      playerDiv.style.display = 'none';
      playerDiv.style.position = 'fixed';
      playerDiv.style.top = '0';
      playerDiv.style.left = '0';
      playerDiv.style.width = '1px';
      playerDiv.style.height = '1px';
      playerDiv.style.zIndex = '-1';
      document.body.appendChild(playerDiv);
      console.log('✅ Created player div and appended to body');
    } else {
      console.log('✅ Player div already exists');
    }

    return () => {
      // Cleanup on unmount
      const div = document.getElementById('youtube-player');
      if (div && div.parentNode === document.body) {
        document.body.removeChild(div);
      }
    };
  }, []);

  return (
    <Router>
      <PlayerProvider>
        <div className="min-h-screen bg-black">
          <Navigation />
          <PlayerWrapper />
        </div>
      </PlayerProvider>
    </Router>
  );
}

export default App;

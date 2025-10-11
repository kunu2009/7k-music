import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Library, Music } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
    { to: '/playlists', icon: Library, label: 'Playlists' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gable-green border-b border-chathams-blue shadow-lg z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-calypso" />
            <div>
              <h1 className="text-white font-bold text-xl">7K Music</h1>
              <p className="text-timberwolf text-xs opacity-75">Play. Discover. Create.</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-calypso text-white'
                      : 'text-timberwolf hover:bg-chathams-blue hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Legal Notice */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-timberwolf opacity-60">
            <span>🎵 Powered by YouTube</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

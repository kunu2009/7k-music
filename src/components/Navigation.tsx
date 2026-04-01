import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Library, Sparkles, Radio } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/my-music', icon: Library, label: 'My Music' },
    { to: '/categories', icon: Sparkles, label: 'Categories' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 safe-pad-top px-3 sm:px-4 pt-2 sm:pt-3">
      <div className="glass-surface rounded-2xl border-white/20">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
            <img 
              src="/7kmusic.png" 
              alt="7K Music" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl"
            />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg truncate">7K Music</h1>
              <p className="text-blue-100/75 text-[11px] hidden md:block">Cinematic Streaming Experience</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-center overflow-x-auto scrollbar-hide">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap interactive-lift ${
                    isActive
                      ? 'bg-blue-500/70 text-white shadow-lg shadow-blue-900/40 motion-glow'
                      : 'text-blue-100/80 hover:bg-blue-500/25 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Legal Notice - Hidden on small screens */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-blue-100/70 flex-shrink-0">
            <Radio className="w-3.5 h-3.5" />
            <span>Streaming via YouTube API</span>
          </div>
        </div>
      </div>
      </div>
    </nav>
  );
};

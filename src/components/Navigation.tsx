import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Library, Sparkles } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/my-music', icon: Library, label: 'My Music' },
    { to: '/categories', icon: Sparkles, label: 'Categories' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gable-green border-b border-chathams-blue shadow-lg z-40">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <img 
              src="/7kmusic.png" 
              alt="7K Music" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-white font-bold text-lg sm:text-xl truncate">7K Music</h1>
              <p className="text-timberwolf text-xs opacity-75 hidden md:block">Play. Discover. Create.</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-center overflow-x-auto scrollbar-hide">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-calypso text-white'
                      : 'text-timberwolf hover:bg-chathams-blue hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Legal Notice - Hidden on small screens */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-timberwolf opacity-60 flex-shrink-0">
            <span>🎵 YouTube</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

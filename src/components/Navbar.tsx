import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Bookmark, Settings, User, Shield, Menu, X, Film, Flame, Compass, ChevronDown, Star, Play } from 'lucide-react';
import { Movie } from '../types';
import { storageService } from '../services/storageService';
import { tmdbService } from '../services/tmdbService';
import { INITIAL_MOVIES } from '../data/mockMovies';

interface NavbarProps {
  activeView: 'home' | 'discover' | 'trending' | 'watchlist' | 'profile' | 'admin';
  onNavigate: (view: 'home' | 'discover' | 'trending' | 'watchlist' | 'profile' | 'admin', extraParam?: string) => void;
  onSelectMovie: (movie: Movie) => void;
  onOpenAiFinder: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onSelectMovie,
  onOpenAiFinder,
  onOpenSettings
}) => {
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [genresDropdownOpen, setGenresDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profile = storageService.getProfile();

  const updateCount = () => {
    setWatchlistCount(storageService.getWatchlist().length);
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('cineverse_watchlist_updated', updateCount);
    return () => window.removeEventListener('cineverse_watchlist_updated', updateCount);
  }, []);

  // Live instant suggestions as user types in search bar
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const matches = INITIAL_MOVIES.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.directors.some(d => d.toLowerCase().includes(q)) ||
        m.cast.some(c => c.name.toLowerCase().includes(q))
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (movie: Movie) => {
    onSelectMovie(movie);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate('discover', searchQuery.trim());
    }
  };

  const genres = ['Sci-Fi', 'Action', 'Drama', 'Adventure', 'Animation', 'Comedy', 'Thriller', 'Mystery'];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090D]/85 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-600/30 group-hover:shadow-purple-600/50 transition-all group-hover:scale-105">
            <div className="w-full h-full bg-[#08090D] rounded-2xl flex items-center justify-center">
              <Film className="w-5 h-5 text-purple-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black font-display tracking-tight text-white flex items-center gap-1.5">
              CINEVERSE
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                AI
              </span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider uppercase -mt-0.5">
              Smart Movie Discovery
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'home'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('discover')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'discover'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Discover
          </button>

          {/* Genres Dropdown */}
          <div className="relative">
            <button
              onClick={() => setGenresDropdownOpen(!genresDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Genres
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {genresDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-48 bg-[#161922] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in grid grid-cols-1 gap-1"
                onMouseLeave={() => setGenresDropdownOpen(false)}
              >
                {genres.map(g => (
                  <button
                    key={g}
                    onClick={() => {
                      setGenresDropdownOpen(false);
                      onNavigate('discover', g);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-purple-600/20 transition-colors"
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('trending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'trending'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Trending
          </button>

          <button
            onClick={() => onNavigate('watchlist')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'watchlist'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Watchlist
            {watchlistCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-purple-600 text-[10px] text-white flex items-center justify-center font-mono ml-0.5 font-bold">
                {watchlistCount}
              </span>
            )}
          </button>
        </nav>

        {/* Live Search Bar with Suggestions */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs md:max-w-sm hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Instant search movies, cast..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#12141C] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#12141C]/95 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-fade-in space-y-1">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Instant Matches
              </div>
              {suggestions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectSuggestion(m)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-600/20 cursor-pointer transition-colors group"
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-8 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate group-hover:text-purple-300">
                      {m.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {m.releaseYear} • ⭐ {m.rating} • {m.genres[0]}
                    </p>
                  </div>
                </div>
              ))}
              <div
                onClick={() => {
                  setShowSuggestions(false);
                  onNavigate('discover', searchQuery);
                }}
                className="px-3 py-2 text-center text-xs font-semibold text-purple-400 hover:text-purple-300 border-t border-white/5 cursor-pointer"
              >
                See all results for "{searchQuery}" →
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons: AI Recommender Button, Settings, Profile, Admin */}
        <div className="flex items-center gap-2">
          {/* AI Recommendation Engine Button */}
          <button
            onClick={onOpenAiFinder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
            title="Find Your Next Movie with AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span className="hidden sm:inline">AI Movie Finder</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => onNavigate('profile')}
            className={`p-1.5 rounded-xl border transition-all ${
              activeView === 'profile'
                ? 'border-purple-500 ring-2 ring-purple-500/30'
                : 'border-white/10 hover:border-white/30'
            }`}
            title="User Profile"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-7 h-7 rounded-lg object-cover"
            />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors"
            title="Settings & API Keys"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Admin Dashboard Shield */}
          <button
            onClick={() => onNavigate('admin')}
            className={`p-2 rounded-xl transition-all ${
              activeView === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
            title="Admin Dashboard"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white lg:hidden border border-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-[#08090D] border-b border-white/10 space-y-3 animate-fade-in">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative sm:hidden">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#12141C] border border-white/10 text-white text-xs"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-[#161922] text-left text-xs font-bold text-white flex items-center gap-2"
            >
              <Film className="w-4 h-4 text-purple-400" />
              Home
            </button>

            <button
              onClick={() => {
                onNavigate('discover');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-[#161922] text-left text-xs font-bold text-white flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              Discover
            </button>

            <button
              onClick={() => {
                onNavigate('trending');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-[#161922] text-left text-xs font-bold text-white flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              Trending
            </button>

            <button
              onClick={() => {
                onNavigate('watchlist');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-[#161922] text-left text-xs font-bold text-white flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-purple-400" />
              Watchlist ({watchlistCount})
            </button>

            <button
              onClick={() => {
                onNavigate('profile');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-[#161922] text-left text-xs font-bold text-white flex items-center gap-2"
            >
              <User className="w-4 h-4 text-emerald-400" />
              Profile
            </button>

            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-[#161922] text-left text-xs font-bold text-white flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

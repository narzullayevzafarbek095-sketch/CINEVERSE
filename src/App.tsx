import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/HeroBanner';
import { MovieCarousel } from './components/MovieCarousel';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { TrailerModal } from './components/TrailerModal';
import { AiRecommendationModal } from './components/AiRecommendationModal';
import { DiscoverPage } from './components/DiscoverPage';
import { WatchlistPage } from './components/WatchlistPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsModal } from './components/SettingsModal';
import { Toast, ToastMessage } from './components/Toast';

import { Movie } from './types';
import { tmdbService } from './services/tmdbService';
import { adminService } from './services/adminService';
import { storageService } from './services/storageService';
import { INITIAL_MOVIES } from './data/mockMovies';
import { Flame, Star, Sparkles, Clock, Compass, Film, Award, Check } from 'lucide-react';

export function App() {
  const [activeView, setActiveView] = useState<'home' | 'discover' | 'trending' | 'watchlist' | 'profile' | 'admin'>('home');
  const [discoverGenre, setDiscoverGenre] = useState<string>('All');

  // Movie lists
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Modals & Popups
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [isAiFinderOpen, setIsAiFinderOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Broadcast alert banner
  const [broadcastMessage, setBroadcastMessage] = useState(() => adminService.getBroadcastMessage());
  const [dismissBroadcast, setDismissBroadcast] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast_' + Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load initial movie collections
  const loadMovies = async () => {
    setLoadingInitial(true);
    try {
      const [trendRes, popRes, topRes, recRes] = await Promise.all([
        tmdbService.getTrendingMovies(),
        tmdbService.getPopularMovies(),
        tmdbService.getTopRatedMovies(),
        tmdbService.getRecentlyAdded()
      ]);

      setTrendingMovies(trendRes.movies);
      setPopularMovies(popRes.movies);
      setTopRatedMovies(topRes.movies);
      setRecentMovies(recRes.movies);
    } catch (err) {
      console.error('Failed to load movie collections:', err);
      setTrendingMovies(INITIAL_MOVIES);
      setPopularMovies(INITIAL_MOVIES.filter(m => m.isPopular));
      setTopRatedMovies([...INITIAL_MOVIES].sort((a, b) => b.rating - a.rating));
      setRecentMovies(INITIAL_MOVIES);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadMovies();

    const handleBroadcastUpdate = () => {
      setBroadcastMessage(adminService.getBroadcastMessage());
      setDismissBroadcast(false);
    };

    const handleSettingsUpdate = () => {
      loadMovies();
      addToast('Application configuration reloaded!', 'info');
    };

    window.addEventListener('cineverse_broadcast_updated', handleBroadcastUpdate);
    window.addEventListener('cineverse_settings_updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('cineverse_broadcast_updated', handleBroadcastUpdate);
      window.removeEventListener('cineverse_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const handleNavigate = (view: any, extraParam?: string) => {
    setActiveView(view);
    if (view === 'discover') {
      if (extraParam) {
        setDiscoverGenre(extraParam);
      } else {
        setDiscoverGenre('All');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Watchlist quick toggle with celebratory toast
  const handleToggleWatchlist = (movie: Movie) => {
    const inList = storageService.isInWatchlist(movie.id);
    if (inList) {
      storageService.removeFromWatchlist(movie.id);
      addToast(`Removed "${movie.title}" from watchlist`, 'info');
    } else {
      storageService.addToWatchlist(movie);
      addToast(`Added "${movie.title}" to your Watchlist!`, 'success');
    }
  };

  const featuredPool = trendingMovies.length > 0 ? trendingMovies : INITIAL_MOVIES;

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F8FAFC] flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Broadcast Notification Banner (if active) */}
      {!dismissBroadcast && broadcastMessage && (
        <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-cyan-900/90 border-b border-purple-500/20 px-4 py-2 text-xs text-white flex items-center justify-between shadow-lg backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2 mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            <span className="font-medium tracking-wide">{broadcastMessage}</span>
          </div>
          <button
            onClick={() => setDismissBroadcast(true)}
            className="text-white/60 hover:text-white text-xs px-2 py-0.5"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Navigation Bar */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onSelectMovie={(movie) => setSelectedMovie(movie)}
        onOpenAiFinder={() => setIsAiFinderOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        {/* VIEW 1: HOME */}
        {activeView === 'home' && (
          <div className="space-y-12 animate-fade-in">
            {/* Cinematic Hero Spotlight */}
            <HeroBanner
              featuredMovies={featuredPool.slice(0, 4)}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
              onPlayTrailer={(movie) => setTrailerMovie(movie)}
              onOpenAiFinder={() => setIsAiFinderOpen(true)}
            />

            {/* Quick AI Discovery Teaser Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#141624] via-[#1A1D30] to-[#12141C] border border-purple-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Neural Film Matcher
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                  Not sure what to watch tonight?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Answer 5 quick vibe questions—mood, duration, genres, and release era—and our AI engine will synthesize the perfect movie match with a customized rationale.
                </p>
              </div>

              <button
                onClick={() => setIsAiFinderOpen(true)}
                className="shrink-0 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-105 transition-all"
              >
                Launch AI Movie Finder →
              </button>
            </div>

            {/* Trending Movies Carousel */}
            <MovieCarousel
              title="Trending Now"
              subtitle="The most talked about films across global cinema this week"
              icon={Flame}
              movies={trendingMovies}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onPlayTrailer={(m) => setTrailerMovie(m)}
              onViewAll={() => handleNavigate('trending')}
            />

            {/* Popular This Week Carousel */}
            <MovieCarousel
              title="Popular This Week"
              subtitle="Audience favorites with highest engagement and watch records"
              icon={Film}
              movies={popularMovies}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onPlayTrailer={(m) => setTrailerMovie(m)}
              onViewAll={() => handleNavigate('discover')}
            />

            {/* Top Rated Movies Section */}
            <MovieCarousel
              title="Top Rated Masterpieces"
              subtitle="Critically acclaimed cinematic wonders scoring 8.5+ on IMDb"
              icon={Star}
              movies={topRatedMovies}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onPlayTrailer={(m) => setTrailerMovie(m)}
              onViewAll={() => handleNavigate('discover')}
            />

            {/* Recently Added Section */}
            <MovieCarousel
              title="Recently Released & Streaming"
              subtitle="Fresh theatrical and digital premieres ready to watch"
              icon={Clock}
              movies={recentMovies}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onPlayTrailer={(m) => setTrailerMovie(m)}
              onViewAll={() => handleNavigate('discover')}
            />

            {/* Genre Highlights Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    Explore by Genre
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dive into tailored catalogs spanning science fiction, high-adrenaline action, psychological thrillers, and animation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { name: 'Sci-Fi', count: '14 Films', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Action', count: '18 Films', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Drama', count: '22 Films', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Animation', count: '10 Films', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Thriller', count: '16 Films', image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Comedy', count: '12 Films', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80' }
                ].map((g) => (
                  <div
                    key={g.name}
                    onClick={() => handleNavigate('discover', g.name)}
                    className="group relative h-28 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-purple-500/50 transition-all hover:scale-[1.03]"
                  >
                    <img
                      src={g.image}
                      alt={g.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/50 to-transparent" />
                    <div className="absolute inset-x-3 bottom-3">
                      <h3 className="text-sm font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                        {g.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">{g.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DISCOVER */}
        {activeView === 'discover' && (
          <DiscoverPage
            initialGenre={discoverGenre}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onPlayTrailer={(m) => setTrailerMovie(m)}
          />
        )}

        {/* VIEW 3: TRENDING */}
        {activeView === 'trending' && (
          <div className="space-y-8 animate-fade-in pb-16">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight flex items-center gap-3">
                Trending Box Office & Cinema
                <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-medium">
                  Live Heatmap
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Top charting movies ranked by streaming velocity, box office returns, and community votes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trendingMovies.map((movie) => (
                <div key={movie.id} className="relative">
                  <HeroBannerMovieCard
                    movie={movie}
                    onSelect={() => setSelectedMovie(movie)}
                    onPlayTrailer={() => setTrailerMovie(movie)}
                    onToggleWatchlist={() => handleToggleWatchlist(movie)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: WATCHLIST */}
        {activeView === 'watchlist' && (
          <WatchlistPage
            onSelectMovie={(m) => setSelectedMovie(m)}
            onPlayTrailer={(m) => setTrailerMovie(m)}
            onOpenAiFinder={() => setIsAiFinderOpen(true)}
          />
        )}

        {/* VIEW 5: PROFILE */}
        {activeView === 'profile' && (
          <ProfilePage
            onSelectMovie={(m) => setSelectedMovie(m)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* VIEW 6: ADMIN */}
        {activeView === 'admin' && (
          <AdminDashboard
            onSelectMovie={(m) => setSelectedMovie(m)}
          />
        )}
      </main>

      {/* Global Modals */}
      <MovieDetailsModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onPlayTrailer={(m) => setTrailerMovie(m)}
        onSelectSimilar={(m) => setSelectedMovie(m)}
      />

      <TrailerModal
        movie={trailerMovie}
        onClose={() => setTrailerMovie(null)}
      />

      <AiRecommendationModal
        isOpen={isAiFinderOpen}
        onClose={() => setIsAiFinderOpen(false)}
        onSelectMovie={(m) => setSelectedMovie(m)}
        onPlayTrailer={(m) => setTrailerMovie(m)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => {
          loadMovies();
          addToast('Settings applied successfully!', 'success');
        }}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Global Cinematic Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiFinder={() => setIsAiFinderOpen(true)}
      />
    </div>
  );
}

// Subcomponent for trending grid with rank badge
function HeroBannerMovieCard({
  movie,
  onSelect,
  onPlayTrailer,
  onToggleWatchlist
}: {
  movie: Movie;
  onSelect: () => void;
  onPlayTrailer: () => void;
  onToggleWatchlist: () => void;
}) {
  const inList = storageService.isInWatchlist(movie.id);

  return (
    <div
      onClick={onSelect}
      className="group relative flex flex-col bg-[#12141C] border border-white/5 hover:border-purple-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-purple-900/20"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#161922]">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-transparent to-black/30 opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 font-mono text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-400" />
            {movie.rating.toFixed(1)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist();
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              inList ? 'bg-purple-600 text-white shadow-md' : 'bg-black/50 text-white/80 hover:bg-black/80'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${inList ? 'text-white' : 'text-slate-400'}`} />
          </button>
        </div>

        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 backdrop-blur-md border border-purple-500/30 text-purple-300">
            {movie.cineVerseScore}% AI Score
          </span>
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between flex-1 gap-1">
        <h3 className="font-display font-semibold text-sm text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
          {movie.title}
        </h3>
        <p className="text-[11px] text-slate-400">
          {movie.releaseYear} • {movie.genres[0]}
        </p>
      </div>
    </div>
  );
}

export default App;

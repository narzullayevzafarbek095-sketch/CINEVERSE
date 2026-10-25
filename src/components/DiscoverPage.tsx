import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, Star, Film, Sparkles, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Movie, FilterState } from '../types';
import { tmdbService } from '../services/tmdbService';
import { MovieCard } from './MovieCard';
import { GENRE_LIST } from '../data/mockMovies';

interface DiscoverPageProps {
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  initialGenre?: string;
}

const YEARS = ['All', '2024', '2023', '2022', '2021', '2019', '2017', '2016', '2015', '2014', '2010', '2008', '2001', '1999', '1994'];

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onSelectMovie,
  onPlayTrailer,
  initialGenre
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedGenre: initialGenre || 'All',
    selectedYear: 'All',
    minRating: 0,
    sortBy: 'popularity',
    format: 'all',
    actorOrDirector: ''
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    if (initialGenre) {
      setFilters(prev => ({ ...prev, selectedGenre: initialGenre }));
    }
  }, [initialGenre]);

  const runSearch = async () => {
    setLoading(true);
    try {
      const response = await tmdbService.searchMovies(filters.searchQuery, filters);
      setMovies(response.movies);
      setIsLiveApi(response.isLive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch();
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedGenre: 'All',
      selectedYear: 'All',
      minRating: 0,
      sortBy: 'popularity',
      format: 'all',
      actorOrDirector: ''
    });
  };

  const activeFiltersCount = [
    filters.selectedGenre !== 'All',
    filters.selectedYear !== 'All',
    filters.minRating > 0,
    filters.format !== 'all',
    Boolean(filters.actorOrDirector.trim())
  ].filter(Boolean).length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Title & Live Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight flex items-center gap-3">
            Explore & Discover
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono font-medium">
              {movies.length} Films
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search our curated cinematic catalog or live TMDB global database with multi-vector filters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLiveApi ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              TMDB Live Stream
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Curated Master Database
            </span>
          )}

          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all md:hidden ${
              showFiltersPanel
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-[#161922] text-slate-300 border-white/10'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </div>

      {/* Main Search Bar & Quick Genre Row */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search by title, character, plot keyword (e.g. Inception, multiverse, Paul Atreides)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#12141C] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-xl"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-2 py-1 bg-white/5 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Genre Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {GENRE_LIST.map((genre) => (
            <button
              key={genre}
              onClick={() => setFilters(prev => ({ ...prev, selectedGenre: genre }))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                filters.selectedGenre === genre
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#161922] text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filter Toolbar (Visible on Desktop or toggled on mobile) */}
      <div className={`p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4 shadow-xl ${showFiltersPanel ? 'block' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Filter By Multiple Attributes
            </h3>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Actor or Director */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Actor / Director
            </label>
            <input
              type="text"
              value={filters.actorOrDirector}
              onChange={(e) => setFilters(prev => ({ ...prev, actorOrDirector: e.target.value }))}
              placeholder="e.g. Christopher Nolan, Zendaya..."
              className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Release Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Release Year
            </label>
            <select
              value={filters.selectedYear}
              onChange={(e) => setFilters(prev => ({ ...prev, selectedYear: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y === 'All' ? 'All Release Years' : y}</option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Format
            </label>
            <select
              value={filters.format}
              onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Formats</option>
              <option value="movie">Movies</option>
              <option value="animation">Animated</option>
              <option value="series">Series</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="popularity">Popularity (Most Votes)</option>
              <option value="rating">Highest Rated First</option>
              <option value="releaseDate">Release Date (Newest)</option>
              <option value="title">Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Rating Slider Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5">
          <div className="flex items-center gap-3 w-full sm:w-1/2">
            <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
              Min Rating:
            </span>
            <input
              type="range"
              min="0"
              max="9"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
              {filters.minRating > 0 ? `${filters.minRating.toFixed(1)}+` : 'Any'}
            </span>
          </div>

          {/* Active filter count badges */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{activeFiltersCount} active filter criteria applied</span>
            </div>
          )}
        </div>
      </div>

      {/* Movie Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] rounded-2xl bg-[#161922] animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center p-8 rounded-3xl bg-[#12141C] border border-white/5 space-y-4 max-w-lg mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-display">No movies found</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            We couldn't find any titles matching your search criteria. Try relaxing your filters or searching for another title.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onPlayTrailer={onPlayTrailer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

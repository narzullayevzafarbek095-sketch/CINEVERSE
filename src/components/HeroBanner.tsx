import React, { useState, useEffect } from 'react';
import { Play, Info, Bookmark, Check, Star, Sparkles, ChevronRight, Flame } from 'lucide-react';
import { Movie } from '../types';
import { storageService } from '../services/storageService';

interface HeroBannerProps {
  featuredMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onOpenAiFinder: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredMovies,
  onSelectMovie,
  onPlayTrailer,
  onOpenAiFinder
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInList, setIsInList] = useState(false);

  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];

  useEffect(() => {
    if (!currentMovie) return;
    setIsInList(storageService.isInWatchlist(currentMovie.id));
  }, [currentMovie, currentIndex]);

  // Auto rotate every 8 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (!currentMovie) return null;

  const handleToggleWatchlist = () => {
    if (isInList) {
      storageService.removeFromWatchlist(currentMovie.id);
      setIsInList(false);
    } else {
      storageService.addToWatchlist(currentMovie);
      setIsInList(true);
    }
  };

  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] flex items-end pb-12 overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentMovie.backdropUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center transition-all duration-1000 scale-105"
        />
        {/* Layered cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090D] via-[#08090D]/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#08090D]/90" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 max-w-4xl space-y-5 animate-fade-in">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs tracking-wide shadow-lg shadow-purple-600/30">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            FEATURED SPOTLIGHT
          </span>

          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 font-mono text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {currentMovie.rating.toFixed(1)} IMDb
          </span>

          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-300 text-xs font-medium border border-white/5">
            {currentMovie.releaseYear}
          </span>

          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-300 text-xs font-medium border border-white/5">
            {Math.floor(currentMovie.runtime / 60)}h {currentMovie.runtime % 60}m
          </span>

          <span className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-400 bg-white/5 border border-white/10">
            {currentMovie.certification}
          </span>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white leading-tight drop-shadow-md">
            {currentMovie.title}
          </h1>
          {currentMovie.tagline && (
            <p className="text-sm sm:text-base text-purple-300/90 font-medium italic">
              "{currentMovie.tagline}"
            </p>
          )}
        </div>

        {/* Overview Synopsis */}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed line-clamp-3 max-w-2xl font-sans drop-shadow">
          {currentMovie.overview}
        </p>

        {/* Genres & Mood pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {currentMovie.genres.map((genre) => (
            <span
              key={genre}
              className="text-xs px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300"
            >
              {genre}
            </span>
          ))}
          <span className="text-xs px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {currentMovie.cineVerseScore}% CineVerse Score
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onPlayTrailer(currentMovie)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Watch Trailer
          </button>

          <button
            onClick={() => onSelectMovie(currentMovie)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm border border-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <Info className="w-4 h-4" />
            Explore Movie
          </button>

          <button
            onClick={handleToggleWatchlist}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-md text-sm font-medium border transition-all ${
              isInList
                ? 'bg-purple-900/60 text-purple-200 border-purple-500/50'
                : 'bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white border-white/10'
            }`}
          >
            {isInList ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                In Watchlist
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                Add to Watchlist
              </>
            )}
          </button>

          {/* AI Recommender Shortcut Button */}
          <button
            onClick={onOpenAiFinder}
            className="hidden lg:flex items-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-sm font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Find Your Next Movie
          </button>
        </div>
      </div>

      {/* Slide Pagination Indicator Dots */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2">
        {featuredMovies.slice(0, 4).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-8 bg-purple-500 shadow-md shadow-purple-500/50'
                : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Jump to featured movie ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

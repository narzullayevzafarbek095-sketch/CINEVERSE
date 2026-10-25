import React from 'react';
import { Star, Bookmark, Check, Play, Flame } from 'lucide-react';
import { Movie } from '../types';
import { storageService } from '../services/storageService';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlayTrailer?: (movie: Movie) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  onPlayTrailer,
  isInWatchlist,
  onToggleWatchlist
}) => {
  const inList = isInWatchlist ?? storageService.isInWatchlist(movie.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWatchlist) {
      onToggleWatchlist(movie);
    } else {
      if (inList) {
        storageService.removeFromWatchlist(movie.id);
      } else {
        storageService.addToWatchlist(movie);
      }
    }
  };

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayTrailer) {
      onPlayTrailer(movie);
    }
  };

  return (
    <div
      onClick={() => onSelect(movie)}
      className="group relative flex flex-col bg-[#12141C] border border-white/5 hover:border-purple-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-900/20 select-none"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#161922]">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-transparent to-black/30 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 font-mono text-xs font-bold shadow-md">
              <Star className="w-3 h-3 fill-amber-400" />
              {movie.rating.toFixed(1)}
            </span>

            {movie.trendingRank && movie.trendingRank <= 3 && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-rose-500/80 backdrop-blur-md text-[10px] font-bold text-white shadow-md">
                <Flame className="w-3 h-3" />
                #{movie.trendingRank}
              </span>
            )}
          </div>

          {/* Quick Watchlist Bookmark Button */}
          <button
            onClick={handleWatchlistClick}
            aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              inList
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                : 'bg-black/50 text-white/80 hover:bg-black/80 hover:text-white border border-white/10'
            }`}
          >
            {inList ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Hover Trailer Play Button */}
        {onPlayTrailer && (
          <button
            onClick={handleTrailerClick}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px] z-10"
            aria-label={`Play trailer for ${movie.title}`}
          >
            <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/50 transform scale-75 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </button>
        )}

        {/* CineVerse AI Match Score Pill */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-purple-500/20 backdrop-blur-md border border-purple-500/30 text-purple-300">
            {movie.cineVerseScore}% AI Score
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          <h3 className="font-display font-semibold text-sm sm:text-base text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span>{movie.releaseYear}</span>
            <span>•</span>
            <span className="truncate">{movie.genres.slice(0, 2).join(', ')}</span>
            <span>•</span>
            <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
          </div>
        </div>

        {/* Type tag */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
          <span className="capitalize">{movie.type}</span>
          <span className="text-slate-400">{movie.directors[0]}</span>
        </div>
      </div>
    </div>
  );
};

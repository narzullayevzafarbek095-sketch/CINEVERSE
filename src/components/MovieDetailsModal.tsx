import React, { useState, useEffect } from 'react';
import { X, Play, Star, Bookmark, Check, Calendar, Clock, Globe, DollarSign, Award, Users, Film, Sparkles, Share2 } from 'lucide-react';
import { Movie } from '../types';
import { storageService } from '../services/storageService';
import { tmdbService } from '../services/tmdbService';
import { ReviewSection } from './ReviewSection';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlayTrailer: (movie: Movie) => void;
  onSelectSimilar: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onPlayTrailer,
  onSelectSimilar
}) => {
  if (!movie) return null;

  const [isInWatchlist, setIsInWatchlist] = useState(() => storageService.isInWatchlist(movie.id));
  const [isWatched, setIsWatched] = useState(() => storageService.isWatched(movie.id));
  const [personalRating, setPersonalRating] = useState<number | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    setIsInWatchlist(storageService.isInWatchlist(movie.id));
    setIsWatched(storageService.isWatched(movie.id));
    storageService.addToViewHistory(movie.id);
    setSimilarMovies(tmdbService.getSimilarMovies(movie));
  }, [movie]);

  const handleToggleWatchlist = () => {
    if (isInWatchlist) {
      storageService.removeFromWatchlist(movie.id);
      setIsInWatchlist(false);
    } else {
      storageService.addToWatchlist(movie);
      setIsInWatchlist(true);
    }
  };

  const handleToggleWatched = () => {
    const updated = storageService.toggleWatched(movie.id, personalRating || undefined);
    setIsWatched(updated);
    if (updated && !isInWatchlist) {
      storageService.addToWatchlist(movie);
      setIsInWatchlist(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div 
        className="relative w-full max-w-5xl bg-[#12141C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative w-full h-[320px] sm:h-[420px] bg-black">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-top opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-[#12141C]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12141C]/90 via-[#12141C]/40 to-transparent" />

          {/* Trailer quick launcher button in backdrop center */}
          <button
            onClick={() => onPlayTrailer(movie)}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-600/90 group-hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 group-hover:scale-110 transition-all">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
            </div>
            <span className="absolute mt-28 px-4 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-semibold text-white border border-white/10">
              Watch Official Trailer
            </span>
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="relative z-10 px-6 sm:px-10 pb-10 -mt-24 sm:-mt-32 space-y-8">
          {/* Header Row: Poster + Title + Key Action Bar */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Poster Card */}
            <div className="w-36 sm:w-48 shrink-0 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-[#161922]">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-auto object-cover aspect-[2/3]"
              />
            </div>

            {/* Title & Actions */}
            <div className="flex-1 space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-xs">
                  {movie.releaseYear}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 text-xs">
                  {movie.certification}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 text-xs">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {movie.cineVerseScore}% CineVerse Score
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
                  {movie.title}
                </h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-xs text-slate-400">Original: {movie.originalTitle}</p>
                )}
                {movie.tagline && (
                  <p className="text-sm text-purple-300 italic mt-1 font-sans">
                    "{movie.tagline}"
                  </p>
                )}
              </div>

              {/* Action Buttons: Watchlist & Watched */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    isInWatchlist
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {isInWatchlist ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      Add to Watchlist
                    </>
                  )}
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all ${
                    isWatched
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <Check className={`w-4 h-4 ${isWatched ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {isWatched ? 'Watched' : 'Mark as Watched'}
                </button>

                <button
                  onClick={() => onPlayTrailer(movie)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-semibold text-xs sm:text-sm transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Trailer
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                  title="Share Movie Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {showShareToast && (
                  <span className="text-xs text-emerald-400 animate-fade-in font-medium">
                    Link copied to clipboard!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Overview & Storyline */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              Storyline & Overview
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
              {movie.overview}
            </p>
          </div>

          {/* Movie Metadata Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#161922] border border-white/5">
            <div>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                IMDb Rating
              </span>
              <p className="text-base font-bold text-white font-mono">
                {movie.rating.toFixed(1)} / 10
              </p>
              <span className="text-[11px] text-slate-500">
                {movie.voteCount.toLocaleString()} votes
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Release Date
              </span>
              <p className="text-base font-bold text-white">
                {movie.releaseDate}
              </p>
              <span className="text-[11px] text-slate-500">Theatrical premiere</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Runtime
              </span>
              <p className="text-base font-bold text-white">
                {movie.runtime} min
              </p>
              <span className="text-[11px] text-slate-500">
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Spoken Languages
              </span>
              <p className="text-base font-bold text-white truncate">
                {movie.languages.join(', ')}
              </p>
              <span className="text-[11px] text-slate-500">Original Audio</span>
            </div>

            {movie.budget && (
              <div>
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Budget
                </span>
                <p className="text-base font-bold text-white font-mono">{movie.budget}</p>
              </div>
            )}

            {movie.revenue && (
              <div>
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Box Office Gross
                </span>
                <p className="text-base font-bold text-emerald-400 font-mono">{movie.revenue}</p>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Director
              </span>
              <p className="text-base font-bold text-white truncate">{movie.directors.join(', ')}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Mood Tone
              </span>
              <p className="text-base font-bold text-purple-300 truncate">{movie.moods.join(', ')}</p>
            </div>
          </div>

          {/* Top Cast Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Featured Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {movie.cast.map((actor, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161922] border border-white/5"
                >
                  <img
                    src={actor.image}
                    alt={actor.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded YouTube Trailer Player */}
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-400 fill-current" />
              Official Trailer Video
            </h2>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?rel=0&modestbranding=1`}
                title={`${movie.title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Similar & Recommended Movies */}
          {similarMovies.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                More Like This
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {similarMovies.map((similar) => (
                  <div
                    key={similar.id}
                    onClick={() => onSelectSimilar(similar)}
                    className="group cursor-pointer space-y-1.5"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#161922] border border-white/5 group-hover:border-purple-500/50 transition-all">
                      <img
                        src={similar.posterUrl}
                        alt={similar.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-xs font-medium text-white truncate group-hover:text-purple-300">
                      {similar.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {similar.releaseYear} • ⭐ {similar.rating}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User & Critic Reviews Section */}
          <div className="pt-6 border-t border-white/10">
            <ReviewSection movieId={movie.id} movieTitle={movie.title} />
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Play, ExternalLink } from 'lucide-react';
import { Movie } from '../types';

interface TrailerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#12141C] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                {movie.title}
                <span className="text-xs font-normal text-slate-400 font-sans">Official Trailer ({movie.releaseYear})</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Watch on YouTube
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close trailer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&rel=0&modestbranding=1`}
            title={`${movie.title} Official Trailer`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0E1017] flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
          <span className="truncate">{movie.tagline || movie.overview.slice(0, 80) + '...'}</span>
          <span className="text-purple-400 font-medium shrink-0 ml-4">CineVerse HD Stream</span>
        </div>
      </div>
    </div>
  );
};

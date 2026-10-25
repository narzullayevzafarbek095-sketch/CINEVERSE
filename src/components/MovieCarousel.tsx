import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer?: (movie: Movie) => void;
  onViewAll?: () => void;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  subtitle,
  icon: Icon,
  movies,
  onSelectMovie,
  onPlayTrailer,
  onViewAll
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors mr-2 px-2.5 py-1 rounded-lg hover:bg-purple-500/10"
            >
              View All
            </button>
          )}

          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-[#161922] border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-[#161922] border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="w-[200px] sm:w-[220px] md:w-[240px] shrink-0 snap-start"
          >
            <MovieCard
              movie={movie}
              onSelect={onSelectMovie}
              onPlayTrailer={onPlayTrailer}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

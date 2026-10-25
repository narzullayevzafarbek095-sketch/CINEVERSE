import { Movie, FilterState } from '../types';
import { INITIAL_MOVIES } from '../data/mockMovies';
import { storageService } from './storageService';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// TMDB Genre ID mapper
const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

function formatTmdbMovie(data: any): Movie {
  const genres = data.genres 
    ? data.genres.map((g: any) => g.name)
    : (data.genre_ids || []).map((id: number) => TMDB_GENRES[id] || 'Cinema').filter(Boolean);

  const trailer = data.videos?.results?.find(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  const directors = data.credits?.crew
    ? data.credits.crew.filter((c: any) => c.job === 'Director').map((d: any) => d.name)
    : ['Renowned Filmmaker'];

  const cast = data.credits?.cast
    ? data.credits.cast.slice(0, 5).map((c: any) => ({
        name: c.name,
        character: c.character || 'Lead Role',
        image: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      }))
    : [];

  const releaseYear = data.release_date ? parseInt(data.release_date.split('-')[0], 10) : 2024;

  return {
    id: `tmdb-${data.id}`,
    title: data.title || 'Untitled Feature',
    originalTitle: data.original_title,
    tagline: data.tagline || 'Experience the cinema.',
    overview: data.overview || 'No overview provided.',
    posterUrl: data.poster_path 
      ? `${TMDB_IMAGE_BASE}/w780${data.poster_path}` 
      : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: data.backdrop_path 
      ? `${TMDB_IMAGE_BASE}/w1280${data.backdrop_path}` 
      : 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    releaseDate: data.release_date || '2024-01-01',
    releaseYear: isNaN(releaseYear) ? 2024 : releaseYear,
    rating: Number((data.vote_average || 7.5).toFixed(1)),
    voteCount: data.vote_count || 1000,
    runtime: data.runtime || 120,
    genres: genres.length > 0 ? genres : ['Cinema', 'Drama'],
    moods: ['Excited', 'Curious', 'Emotional'],
    directors: directors.length > 0 ? directors : ['Visionary Director'],
    cast: cast.length > 0 ? cast : [
      { name: 'Ensemble Cast', character: 'Lead Cast', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' }
    ],
    trailerKey: trailer ? trailer.key : 'YoHD9XEInc0',
    certification: 'PG-13',
    languages: data.spoken_languages ? data.spoken_languages.map((l: any) => l.english_name || l.name) : ['English'],
    budget: data.budget ? `$${(data.budget / 1000000).toFixed(1)}M` : undefined,
    revenue: data.revenue ? `$${(data.revenue / 1000000).toFixed(1)}M` : undefined,
    cineVerseScore: Math.min(99, Math.round((data.vote_average || 7.5) * 10 + 5)),
    type: genres.includes('Animation') ? 'animation' : 'movie'
  };
}

export const tmdbService = {
  getApiKey(): string {
    const settings = storageService.getSettings();
    return settings.tmdbApiKey?.trim() || '';
  },

  isLiveMode(): boolean {
    const key = this.getApiKey();
    const settings = storageService.getSettings();
    return Boolean(key && settings.useLiveTmdb);
  },

  async fetchFromTmdb(endpoint: string): Promise<any> {
    const key = this.getApiKey();
    if (!key) throw new Error('No TMDB key configured');
    storageService.incrementAdminStat('apiCallsCount');
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `https://api.themoviedb.org/3${endpoint}${separator}api_key=${key}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  async getTrendingMovies(): Promise<{ movies: Movie[]; isLive: boolean }> {
    if (this.isLiveMode()) {
      try {
        const data = await this.fetchFromTmdb('/trending/movie/week');
        const results = data.results || [];
        const formatted = results.slice(0, 12).map((item: any, idx: number) => ({
          ...formatTmdbMovie(item),
          trendingRank: idx + 1,
          isPopular: true
        }));
        return { movies: formatted, isLive: true };
      } catch (err) {
        console.warn('Falling back to curated mock data for trending movies:', err);
      }
    }
    const trending = [...INITIAL_MOVIES].sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
    return { movies: trending, isLive: false };
  },

  async getPopularMovies(): Promise<{ movies: Movie[]; isLive: boolean }> {
    if (this.isLiveMode()) {
      try {
        const data = await this.fetchFromTmdb('/movie/popular');
        const formatted = (data.results || []).slice(0, 12).map((item: any) => formatTmdbMovie(item));
        return { movies: formatted, isLive: true };
      } catch (err) {
        console.warn('Falling back to curated mock data for popular movies:', err);
      }
    }
    const popular = INITIAL_MOVIES.filter(m => m.isPopular);
    return { movies: popular, isLive: false };
  },

  async getTopRatedMovies(): Promise<{ movies: Movie[]; isLive: boolean }> {
    if (this.isLiveMode()) {
      try {
        const data = await this.fetchFromTmdb('/movie/top_rated');
        const formatted = (data.results || []).slice(0, 12).map((item: any) => formatTmdbMovie(item));
        return { movies: formatted, isLive: true };
      } catch (err) {
        console.warn('Falling back to curated mock data for top rated movies:', err);
      }
    }
    const top = [...INITIAL_MOVIES].sort((a, b) => b.rating - a.rating);
    return { movies: top, isLive: false };
  },

  async getRecentlyAdded(): Promise<{ movies: Movie[]; isLive: boolean }> {
    if (this.isLiveMode()) {
      try {
        const data = await this.fetchFromTmdb('/movie/now_playing');
        const formatted = (data.results || []).slice(0, 10).map((item: any) => formatTmdbMovie(item));
        return { movies: formatted, isLive: true };
      } catch (err) {
        console.warn('Falling back to curated mock data for recently added movies:', err);
      }
    }
    const recent = [...INITIAL_MOVIES].sort((a, b) => b.releaseYear - a.releaseYear);
    return { movies: recent, isLive: false };
  },

  async searchMovies(query: string, filters?: Partial<FilterState>): Promise<{ movies: Movie[]; isLive: boolean }> {
    storageService.incrementAdminStat('totalSearches');
    const cleanQuery = query.trim().toLowerCase();

    let pool: Movie[] = [...INITIAL_MOVIES];
    let isLiveResult = false;

    if (this.isLiveMode() && cleanQuery) {
      try {
        const data = await this.fetchFromTmdb(`/search/movie?query=${encodeURIComponent(cleanQuery)}`);
        const liveMovies = (data.results || []).slice(0, 18).map((item: any) => formatTmdbMovie(item));
        if (liveMovies.length > 0) {
          pool = liveMovies;
          isLiveResult = true;
        }
      } catch (err) {
        console.warn('Live search error, falling back to local pool:', err);
      }
    }

    let results = pool;

    if (cleanQuery && !isLiveResult) {
      results = results.filter(m => {
        const titleMatch = m.title.toLowerCase().includes(cleanQuery) || 
                           (m.originalTitle && m.originalTitle.toLowerCase().includes(cleanQuery));
        const directorMatch = m.directors.some(d => d.toLowerCase().includes(cleanQuery));
        const castMatch = m.cast.some(c => c.name.toLowerCase().includes(cleanQuery) || c.character.toLowerCase().includes(cleanQuery));
        const genreMatch = m.genres.some(g => g.toLowerCase().includes(cleanQuery));
        const overviewMatch = m.overview.toLowerCase().includes(cleanQuery);
        return titleMatch || directorMatch || castMatch || genreMatch || overviewMatch;
      });
    }

    if (filters) {
      if (filters.selectedGenre && filters.selectedGenre !== 'All') {
        results = results.filter(m => m.genres.includes(filters.selectedGenre!));
      }

      if (filters.selectedYear && filters.selectedYear !== 'All') {
        const year = parseInt(filters.selectedYear, 10);
        results = results.filter(m => m.releaseYear === year);
      }

      if (filters.minRating && filters.minRating > 0) {
        results = results.filter(m => m.rating >= filters.minRating!);
      }

      if (filters.format && filters.format !== 'all') {
        results = results.filter(m => m.type === filters.format);
      }

      if (filters.actorOrDirector && filters.actorOrDirector.trim()) {
        const person = filters.actorOrDirector.trim().toLowerCase();
        results = results.filter(m => 
          m.directors.some(d => d.toLowerCase().includes(person)) ||
          m.cast.some(c => c.name.toLowerCase().includes(person))
        );
      }

      if (filters.sortBy) {
        results = [...results].sort((a, b) => {
          if (filters.sortBy === 'rating') return b.rating - a.rating;
          if (filters.sortBy === 'releaseDate') return b.releaseYear - a.releaseYear;
          if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
          // default popularity
          return (b.voteCount || 0) - (a.voteCount || 0);
        });
      }
    }

    return { movies: results, isLive: isLiveResult };
  },

  async getMovieDetails(id: string | number): Promise<Movie | null> {
    const local = INITIAL_MOVIES.find(m => String(m.id) === String(id));
    if (local) return local;

    if (String(id).startsWith('tmdb-') && this.isLiveMode()) {
      const tmdbId = String(id).replace('tmdb-', '');
      try {
        const data = await this.fetchFromTmdb(`/movie/${tmdbId}?append_to_response=videos,credits`);
        return formatTmdbMovie(data);
      } catch (err) {
        console.error('Failed to fetch TMDB movie details:', err);
      }
    }

    // fallback search in watchlist
    const watchlistEntry = storageService.getWatchlist().find(e => String(e.movieId) === String(id));
    if (watchlistEntry) return watchlistEntry.movie;

    return INITIAL_MOVIES[0] || null;
  },

  getSimilarMovies(targetMovie: Movie): Movie[] {
    return INITIAL_MOVIES
      .filter(m => String(m.id) !== String(targetMovie.id))
      .map(m => {
        let score = 0;
        // matching genres
        const sharedGenres = m.genres.filter(g => targetMovie.genres.includes(g)).length;
        score += sharedGenres * 3;
        // matching director
        if (m.directors.some(d => targetMovie.directors.includes(d))) score += 5;
        // matching mood
        const sharedMoods = m.moods.filter(mood => targetMovie.moods.includes(mood)).length;
        score += sharedMoods * 2;
        return { movie: m, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.movie);
  }
};

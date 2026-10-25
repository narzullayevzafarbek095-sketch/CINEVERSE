import { Movie, Review, WatchlistEntry, UserCollection, UserProfile } from '../types';
import { INITIAL_MOVIES, INITIAL_REVIEWS } from '../data/mockMovies';

const KEYS = {
  WATCHLIST: 'cineverse_watchlist_v1',
  COLLECTIONS: 'cineverse_collections_v1',
  REVIEWS: 'cineverse_reviews_v1',
  PROFILE: 'cineverse_profile_v1',
  SETTINGS: 'cineverse_settings_v1',
  VIEW_HISTORY: 'cineverse_history_v1',
  FEATURED_OVERRIDE: 'cineverse_featured_override',
  STATS: 'cineverse_admin_stats_v1',
};

export const DEFAULT_COLLECTIONS: UserCollection[] = [
  { id: 'weekend', name: 'Weekend Marathon', description: 'Binge-worthy cinematic experiences', movieIds: ['dune-2', 'oppenheimer'], createdAt: new Date().toISOString() },
  { id: 'mindbend', name: 'Mind Benders', description: 'Sci-Fi and psychological thrillers that mess with your head', movieIds: ['inception', 'interstellar', 'severance-s1'], createdAt: new Date().toISOString() },
  { id: 'chill', name: 'Comfort & Animation', description: 'Visually dazzling and heartfelt journeys', movieIds: ['spirited-away', 'spider-verse-2', 'coco'], createdAt: new Date().toISOString() }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Mercer',
  email: 'alex.mercer@cineverse.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  bio: 'Cinema buff, sci-fi explorer & IMAX enthusiast. Always looking for films that bend reality.',
  favoriteGenres: ['Sci-Fi', 'Thriller', 'Animation', 'Drama'],
  totalWatchedTimeMinutes: 840,
  isDemoAccount: true,
  preferences: {
    preferredLanguage: 'English',
    adultContent: true,
    autoPlayTrailers: true,
    defaultSort: 'popularity'
  }
};

export interface AppSettings {
  tmdbApiKey: string;
  geminiApiKey: string;
  useLiveTmdb: boolean;
  themeAccent: 'violet' | 'cyan' | 'emerald' | 'amber';
}

export const DEFAULT_SETTINGS: AppSettings = {
  tmdbApiKey: (import.meta as any).env?.VITE_TMDB_API_KEY || '',
  geminiApiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '',
  useLiveTmdb: Boolean((import.meta as any).env?.VITE_TMDB_API_KEY),
  themeAccent: 'violet'
};

// Safe localStorage wrapper
export const storageService = {
  getWatchlist(): WatchlistEntry[] {
    try {
      const data = localStorage.getItem(KEYS.WATCHLIST);
      if (!data) {
        // Initial sample watchlist so user doesn't start with an empty page
        const initial: WatchlistEntry[] = [
          {
            movieId: 'dune-2',
            movie: INITIAL_MOVIES[0],
            addedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            watched: true,
            watchedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
            personalRating: 10,
            collections: ['Weekend Marathon']
          },
          {
            movieId: 'oppenheimer',
            movie: INITIAL_MOVIES[1],
            addedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            watched: true,
            watchedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
            personalRating: 9,
            collections: ['Weekend Marathon']
          },
          {
            movieId: 'severance-s1',
            movie: INITIAL_MOVIES.find(m => m.id === 'severance-s1') || INITIAL_MOVIES[2],
            addedAt: new Date().toISOString(),
            watched: false,
            collections: ['Mind Benders']
          }
        ];
        localStorage.setItem(KEYS.WATCHLIST, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveWatchlist(entries: WatchlistEntry[]): void {
    localStorage.setItem(KEYS.WATCHLIST, JSON.stringify(entries));
    window.dispatchEvent(new Event('cineverse_watchlist_updated'));
  },

  addToWatchlist(movie: Movie, collections: string[] = []): boolean {
    const list = this.getWatchlist();
    if (list.some(e => String(e.movieId) === String(movie.id))) {
      return false; // already in list
    }
    const newEntry: WatchlistEntry = {
      movieId: movie.id,
      movie,
      addedAt: new Date().toISOString(),
      watched: false,
      collections
    };
    list.unshift(newEntry);
    this.saveWatchlist(list);
    this.incrementAdminStat('watchlistAdditions');
    return true;
  },

  removeFromWatchlist(movieId: string | number): void {
    const list = this.getWatchlist().filter(e => String(e.movieId) !== String(movieId));
    this.saveWatchlist(list);
  },

  toggleWatched(movieId: string | number, rating?: number): boolean {
    const list = this.getWatchlist();
    const item = list.find(e => String(e.movieId) === String(movieId));
    let watchedNow = true;
    if (item) {
      item.watched = !item.watched;
      watchedNow = item.watched;
      if (item.watched) {
        item.watchedDate = new Date().toISOString();
        if (rating) item.personalRating = rating;
      } else {
        item.watchedDate = undefined;
      }
      this.saveWatchlist(list);
    }
    return watchedNow;
  },

  isInWatchlist(movieId: string | number): boolean {
    return this.getWatchlist().some(e => String(e.movieId) === String(movieId));
  },

  isWatched(movieId: string | number): boolean {
    const item = this.getWatchlist().find(e => String(e.movieId) === String(movieId));
    return Boolean(item?.watched);
  },

  // Collections
  getCollections(): UserCollection[] {
    try {
      const data = localStorage.getItem(KEYS.COLLECTIONS);
      if (!data) {
        localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(DEFAULT_COLLECTIONS));
        return DEFAULT_COLLECTIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_COLLECTIONS;
    }
  },

  saveCollections(collections: UserCollection[]): void {
    localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(collections));
  },

  createCollection(name: string, description: string = ''): UserCollection {
    const collections = this.getCollections();
    const newCol: UserCollection = {
      id: 'col_' + Date.now(),
      name,
      description,
      movieIds: [],
      createdAt: new Date().toISOString()
    };
    collections.push(newCol);
    this.saveCollections(collections);
    return newCol;
  },

  // Reviews
  getReviews(): Review[] {
    try {
      const data = localStorage.getItem(KEYS.REVIEWS);
      if (!data) {
        localStorage.setItem(KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
        return INITIAL_REVIEWS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_REVIEWS;
    }
  },

  getReviewsForMovie(movieId: string | number): Review[] {
    return this.getReviews().filter(r => String(r.movieId) === String(movieId) && r.status !== 'flagged');
  },

  addReview(movieId: string | number, author: string, rating: number, content: string): Review {
    const reviews = this.getReviews();
    const newRev: Review = {
      id: 'rev_' + Date.now(),
      movieId,
      author: author.trim() || 'Cinephile User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      rating,
      date: new Date().toISOString().split('T')[0],
      content: content.trim(),
      isUserSubmitted: true,
      likes: 1,
      status: 'approved'
    };
    reviews.unshift(newRev);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    this.incrementAdminStat('reviewsWritten');
    return newRev;
  },

  updateReviewStatus(reviewId: string, status: 'approved' | 'pending' | 'flagged'): void {
    const reviews = this.getReviews().map(r => r.id === reviewId ? { ...r, status } : r);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  },

  deleteReview(reviewId: string): void {
    const reviews = this.getReviews().filter(r => r.id !== reviewId);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  },

  likeReview(reviewId: string): void {
    const reviews = this.getReviews().map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  },

  // Profile
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      if (!data) return DEFAULT_PROFILE;
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  // View history
  getViewHistory(): string[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.VIEW_HISTORY) || '[]');
    } catch {
      return [];
    }
  },

  addToViewHistory(movieId: string | number): void {
    try {
      const current = this.getViewHistory().filter(id => id !== String(movieId));
      current.unshift(String(movieId));
      localStorage.setItem(KEYS.VIEW_HISTORY, JSON.stringify(current.slice(0, 15)));
    } catch {
      // ignore
    }
  },

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('cineverse_settings_updated'));
  },

  // Admin stats
  getAdminStats() {
    try {
      const data = localStorage.getItem(KEYS.STATS);
      if (!data) {
        const initial = {
          totalSearches: 1420,
          recommendationsRun: 830,
          watchlistAdditions: 390,
          reviewsWritten: 124,
          activeUsersDemo: 48,
          apiCallsCount: 240
        };
        localStorage.setItem(KEYS.STATS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return { totalSearches: 0, recommendationsRun: 0, watchlistAdditions: 0, reviewsWritten: 0, activeUsersDemo: 1, apiCallsCount: 0 };
    }
  },

  incrementAdminStat(key: 'totalSearches' | 'recommendationsRun' | 'watchlistAdditions' | 'reviewsWritten' | 'apiCallsCount'): void {
    try {
      const stats = this.getAdminStats();
      stats[key] = (stats[key] || 0) + 1;
      localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }
};

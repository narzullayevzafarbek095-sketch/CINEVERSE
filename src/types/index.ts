export interface CastMember {
  name: string;
  character: string;
  image: string;
}

export interface Review {
  id: string;
  movieId: string | number;
  author: string;
  avatar?: string;
  rating: number; // 1 to 10
  date: string;
  content: string;
  isUserSubmitted?: boolean;
  isVerifiedCritic?: boolean;
  likes?: number;
  status?: 'approved' | 'pending' | 'flagged';
}

export interface Movie {
  id: string | number;
  title: string;
  originalTitle?: string;
  tagline?: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  releaseYear: number;
  rating: number; // e.g. 8.8
  voteCount: number;
  runtime: number; // in minutes
  genres: string[];
  moods: string[]; // e.g. 'Mind-Bending', 'Excited', 'Emotional', 'Curious', 'Happy', 'Relaxed', 'Thrilled'
  directors: string[];
  cast: CastMember[];
  trailerKey: string; // YouTube video ID
  certification: string; // PG-13, R, etc.
  languages: string[];
  budget?: string;
  revenue?: string;
  cineVerseScore: number; // 0 - 100
  type: 'movie' | 'animation' | 'series';
  featured?: boolean;
  trendingRank?: number;
  isPopular?: boolean;
  isTopRated?: boolean;
}

export type MoodType = 'Happy' | 'Excited' | 'Relaxed' | 'Curious' | 'Emotional' | 'Mind-Bending' | 'Thrilled';

export interface AIRecommendationRequest {
  genres: string[];
  mood: MoodType;
  runtimePreference: 'any' | 'under90' | '90to120' | '120to150' | 'over150';
  releaseEra: 'all' | 'classic' | '2000s' | '2010s' | 'recent';
  minRating: number;
  format: 'all' | 'movie' | 'animation' | 'series';
}

export interface ScoredMovieMatch {
  movie: Movie;
  matchScore: number; // 0 - 100%
  reasons: string[];
  aiAnalysisText: string;
}

export interface WatchlistEntry {
  movieId: string | number;
  movie: Movie;
  addedAt: string;
  watched: boolean;
  watchedDate?: string;
  personalRating?: number;
  collections: string[]; // collection names
  notes?: string;
}

export interface UserCollection {
  id: string;
  name: string;
  description?: string;
  movieIds: (string | number)[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  favoriteGenres: string[];
  totalWatchedTimeMinutes: number;
  isDemoAccount: boolean;
  preferences: {
    preferredLanguage: string;
    adultContent: boolean;
    autoPlayTrailers: boolean;
    defaultSort: string;
  };
}

export interface FilterState {
  searchQuery: string;
  selectedGenre: string;
  selectedYear: string;
  minRating: number;
  sortBy: 'popularity' | 'rating' | 'releaseDate' | 'title';
  format: 'all' | 'movie' | 'animation' | 'series';
  actorOrDirector: string;
}

export interface AdminStats {
  totalSearches: number;
  recommendationsRun: number;
  watchlistAdditions: number;
  reviewsWritten: number;
  activeUsersDemo: number;
  apiCallsCount: number;
}

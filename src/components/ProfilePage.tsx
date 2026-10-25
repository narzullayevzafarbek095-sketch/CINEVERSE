import React, { useState, useEffect } from 'react';
import { User, Film, Clock, Heart, Star, Sparkles, Settings, RotateCcw, Check, ShieldCheck, Eye } from 'lucide-react';
import { UserProfile, Movie } from '../types';
import { storageService } from '../services/storageService';
import { INITIAL_MOVIES, GENRE_LIST } from '../data/mockMovies';

interface ProfilePageProps {
  onSelectMovie: (movie: Movie) => void;
  onOpenSettings: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSelectMovie,
  onOpenSettings
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(profile.favoriteGenres);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const watchlist = storageService.getWatchlist();
  const watchedMovies = watchlist.filter(e => e.watched);
  const viewHistoryIds = storageService.getViewHistory();
  const historyMovies = viewHistoryIds
    .map(id => INITIAL_MOVIES.find(m => String(m.id) === id))
    .filter(Boolean) as Movie[];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Alex Mercer',
      bio: bio.trim(),
      favoriteGenres: selectedGenres
    };
    storageService.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const totalRuntimeMinutes = watchedMovies.reduce(
    (acc, cur) => acc + (cur.movie.runtime || 120),
    profile.totalWatchedTimeMinutes
  );

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-5xl mx-auto">
      {/* Demo Account Banner */}
      <div className="p-4 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Local Demo Profile Session
            </span>
            <p className="text-xs text-slate-400">
              Personalized preferences and watchlist are stored locally on your device in localStorage.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Settings className="w-3.5 h-3.5" />
          API & App Settings
        </button>
      </div>

      {/* Profile Card Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#12141C] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-purple-500/40 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#12141C]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                  {profile.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                  PRO CURATOR
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{profile.email}</p>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md pt-1">{profile.bio}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            Profile preferences updated successfully!
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Headline</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Favorite Genres</label>
              <div className="flex flex-wrap gap-1.5">
                {GENRE_LIST.filter(g => g !== 'All').map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      selectedGenres.includes(g)
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Film className="w-4 h-4" />
            <span className="text-xs text-slate-400 uppercase font-semibold">Watchlist</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{watchlist.length}</p>
          <span className="text-[11px] text-slate-500">Movies saved</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Check className="w-4 h-4" />
            <span className="text-xs text-slate-400 uppercase font-semibold">Watched</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{watchedMovies.length}</p>
          <span className="text-[11px] text-slate-500">Total screened</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs text-slate-400 uppercase font-semibold">Time Watched</span>
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-400">
            {Math.floor(totalRuntimeMinutes / 60)}h
          </p>
          <span className="text-[11px] text-slate-500">{totalRuntimeMinutes % 60}m minutes</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Star className="w-4 h-4" />
            <span className="text-xs text-slate-400 uppercase font-semibold">Reviews</span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">
            {watchedMovies.filter(e => e.personalRating).length + 2}
          </p>
          <span className="text-[11px] text-slate-500">Ratings submitted</span>
        </div>
      </div>

      {/* Favorite Genres Breakdown */}
      <div className="p-6 rounded-3xl bg-[#12141C] border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          Taste Profile & Favorite Genres
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.favoriteGenres.map(genre => (
            <span
              key={genre}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Recently Viewed Movies Reel */}
      {historyMovies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            Recently Explored Movies
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {historyMovies.slice(0, 6).map(movie => (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="group cursor-pointer space-y-1.5"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#161922] border border-white/5 group-hover:border-purple-500/50 transition-all">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs font-medium text-white truncate group-hover:text-purple-300">
                  {movie.title}
                </p>
                <p className="text-[10px] text-slate-400">
                  {movie.releaseYear} • ⭐ {movie.rating}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

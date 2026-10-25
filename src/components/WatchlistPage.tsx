import React, { useState, useEffect } from 'react';
import { Bookmark, Check, Trash2, Star, Plus, FolderPlus, Download, Upload, Film, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { WatchlistEntry, UserCollection, Movie } from '../types';
import { storageService } from '../services/storageService';
import { MovieCard } from './MovieCard';

interface WatchlistPageProps {
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onOpenAiFinder: () => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  onSelectMovie,
  onPlayTrailer,
  onOpenAiFinder
}) => {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(() => storageService.getWatchlist());
  const [collections, setCollections] = useState<UserCollection[]>(() => storageService.getCollections());
  const [activeTab, setActiveTab] = useState<'all' | 'watched' | 'unwatched' | string>('all');
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [showColModal, setShowColModal] = useState(false);
  const [ratingTargetId, setRatingTargetId] = useState<string | number | null>(null);

  const refreshData = () => {
    setWatchlist(storageService.getWatchlist());
    setCollections(storageService.getCollections());
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('cineverse_watchlist_updated', handleUpdate);
    return () => window.removeEventListener('cineverse_watchlist_updated', handleUpdate);
  }, []);

  const handleRemove = (movieId: string | number) => {
    storageService.removeFromWatchlist(movieId);
    refreshData();
  };

  const handleToggleWatched = (movieId: string | number, rating?: number) => {
    storageService.toggleWatched(movieId, rating);
    refreshData();
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    storageService.createCollection(newColName.trim(), newColDesc.trim());
    setNewColName('');
    setNewColDesc('');
    setShowColModal(false);
    refreshData();
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(watchlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cineverse_watchlist_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter items
  const filteredList = watchlist.filter(entry => {
    if (activeTab === 'all') return true;
    if (activeTab === 'watched') return entry.watched;
    if (activeTab === 'unwatched') return !entry.watched;
    // Check if matching collection name
    return entry.collections?.includes(activeTab);
  });

  const totalRuntimeMinutes = watchlist
    .filter(e => e.watched)
    .reduce((sum, e) => sum + (e.movie.runtime || 120), 0);

  const totalSaved = watchlist.length;
  const totalWatched = watchlist.filter(e => e.watched).length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight flex items-center gap-3">
            Personal Watchlist
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono font-medium">
              {totalSaved} Saved
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Curate your cinematic journey, mark films as watched, and categorize into custom collections.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            New Collection
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
            title="Export Watchlist JSON Backup"
          >
            <Download className="w-3.5 h-3.5" />
            Backup JSON
          </button>
        </div>
      </div>

      {/* Watchlist Telemetry Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#12141C] border border-white/5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Movies Saved</span>
            <p className="text-xl font-bold font-mono text-white">{totalSaved}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Watched & Completed</span>
            <p className="text-xl font-bold font-mono text-emerald-400">
              {totalWatched} <span className="text-xs text-slate-500 font-sans">({totalSaved > 0 ? Math.round((totalWatched / totalSaved) * 100) : 0}%)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Screen Time Watched</span>
            <p className="text-xl font-bold font-mono text-cyan-400">
              {Math.floor(totalRuntimeMinutes / 60)}h {totalRuntimeMinutes % 60}m
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Collection Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-[#161922]'
          }`}
        >
          All Films ({watchlist.length})
        </button>

        <button
          onClick={() => setActiveTab('unwatched')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'unwatched'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-[#161922]'
          }`}
        >
          To Watch ({watchlist.filter(e => !e.watched).length})
        </button>

        <button
          onClick={() => setActiveTab('watched')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'watched'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-[#161922]'
          }`}
        >
          Watched ({totalWatched})
        </button>

        {/* Custom Collection Tabs */}
        {collections.map(col => (
          <button
            key={col.id}
            onClick={() => setActiveTab(col.name)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeTab === col.name
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-[#161922]'
            }`}
          >
            📁 {col.name}
          </button>
        ))}
      </div>

      {/* Watchlist Grid */}
      {filteredList.length === 0 ? (
        <div className="py-20 text-center p-8 rounded-3xl bg-[#12141C] border border-white/5 space-y-4 max-w-lg mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-display">Your watchlist is waiting</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeTab === 'all'
              ? 'You have not added any films yet. Use our AI discovery engine or explore trending films!'
              : `No titles found in this view (${activeTab}).`}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onOpenAiFinder}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              Find Movies with AI
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((entry) => {
            const m = entry.movie;
            return (
              <div
                key={entry.movieId}
                className="p-4 rounded-2xl bg-[#12141C] border border-white/5 hover:border-purple-500/40 transition-all flex gap-4 group"
              >
                {/* Poster */}
                <div
                  onClick={() => onSelectMovie(m)}
                  className="w-24 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-[#161922] cursor-pointer shadow-md"
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details & Actions */}
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => onSelectMovie(m)}
                        className="text-sm font-bold text-white hover:text-purple-400 cursor-pointer line-clamp-1 transition-colors font-display"
                      >
                        {m.title}
                      </h3>
                      <button
                        onClick={() => handleRemove(entry.movieId)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>{m.releaseYear}</span>
                      <span>•</span>
                      <span className="truncate">{m.genres.slice(0, 2).join(', ')}</span>
                      <span>•</span>
                      <span className="font-mono text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {m.rating}
                      </span>
                    </div>

                    {/* Collections badges */}
                    {entry.collections && entry.collections.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.collections.map((col, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Watched Action & Personal Rating */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleWatched(entry.movieId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        entry.watched
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${entry.watched ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {entry.watched ? 'Watched' : 'Mark Watched'}
                    </button>

                    {entry.watched && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleToggleWatched(entry.movieId, star * 2)}
                            className="text-amber-400 hover:scale-125 transition-transform"
                            title={`Rate ${(star * 2)}/10`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                (entry.personalRating || 0) >= star * 2
                                  ? 'fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Collection Modal */}
      {showColModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#161922] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-purple-400" />
              Create Custom Collection
            </h3>
            <p className="text-xs text-slate-400">
              Group your saved movies into playlists like "Sci-Fi Marathon", "Date Night", or "Oscar Winners".
            </p>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Nolan Masterpieces"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="e.g. All films directed by Christopher Nolan"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowColModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

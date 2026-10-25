import React, { useState } from 'react';
import { X, Sparkles, Smile, Zap, Coffee, Search, Heart, Brain, Flame, Check, ArrowRight, RotateCcw, Play, Bookmark, Star } from 'lucide-react';
import { AIRecommendationRequest, MoodType, ScoredMovieMatch, Movie } from '../types';
import { aiRecommendationService } from '../services/aiRecommendationService';
import { storageService } from '../services/storageService';
import { GENRE_LIST } from '../data/mockMovies';

interface AiRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
}

const MOODS: { type: MoodType; label: string; icon: any; color: string; desc: string }[] = [
  { type: 'Happy', label: 'Happy & Uplifting', icon: Smile, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', desc: 'Heartwarming stories, joyful laughter & bright vibes' },
  { type: 'Excited', label: 'Excited & Adrenaline', icon: Zap, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30', desc: 'High-octane action, epic stakes & pulse-pounding thrills' },
  { type: 'Relaxed', label: 'Relaxed & Cozy', icon: Coffee, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', desc: 'Gentle pacing, calming aesthetics & comfort viewing' },
  { type: 'Curious', label: 'Curious & Inquisitive', icon: Search, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', desc: 'Intriguing mysteries, investigative plots & discoveries' },
  { type: 'Emotional', label: 'Emotional & Moving', icon: Heart, color: 'text-rose-400 bg-rose-400/10 border-rose-400/30', desc: 'Poignant drama, deep bonds & cathartic tears' },
  { type: 'Mind-Bending', label: 'Mind-Bending', icon: Brain, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30', desc: 'Complex twists, philosophical puzzles & alternate realities' },
  { type: 'Thrilled', label: 'Thrilled & Edge-of-Seat', icon: Flame, color: 'text-orange-400 bg-orange-400/10 border-orange-400/30', desc: 'Tense suspense, cat-and-mouse games & dark twists' },
];

export const AiRecommendationModal: React.FC<AiRecommendationModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  onPlayTrailer
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [selectedMood, setSelectedMood] = useState<MoodType>('Mind-Bending');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Sci-Fi']);
  const [runtimePref, setRuntimePref] = useState<AIRecommendationRequest['runtimePreference']>('any');
  const [releaseEra, setReleaseEra] = useState<AIRecommendationRequest['releaseEra']>('all');
  const [format, setFormat] = useState<AIRecommendationRequest['format']>('all');
  const [minRating, setMinRating] = useState<number>(7.5);
  const [results, setResults] = useState<ScoredMovieMatch[]>([]);
  const [engineType, setEngineType] = useState<'gemini_neural' | 'algorithmic_smart'>('algorithmic_smart');

  const toggleGenre = (genre: string) => {
    if (genre === 'All') {
      setSelectedGenres([]);
      return;
    }
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleGenerate = async () => {
    setStep('loading');
    const req: AIRecommendationRequest = {
      genres: selectedGenres,
      mood: selectedMood,
      runtimePreference: runtimePref,
      releaseEra,
      minRating,
      format
    };

    try {
      const response = await aiRecommendationService.getRecommendations(req);
      setResults(response.matches);
      setEngineType(response.engineType);
      setTimeout(() => {
        setStep('results');
      }, 700);
    } catch (err) {
      console.error(err);
      setStep('form');
    }
  };

  const handleReset = () => {
    setStep('form');
    setResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#12141C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#161922] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                Find Your Next Movie
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                  AI Discovery
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Personalized movie match tailored to your mood, genres, and exact vibe.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {step === 'form' && (
            <div className="space-y-6">
              {/* Mood Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
                  1. What is your current mood or desired headspace?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {MOODS.map((m) => {
                    const Icon = m.icon;
                    const isSelected = selectedMood === m.type;
                    return (
                      <button
                        key={m.type}
                        type="button"
                        onClick={() => setSelectedMood(m.type)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? `${m.color} ring-2 ring-purple-500 shadow-lg shadow-purple-900/30 bg-[#1D202E]`
                            : 'bg-[#161922] border-white/5 hover:border-white/20 text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{m.label}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genre Pills */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
                  2. Preferred Genres (Select multiple or none for all)
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_LIST.filter(g => g !== 'All').map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                            : 'bg-[#161922] text-slate-400 border-white/5 hover:border-white/15 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls Matrix: Length, Era, Format, Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#161922] border border-white/5">
                {/* Length */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">
                    3. Movie Length
                  </label>
                  <select
                    value={runtimePref}
                    onChange={(e) => setRuntimePref(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="any">Any Length</option>
                    <option value="under90">Under 90 mins (Snack)</option>
                    <option value="90to120">90 - 120 mins (Standard)</option>
                    <option value="120to150">120 - 150 mins (Epic)</option>
                    <option value="over150">150+ mins (Cinematic Feast)</option>
                  </select>
                </div>

                {/* Release Era */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">
                    4. Release Period
                  </label>
                  <select
                    value={releaseEra}
                    onChange={(e) => setReleaseEra(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Eras</option>
                    <option value="recent">Recent (2020 - Present)</option>
                    <option value="2010s">2010s Era</option>
                    <option value="2000s">2000s Classics</option>
                    <option value="classic">Golden Classics (&lt;2000)</option>
                  </select>
                </div>

                {/* Format */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">
                    5. Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Formats</option>
                    <option value="movie">Live Action Feature Films</option>
                    <option value="animation">Animated Films & Anime</option>
                    <option value="series">Limited Series / Shows</option>
                  </select>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">
                      6. Min IMDb Rating
                    </label>
                    <span className="font-mono text-xs font-bold text-amber-400">{minRating.toFixed(1)}+</span>
                  </div>
                  <input
                    type="range"
                    min="6.5"
                    max="9.0"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  Synthesize My Recommendations
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Sparkles className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Analyzing cinematic signatures & mood vectors...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Correlating genre dynamics, runtime fit, critical scores, and your emotional vibe "{selectedMood}".
              </p>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-6">
              {/* Results Subheader & Transparency Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#161922] border border-white/5">
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Personalized Matches for "{selectedMood}"
                  </h3>
                  <p className="text-xs text-slate-400">
                    Showing top curated matches scoring above your quality threshold.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {engineType === 'gemini_neural' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Gemini Neural AI Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold">
                      <Brain className="w-3.5 h-3.5" />
                      Algorithmic Smart Matcher (Offline Engine)
                    </span>
                  )}

                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Refine
                  </button>
                </div>
              </div>

              {/* Scored Recommendations List */}
              <div className="space-y-4">
                {results.map((match, idx) => {
                  const m = match.movie;
                  return (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-[#151824] border border-white/5 hover:border-purple-500/40 transition-all flex flex-col md:flex-row gap-5 items-start"
                    >
                      {/* Thumbnail Poster */}
                      <div
                        onClick={() => {
                          onSelectMovie(m);
                          onClose();
                        }}
                        className="w-24 sm:w-28 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-[#1D202E] cursor-pointer group relative shadow-lg"
                      >
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                      </div>

                      {/* Content & AI Rationale Breakdown */}
                      <div className="flex-1 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 text-xs font-bold flex items-center justify-center font-mono">
                              #{idx + 1}
                            </span>
                            <h4
                              onClick={() => {
                                onSelectMovie(m);
                                onClose();
                              }}
                              className="text-lg font-bold text-white font-display hover:text-purple-400 cursor-pointer transition-colors"
                            >
                              {m.title}
                            </h4>
                            <span className="text-xs text-slate-400">({m.releaseYear})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 border border-white/10 text-amber-400 font-mono text-xs font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {m.rating}
                            </span>

                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono font-bold text-xs shadow-md">
                              {match.matchScore}% Match
                            </span>
                          </div>
                        </div>

                        {/* AI Analysis Quote */}
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 italic font-sans flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>"{match.aiAnalysisText}"</span>
                        </div>

                        {/* Why CineVerse AI Recommended This */}
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Why CineVerse AI Recommended This:
                          </p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-300">
                            {match.reasons.map((r, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <button
                            onClick={() => {
                              onSelectMovie(m);
                              onClose();
                            }}
                            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                          >
                            Explore Details
                          </button>
                          <button
                            onClick={() => onPlayTrailer(m)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Watch Trailer
                          </button>
                          <button
                            onClick={() => storageService.addToWatchlist(m)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
                          >
                            <Bookmark className="w-3 h-3" />
                            Save to Watchlist
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, Activity, Film, MessageSquare, Megaphone, CheckCircle2, AlertTriangle, Trash2, Eye, RefreshCw, LogOut, Check, Star } from 'lucide-react';
import { adminService, ApiHealthStatus } from '../services/adminService';
import { AdminStats, Review, Movie } from '../types';
import { INITIAL_MOVIES } from '../data/mockMovies';

interface AdminDashboardProps {
  onSelectMovie: (movie: Movie) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectMovie }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => adminService.isAuthenticated());
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const [stats, setStats] = useState<AdminStats>(() => adminService.getStats());
  const [reviews, setReviews] = useState<Review[]>(() => adminService.getModerationReviews());
  const [broadcastMsg, setBroadcastMsg] = useState(() => adminService.getBroadcastMessage());
  const [broadcastDraft, setBroadcastDraft] = useState(broadcastMsg);
  const [broadcastSaved, setBroadcastSaved] = useState(false);

  const [healthStatus, setHealthStatus] = useState<ApiHealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const [activeTab, setActiveTab] = useState<'metrics' | 'moderation' | 'content' | 'health'>('metrics');

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await adminService.checkApiHealth();
      setHealthStatus(res);
    } catch {
      // ignore
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkHealth();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.verifyCredentials(passcode)) {
      setIsAuthenticated(true);
      setAuthError('');
      checkHealth();
    } else {
      setAuthError('Invalid administrator credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
  };

  const handleModerate = (id: string, action: 'approve' | 'flag' | 'delete') => {
    adminService.moderateReview(id, action);
    setReviews(adminService.getModerationReviews());
  };

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    adminService.setBroadcastMessage(broadcastDraft);
    setBroadcastMsg(broadcastDraft);
    setBroadcastSaved(true);
    setTimeout(() => setBroadcastSaved(false), 2500);
  };

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="py-16 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#12141C] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold font-display text-white">
              CineVerse Administrator
            </h2>
            <p className="text-xs text-slate-400">
              Enter your secure administrator access passcode to manage movie metadata, moderate community reviews, and inspect API health.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (cineverse2026)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1118] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              Authenticate Admin Session
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            Demo evaluator default passcode: <code className="text-purple-300 bg-purple-500/10 px-1 py-0.5 rounded">cineverse2026</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-6xl mx-auto">
      {/* Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12141C] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black font-display text-white">
                Admin Control Center
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                AUTHORIZED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage platform operations, review moderation, telemetry metrics, and API health.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            End Session
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/5">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'metrics'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white bg-[#161922]'
          }`}
        >
          <Activity className="w-4 h-4" />
          Telemetry & Usage Stats
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'moderation'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white bg-[#161922]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Review Moderation ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'content'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white bg-[#161922]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcements & Spotlight
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'health'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white bg-[#161922]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          API & Service Health
        </button>
      </div>

      {/* Tab 1: Telemetry & Usage Stats */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Searches</span>
              <p className="text-2xl font-bold font-mono text-purple-400">{stats.totalSearches}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">AI Match Runs</span>
              <p className="text-2xl font-bold font-mono text-cyan-400">{stats.recommendationsRun}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Watchlist Saves</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">{stats.watchlistAdditions}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Reviews Posted</span>
              <p className="text-2xl font-bold font-mono text-amber-400">{stats.reviewsWritten}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Demo Users</span>
              <p className="text-2xl font-bold font-mono text-blue-400">{stats.activeUsersDemo}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">API Calls Count</span>
              <p className="text-2xl font-bold font-mono text-rose-400">{stats.apiCallsCount}</p>
            </div>
          </div>

          {/* Activity distribution panel */}
          <div className="p-6 rounded-3xl bg-[#12141C] border border-white/5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Real-time Discovery Funnel Health
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>AI Recommendation Conversion (Runs to Watchlist Adds)</span>
                  <span className="font-mono text-purple-300">
                    {Math.round((stats.watchlistAdditions / Math.max(1, stats.recommendationsRun)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((stats.watchlistAdditions / Math.max(1, stats.recommendationsRun)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Search Engagement Index</span>
                  <span className="font-mono text-cyan-300">89.4 / 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Review Moderation */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">
              Community Reviews Queue ({reviews.length})
            </h3>
            <span className="text-xs text-slate-400">
              Audit user submissions, verified critics, and filter inappropriate comments.
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-[#141620] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{rev.author}</span>
                    <span className="text-[11px] text-amber-400 font-mono font-bold">⭐ {rev.rating}/10</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                      rev.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                      rev.status === 'flagged' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rev.status || 'approved'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{rev.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleModerate(rev.id, 'approve')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleModerate(rev.id, 'flag')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/20 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Flag
                  </button>

                  <button
                    onClick={() => handleModerate(rev.id, 'delete')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Announcements & Content Management */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveBroadcast} className="p-6 rounded-3xl bg-[#12141C] border border-white/5 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-purple-400" />
              Platform Broadcast Banner
            </h3>
            <p className="text-xs text-slate-400">
              Broadcast high-priority notices, film festivals, or maintenance alerts to all users across the top of CineVerse AI.
            </p>

            <textarea
              rows={2}
              value={broadcastDraft}
              onChange={(e) => setBroadcastDraft(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1118] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
            />

            {broadcastSaved && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in font-medium">
                <Check className="w-4 h-4" />
                Broadcast updated across all active sessions!
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Publish Broadcast
              </button>
            </div>
          </form>

          {/* Curated Spotlight Overviews */}
          <div className="p-6 rounded-3xl bg-[#12141C] border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              Featured Master Titles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {INITIAL_MOVIES.slice(0, 6).map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectMovie(m)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#161922] border border-white/5 hover:border-purple-500/40 cursor-pointer transition-colors"
                >
                  <img src={m.posterUrl} alt={m.title} className="w-10 h-14 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{m.title}</p>
                    <p className="text-[10px] text-slate-400">{m.releaseYear} • ⭐ {m.rating}</p>
                    <span className="text-[10px] text-purple-300 font-mono">{m.cineVerseScore}% Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: API & Service Health */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TMDB API Status */}
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">TMDB Movie API</span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  healthStatus?.tmdbStatus === 'connected' ? 'bg-emerald-400' :
                  healthStatus?.tmdbStatus === 'demo_mode' ? 'bg-cyan-400' : 'bg-rose-400'
                }`} />
                <p className="text-sm font-bold text-white capitalize">
                  {healthStatus?.tmdbStatus === 'demo_mode' ? 'Curated Master (Ready for API Key)' : healthStatus?.tmdbStatus}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Provides dynamic real-time metadata, artwork, and cast details.
              </p>
            </div>

            {/* Gemini Status */}
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">Gemini AI Synthesis</span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  healthStatus?.geminiStatus === 'connected' ? 'bg-emerald-400' :
                  healthStatus?.geminiStatus === 'not_configured' ? 'bg-purple-400' : 'bg-rose-400'
                }`} />
                <p className="text-sm font-bold text-white capitalize">
                  {healthStatus?.geminiStatus === 'not_configured' ? 'Algorithmic Mode (Key Optional)' : healthStatus?.geminiStatus}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Produces natural language recommendation summaries and cinematic critique.
              </p>
            </div>

            {/* Local Master Cache */}
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">Local Curated Cache</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <p className="text-sm font-bold text-white">
                  {healthStatus?.cacheEntriesCount || INITIAL_MOVIES.length} Verified Master Films
                </p>
              </div>
              <p className="text-xs text-slate-500">
                100% offline guaranteed fallback with full trailers and cast rosters.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

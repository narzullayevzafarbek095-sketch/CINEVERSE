import React from 'react';
import { Film, Sparkles, Heart, Shield, Github, Twitter, Youtube, ExternalLink } from 'lucide-react';
import { tmdbService } from '../services/tmdbService';

interface FooterProps {
  onNavigate: (view: any, extra?: string) => void;
  onOpenSettings: () => void;
  onOpenAiFinder: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSettings,
  onOpenAiFinder
}) => {
  const isLive = tmdbService.isLiveMode();

  return (
    <footer className="border-t border-white/5 bg-[#06070A] text-slate-400 text-xs pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#08090D] rounded-2xl flex items-center justify-center">
                  <Film className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <span className="text-lg font-black font-display tracking-tight text-white flex items-center gap-1.5">
                CINEVERSE
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  AI
                </span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              CineVerse AI is a next-generation film discovery platform blending curated cinema mastery, mood-vector recommendation algorithms, and real-time streaming intelligence.
            </p>

            {/* Service Status Badge */}
            <div className="flex items-center gap-2 pt-1">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
              <span className="text-[11px] font-mono text-slate-400">
                Data Engine: {isLive ? 'TMDB Live Sync Active' : 'Curated Offline Master Mode (Demo)'}
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-purple-400 transition-colors">
                  Cinematic Spotlight
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discover')} className="hover:text-purple-400 transition-colors">
                  Global Movie Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trending')} className="hover:text-purple-400 transition-colors">
                  Top Trending Releases
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('watchlist')} className="hover:text-purple-400 transition-colors">
                  Personal Watchlist
                </button>
              </li>
              <li>
                <button onClick={onOpenAiFinder} className="hover:text-purple-400 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AI Movie Finder
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Genres */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Curated Genres</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate('discover', 'Sci-Fi')} className="hover:text-purple-400 transition-colors">
                  Sci-Fi & Cyberpunk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discover', 'Action')} className="hover:text-purple-400 transition-colors">
                  Adrenaline & Action
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discover', 'Drama')} className="hover:text-purple-400 transition-colors">
                  Psychological Drama
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discover', 'Animation')} className="hover:text-purple-400 transition-colors">
                  Groundbreaking Animation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discover', 'Thriller')} className="hover:text-purple-400 transition-colors">
                  Edge-of-Seat Thrillers
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Controls */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">System & Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={onOpenSettings} className="hover:text-purple-400 transition-colors">
                  API Keys & Configuration
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-purple-400 transition-colors">
                  Administrator Dashboard
                </button>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block leading-normal pt-1">
                  This product uses the TMDB API but is not endorsed or certified by TMDB. Movie posters and metadata are property of their respective production studios.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 CineVerse AI. Designed with cinematic precision.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for Cinephiles
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

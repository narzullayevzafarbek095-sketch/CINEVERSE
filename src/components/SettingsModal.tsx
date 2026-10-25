import React, { useState } from 'react';
import { X, Settings, Key, Sparkles, Check, RefreshCw, AlertCircle, Palette, RotateCcw } from 'lucide-react';
import { storageService, AppSettings } from '../services/storageService';
import { tmdbService } from '../services/tmdbService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved
}) => {
  if (!isOpen) return null;

  const currentSettings = storageService.getSettings();
  const [tmdbKey, setTmdbKey] = useState(currentSettings.tmdbApiKey);
  const [geminiKey, setGeminiKey] = useState(currentSettings.geminiApiKey);
  const [useLiveTmdb, setUseLiveTmdb] = useState(currentSettings.useLiveTmdb);
  const [themeAccent, setThemeAccent] = useState<AppSettings['themeAccent']>(currentSettings.themeAccent || 'violet');

  const [testingTmdb, setTestingTmdb] = useState(false);
  const [tmdbTestResult, setTmdbTestResult] = useState<'success' | 'failed' | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestTmdb = async () => {
    if (!tmdbKey.trim()) {
      setTmdbTestResult('failed');
      return;
    }
    setTestingTmdb(true);
    setTmdbTestResult(null);

    try {
      const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdbKey.trim()}`);
      if (res.ok) {
        setTmdbTestResult('success');
      } else {
        setTmdbTestResult('failed');
      }
    } catch {
      setTmdbTestResult('failed');
    } finally {
      setTestingTmdb(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      tmdbApiKey: tmdbKey.trim(),
      geminiApiKey: geminiKey.trim(),
      useLiveTmdb: Boolean(tmdbKey.trim() && useLiveTmdb),
      themeAccent
    };
    storageService.saveSettings(updated);
    setSaveSuccess(true);
    onSettingsSaved();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore CineVerse AI to default demo sample data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#12141C] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Platform Settings</h2>
              <p className="text-xs text-slate-400">Configure external movie APIs, AI keys & design themes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* TMDB API Key Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                The Movie Database (TMDB) API Key
              </label>
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-purple-400 hover:underline"
              >
                Get Free Key ↗
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tmdbKey}
                onChange={(e) => {
                  setTmdbKey(e.target.value);
                  setTmdbTestResult(null);
                }}
                placeholder="Paste your 32-character TMDB v3 API Key"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0E1017] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleTestTmdb}
                disabled={testingTmdb || !tmdbKey.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 disabled:opacity-40 transition-colors shrink-0"
              >
                {testingTmdb ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
            </div>

            {tmdbTestResult === 'success' && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                TMDB Key Verified! Live data streaming enabled.
              </p>
            )}

            {tmdbTestResult === 'failed' && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Verification failed. Please check the key.
              </p>
            )}

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={useLiveTmdb}
                onChange={(e) => setUseLiveTmdb(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-[#0E1017] border-white/20"
              />
              <span className="text-xs text-slate-300">
                Enable live TMDB queries when key is present (fallback to curated catalog if unchecked)
              </span>
            </label>
          </div>

          {/* Gemini AI Key Section */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Google Gemini API Key (Optional)
              </label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Get Gemini Key ↗
              </a>
            </div>

            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Paste Gemini API Key for deep conversational AI critiques"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1017] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              When omitted, CineVerse AI uses its built-in algorithmic vector scoring engine without fabricating API connections.
            </p>
          </div>

          {/* Theme Accent Picker */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Theme Accent Palette
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'violet', label: 'Violet Glow', color: 'from-purple-600 to-indigo-600' },
                { id: 'cyan', label: 'Electric Cyan', color: 'from-cyan-500 to-blue-600' },
                { id: 'emerald', label: 'Emerald Neon', color: 'from-emerald-500 to-teal-600' },
                { id: 'amber', label: 'Solar Amber', color: 'from-amber-500 to-orange-600' },
              ].map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeAccent(theme.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-white transition-all flex flex-col items-center gap-1.5 ${
                    themeAccent === theme.id
                      ? 'border-white bg-[#1D202E] shadow-lg ring-1 ring-white/50'
                      : 'border-white/5 bg-[#161922] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.color}`} />
                  <span className="text-[11px]">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={handleResetData}
              className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Local Demo Data
            </button>
          </div>

          {saveSuccess && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-center animate-fade-in font-medium">
              Settings updated successfully!
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

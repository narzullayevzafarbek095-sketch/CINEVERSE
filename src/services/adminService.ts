import { storageService } from './storageService';
import { tmdbService } from './tmdbService';
import { Movie, Review, AdminStats } from '../types';
import { INITIAL_MOVIES } from '../data/mockMovies';

const ADMIN_TOKEN_KEY = 'cineverse_admin_auth_token_v1';
const BROADCAST_KEY = 'cineverse_admin_broadcast_v1';

export interface ApiHealthStatus {
  tmdbStatus: 'connected' | 'demo_mode' | 'error';
  geminiStatus: 'connected' | 'not_configured' | 'error';
  cacheEntriesCount: number;
  lastChecked: string;
}

export const adminService = {
  verifyCredentials(passcode: string): boolean {
    const expected = (import.meta as any).env?.VITE_ADMIN_PASSCODE || 'cineverse2026';
    if (passcode.trim() === expected) {
      const token = 'cine_adm_' + Math.random().toString(36).substring(2) + '_' + Date.now();
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      return true;
    }
    return false;
  },

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    return Boolean(token && token.startsWith('cine_adm_'));
  },

  logout(): void {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  getStats(): AdminStats {
    return storageService.getAdminStats();
  },

  getModerationReviews(): Review[] {
    return storageService.getReviews();
  },

  moderateReview(reviewId: string, action: 'approve' | 'flag' | 'delete'): void {
    if (action === 'delete') {
      storageService.deleteReview(reviewId);
    } else {
      storageService.updateReviewStatus(reviewId, action === 'approve' ? 'approved' : 'flagged');
    }
  },

  getBroadcastMessage(): string {
    return localStorage.getItem(BROADCAST_KEY) || '🚀 CineVerse AI v2.4 Live: Smart Discovery & Trailer Playback Enabled!';
  },

  setBroadcastMessage(msg: string): void {
    localStorage.setItem(BROADCAST_KEY, msg.trim());
    window.dispatchEvent(new Event('cineverse_broadcast_updated'));
  },

  async checkApiHealth(): Promise<ApiHealthStatus> {
    const settings = storageService.getSettings();
    let tmdbStatus: ApiHealthStatus['tmdbStatus'] = 'demo_mode';
    let geminiStatus: ApiHealthStatus['geminiStatus'] = 'not_configured';

    if (settings.tmdbApiKey && settings.useLiveTmdb) {
      try {
        await tmdbService.fetchFromTmdb('/configuration');
        tmdbStatus = 'connected';
      } catch {
        tmdbStatus = 'error';
      }
    }

    if (settings.geminiApiKey) {
      try {
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${settings.geminiApiKey}`
        );
        geminiStatus = testRes.ok ? 'connected' : 'error';
      } catch {
        geminiStatus = 'error';
      }
    }

    return {
      tmdbStatus,
      geminiStatus,
      cacheEntriesCount: INITIAL_MOVIES.length,
      lastChecked: new Date().toLocaleTimeString()
    };
  }
};

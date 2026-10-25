import { AIRecommendationRequest, ScoredMovieMatch, Movie } from '../types';
import { INITIAL_MOVIES } from '../data/mockMovies';
import { storageService } from './storageService';

// Mood affinity mappings for semantic resonance
const MOOD_AFFINITIES: Record<string, string[]> = {
  'Happy': ['Comedy', 'Family', 'Music', 'Animation', 'Adventure'],
  'Excited': ['Action', 'Adventure', 'Sci-Fi', 'Thriller'],
  'Relaxed': ['Animation', 'Comedy', 'Drama', 'Fantasy', 'Romance'],
  'Curious': ['Mystery', 'Sci-Fi', 'History', 'Biography', 'Crime'],
  'Emotional': ['Drama', 'Romance', 'Biography', 'Music'],
  'Mind-Bending': ['Sci-Fi', 'Mystery', 'Thriller'],
  'Thrilled': ['Thriller', 'Crime', 'Action']
};

export const aiRecommendationService = {
  async getRecommendations(req: AIRecommendationRequest): Promise<{
    matches: ScoredMovieMatch[];
    engineType: 'gemini_neural' | 'algorithmic_smart';
  }> {
    storageService.incrementAdminStat('recommendationsRun');
    const settings = storageService.getSettings();
    const hasGeminiKey = Boolean(settings.geminiApiKey?.trim());

    // 1. Score each candidate movie
    const scoredList: ScoredMovieMatch[] = INITIAL_MOVIES.map(movie => {
      let score = 50;
      const reasons: string[] = [];

      // Format filtering
      if (req.format !== 'all' && movie.type !== req.format) {
        score -= 40;
      }

      // Minimum rating
      if (movie.rating < req.minRating) {
        score -= 25;
      } else {
        score += 8;
        if (movie.rating >= 8.5) {
          reasons.push(`Exceptional critical reception: ${movie.rating}/10 (${movie.voteCount.toLocaleString()} votes)`);
        }
      }

      // Genre synergy
      if (req.genres.length > 0) {
        const matchingGenres = movie.genres.filter(g => req.genres.includes(g));
        if (matchingGenres.length > 0) {
          score += matchingGenres.length * 14;
          reasons.push(`Direct genre synergy: ${matchingGenres.join(', ')}`);
        } else {
          score -= 15;
        }
      }

      // Mood synergy
      const moodMatches = movie.moods.includes(req.mood);
      if (moodMatches) {
        score += 22;
        reasons.push(`Perfect resonance with your "${req.mood}" mood profile`);
      } else {
        const relatedGenres = MOOD_AFFINITIES[req.mood] || [];
        const overlaps = movie.genres.some(g => relatedGenres.includes(g));
        if (overlaps) {
          score += 10;
          reasons.push(`Atmosphere aligns well with ${req.mood.toLowerCase()} cinema pacing`);
        }
      }

      // Runtime preference
      const rt = movie.runtime;
      let runtimeFits = false;
      if (req.runtimePreference === 'under90' && rt < 90) runtimeFits = true;
      else if (req.runtimePreference === '90to120' && rt >= 90 && rt <= 125) runtimeFits = true;
      else if (req.runtimePreference === '120to150' && rt >= 120 && rt <= 155) runtimeFits = true;
      else if (req.runtimePreference === 'over150' && rt > 150) runtimeFits = true;
      else if (req.runtimePreference === 'any') runtimeFits = true;

      if (runtimeFits) {
        score += 10;
        reasons.push(`Ideal runtime of ${Math.floor(rt / 60)}h ${rt % 60}m fits your viewing window`);
      }

      // Release Era
      const yr = movie.releaseYear;
      let eraFits = false;
      if (req.releaseEra === 'classic' && yr < 2000) eraFits = true;
      else if (req.releaseEra === '2000s' && yr >= 2000 && yr < 2010) eraFits = true;
      else if (req.releaseEra === '2010s' && yr >= 2010 && yr < 2020) eraFits = true;
      else if (req.releaseEra === 'recent' && yr >= 2020) eraFits = true;
      else if (req.releaseEra === 'all') eraFits = true;

      if (eraFits) {
        score += 8;
        reasons.push(`Released in ${movie.releaseYear}, precisely matching your target era`);
      }

      // Cap match score between 65% and 99%
      const matchScore = Math.max(65, Math.min(99, Math.round(score)));

      // Generate synthesis text
      const aiAnalysisText = `Recommended because of its striking ${movie.genres[0]} craftsmanship, directed by ${movie.directors[0]}, delivering a resonant tone tailored for your "${req.mood}" mood.`;

      return {
        movie,
        matchScore,
        reasons: reasons.slice(0, 4),
        aiAnalysisText
      };
    });

    // Sort descending by match score
    const topMatches = scoredList.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

    // 2. If Gemini API key is configured, enrich descriptions with real Gemini calls
    if (hasGeminiKey) {
      try {
        const enriched = await this.enrichWithGemini(topMatches, req, settings.geminiApiKey);
        return { matches: enriched, engineType: 'gemini_neural' };
      } catch (err) {
        console.warn('Gemini API call failed, using algorithmic analysis:', err);
      }
    }

    return { matches: topMatches, engineType: 'algorithmic_smart' };
  },

  async enrichWithGemini(
    matches: ScoredMovieMatch[],
    req: AIRecommendationRequest,
    apiKey: string
  ): Promise<ScoredMovieMatch[]> {
    storageService.incrementAdminStat('apiCallsCount');
    const movieTitles = matches.map(m => m.movie.title).join(', ');
    const prompt = `You are CineVerse AI, an elite film curator. The user is in a "${req.mood}" mood and selected genres: ${req.genres.join(', ') || 'Any'}. For each of these movies (${movieTitles}), provide a single punchy 1-2 sentence personalized rationale explaining why it is the perfect match for their specific emotional headspace. Format as a JSON array of strings in order.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) throw new Error('Gemini API request failed');
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return matches;

    const rationales: string[] = JSON.parse(rawText);
    return matches.map((item, idx) => ({
      ...item,
      aiAnalysisText: rationales[idx] || item.aiAnalysisText
    }));
  }
};

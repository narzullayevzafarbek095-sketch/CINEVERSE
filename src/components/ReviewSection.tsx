import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, ShieldCheck, UserCheck, MessageSquarePlus, Sparkles } from 'lucide-react';
import { Review } from '../types';
import { storageService } from '../services/storageService';

interface ReviewSectionProps {
  movieId: string | number;
  movieTitle: string;
  onReviewAdded?: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ movieId, movieTitle, onReviewAdded }) => {
  const [reviews, setReviews] = useState<Review[]>(() => storageService.getReviewsForMovie(movieId));
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('helpful');
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(10);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const refreshReviews = () => {
    setReviews(storageService.getReviewsForMovie(movieId));
  };

  const handleLike = (reviewId: string) => {
    storageService.likeReview(reviewId);
    refreshReviews();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('Please write a review before submitting.');
      return;
    }
    if (content.trim().length < 10) {
      setErrorMsg('Your review must be at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      storageService.addReview(movieId, authorName.trim() || 'Alex Mercer', rating, content.trim());
      setContent('');
      setAuthorName('');
      setShowForm(false);
      refreshReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setErrorMsg('Failed to post review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'highest') return b.rating - a.rating;
    return (b.likes || 0) - (a.likes || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header and sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
            Audience & Critic Reviews
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              {reviews.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real audience feedback, verified critical perspectives, and community scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#161922] p-1 rounded-lg border border-white/10 text-xs">
            <span className="text-slate-400 px-2">Sort:</span>
            <button
              onClick={() => setSortBy('helpful')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'helpful' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Helpful
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'recent' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('highest')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortBy === 'highest' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rating
            </button>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Write Review'}
          </button>
        </div>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#161922]/90 border border-purple-500/30 space-y-4 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Your Review for {movieTitle}
            </h4>
            <span className="text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              User Submitted Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Your Name / Alias
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Alex Mercer (or leave for default profile)"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0F1118] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Your Rating (1 to 10)
              </label>
              <div className="flex items-center gap-1 py-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= (hoverRating ?? rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-mono font-bold text-sm text-amber-400">
                  {hoverRating ?? rating}/10
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Review Content
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What made this film memorable? Discuss pacing, performance, cinematography, or emotional resonance..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1118] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#161922]/50 border border-white/5">
            <p className="text-sm text-slate-400">No reviews yet for this movie.</p>
            <p className="text-xs text-slate-500 mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          sortedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-[#141620] border border-white/5 hover:border-white/10 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={rev.author}
                    className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{rev.author}</span>
                      {rev.isVerifiedCritic ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Critic
                        </span>
                      ) : rev.isUserSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Community Member
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                          Sample Review
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{rev.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{rev.rating}/10</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pl-12">
                {rev.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 pl-12 text-xs text-slate-500">
                <span className="text-[11px]">Was this review helpful?</span>
                <button
                  onClick={() => handleLike(rev.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{rev.likes || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

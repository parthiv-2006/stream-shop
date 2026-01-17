'use client';

import { useState } from 'react';

const ASPECT_LABELS = {
  food_quality: { label: 'Food Quality', icon: '🍽️' },
  service: { label: 'Service', icon: '👨‍🍳' },
  ambiance: { label: 'Ambiance', icon: '✨' },
  value: { label: 'Value for Money', icon: '💰' },
};

const TAGS = [
  { value: 'great-for-groups', label: 'Great for Groups', icon: '👥' },
  { value: 'romantic', label: 'Romantic', icon: '💕' },
  { value: 'quick-service', label: 'Quick Service', icon: '⚡' },
  { value: 'good-portions', label: 'Good Portions', icon: '🍖' },
  { value: 'instagram-worthy', label: 'Instagram-worthy', icon: '📸' },
  { value: 'hidden-gem', label: 'Hidden Gem', icon: '💎' },
  { value: 'kid-friendly', label: 'Kid Friendly', icon: '👶' },
  { value: 'date-night', label: 'Date Night', icon: '🌙' },
  { value: 'casual', label: 'Casual', icon: '😎' },
  { value: 'upscale', label: 'Upscale', icon: '🥂' },
  { value: 'outdoor-seating', label: 'Outdoor Seating', icon: '🌳' },
  { value: 'late-night', label: 'Late Night', icon: '🦉' },
];

function StarRating({ rating, setRating, size = 'lg' }) {
  const sizeClasses = size === 'lg' ? 'text-3xl' : 'text-xl';
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`${sizeClasses} transition-transform hover:scale-110 ${
            star <= rating ? 'text-yellow-400' : 'text-white/20'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function FeedbackForm({ visit, onSubmit, onCancel, isSubmitting }) {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(0);
  const [aspects, setAspects] = useState({
    food_quality: 0,
    service: 0,
    ambiance: 0,
    value: 0,
  });
  const [wouldReturn, setWouldReturn] = useState(null);
  const [review, setReview] = useState('');
  const [dishes, setDishes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const steps = [
    { title: 'Overall Rating', subtitle: 'How was your experience?' },
    { title: 'The Details', subtitle: 'Rate specific aspects' },
    { title: 'Would You Return?', subtitle: 'Would you go back?' },
    { title: 'Your Thoughts', subtitle: 'Share your experience' },
  ];

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      rating,
      aspects: Object.fromEntries(
        Object.entries(aspects).filter(([_, v]) => v > 0)
      ),
      would_return: wouldReturn,
      review,
      dishes_tried: dishes.split(',').map(d => d.trim()).filter(Boolean),
      tags: selectedTags,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return rating > 0;
      case 1: return true; // Optional
      case 2: return wouldReturn !== null;
      case 3: return true; // Optional
      default: return false;
    }
  };

  const isLastStep = step === steps.length - 1;

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#ff6b35]/10 to-[#f72585]/10 border-b border-white/10">
        <div className="flex items-center gap-4">
          {visit.restaurant_image ? (
            <img 
              src={visit.restaurant_image} 
              alt={visit.restaurant_name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f72585] flex items-center justify-center text-2xl">
              🍽️
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{visit.restaurant_name}</h2>
            <p className="text-white/50 text-sm">{visit.restaurant_cuisine || 'Restaurant'}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 pt-4">
        <div className="flex gap-1.5 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                i <= step 
                  ? 'bg-gradient-to-r from-[#ff6b35] to-[#f72585]' 
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-white/40 text-xs text-center">Step {step + 1} of {steps.length}</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-1">{steps[step].title}</h3>
        <p className="text-white/50 text-sm mb-6">{steps[step].subtitle}</p>

        {/* Step 0: Overall Rating */}
        {step === 0 && (
          <div className="text-center py-8">
            <StarRating rating={rating} setRating={setRating} size="lg" />
            <p className="mt-4 text-white/50">
              {rating === 0 && 'Tap to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent!'}
            </p>
          </div>
        )}

        {/* Step 1: Aspect Ratings */}
        {step === 1 && (
          <div className="space-y-4">
            {Object.entries(ASPECT_LABELS).map(([key, { label, icon }]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-white/80">{label}</span>
                </div>
                <StarRating 
                  rating={aspects[key]} 
                  setRating={(val) => setAspects(prev => ({ ...prev, [key]: val }))} 
                  size="sm" 
                />
              </div>
            ))}
            <p className="text-white/40 text-xs text-center">Optional - skip any you don't want to rate</p>
          </div>
        )}

        {/* Step 2: Would Return */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setWouldReturn(true)}
                className={`p-6 rounded-2xl transition-all ${
                  wouldReturn === true
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-[1.02]'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className="text-4xl mb-2">👍</div>
                <div className="font-semibold text-white">Yes!</div>
                <div className="text-white/50 text-sm">I'd go back</div>
              </button>
              <button
                type="button"
                onClick={() => setWouldReturn(false)}
                className={`p-6 rounded-2xl transition-all ${
                  wouldReturn === false
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-[1.02]'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className="text-4xl mb-2">👎</div>
                <div className="font-semibold text-white">Nope</div>
                <div className="text-white/50 text-sm">Once was enough</div>
              </button>
            </div>

            {/* Tags */}
            <div className="mt-6">
              <p className="text-white/70 text-sm mb-3">What describes this place? (optional)</p>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => handleTagToggle(tag.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedTags.includes(tag.value)
                        ? 'bg-gradient-to-r from-[#4cc9f0] to-[#7209b7] text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {tag.icon} {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Written Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">What dishes did you try?</label>
              <input
                type="text"
                value={dishes}
                onChange={(e) => setDishes(e.target.value)}
                placeholder="e.g., Pad Thai, Spring Rolls, Mango Sticky Rice"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/30 border border-white/10 focus:border-[#4cc9f0] focus:outline-none"
              />
              <p className="text-white/40 text-xs mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Share your thoughts (optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you love? Any tips for others?"
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/30 border border-white/10 focus:border-[#4cc9f0] focus:outline-none resize-none"
              />
              <p className="text-white/40 text-xs mt-1">{review.length}/1000</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 pt-0 flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(prev => prev - 1)}
            className="flex-1 py-3 px-6 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
          >
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-xl bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-all"
          >
            Later
          </button>
        )}
        
        <button
          type="button"
          onClick={isLastStep ? handleSubmit : () => setStep(prev => prev + 1)}
          disabled={!canProceed() || isSubmitting}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50 ${
            isLastStep
              ? 'bg-gradient-to-r from-[#4cc9f0] to-[#7209b7] text-white'
              : 'bg-gradient-to-r from-[#ff6b35] to-[#f72585] text-white'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            </span>
          ) : isLastStep ? (
            'Submit Feedback'
          ) : (
            'Next'
          )}
        </button>
      </div>
    </div>
  );
}

// Compact feedback prompt card
export function FeedbackPrompt({ visit, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#ff6b35]/10 to-[#f72585]/10 border border-[#ff6b35]/30 hover:border-[#ff6b35]/50 transition-all text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f72585] flex items-center justify-center text-xl flex-shrink-0">
          ⭐
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{visit.restaurant_name}</div>
          <div className="text-white/50 text-sm">Tap to leave feedback</div>
        </div>
        <div className="text-white/30 group-hover:text-white/60 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

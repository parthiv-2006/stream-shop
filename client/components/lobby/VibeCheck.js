'use client';

import { useState } from 'react';

const MEAL_OPTIONS = [
  { value: 'light', label: 'Light Snack', icon: '🥗', desc: 'Something small' },
  { value: 'moderate', label: 'Regular Meal', icon: '🍽️', desc: 'Normal portion' },
  { value: 'heavy', label: 'Feast Mode', icon: '🍖', desc: 'I\'m starving!' },
  { value: 'any', label: 'Whatever', icon: '🤷', desc: 'I\'m flexible' },
];

const BUDGET_OPTIONS = [
  { value: 'cheap', label: 'Budget', icon: '💵', desc: 'Under $15' },
  { value: 'moderate', label: 'Moderate', icon: '💳', desc: '$15-30' },
  { value: 'fancy', label: 'Treat Myself', icon: '💎', desc: '$30+' },
  { value: 'any', label: 'Flexible', icon: '💰', desc: 'Price isn\'t a factor' },
];

const MOOD_OPTIONS = [
  { value: 'adventurous', label: 'Adventurous', icon: '🌍', desc: 'Try something new' },
  { value: 'comfort', label: 'Comfort', icon: '🏠', desc: 'Something familiar' },
  { value: 'healthy', label: 'Healthy', icon: '🥬', desc: 'Keep it nutritious' },
  { value: 'indulgent', label: 'Indulgent', icon: '🍰', desc: 'Treat yourself' },
  { value: 'any', label: 'Open', icon: '✨', desc: 'Surprise me' },
];

const DISTANCE_OPTIONS = [
  { value: 'nearby', label: 'Nearby', icon: '📍', desc: 'Walking distance' },
  { value: 'moderate', label: 'Short Drive', icon: '🚗', desc: '10-15 mins' },
  { value: 'anywhere', label: 'Anywhere', icon: '🗺️', desc: 'Distance is no issue' },
];

export function VibeCheck({ onSubmit, isSubmitting, initialValues }) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    meal_type: initialValues?.meal_type || null,
    budget_today: initialValues?.budget_today || null,
    mood: initialValues?.mood || null,
    distance: initialValues?.distance || null,
  });

  const steps = [
    { key: 'meal_type', title: 'How hungry are you?', options: MEAL_OPTIONS },
    { key: 'budget_today', title: 'What\'s your budget today?', options: BUDGET_OPTIONS },
    { key: 'mood', title: 'What\'s the vibe?', options: MOOD_OPTIONS },
    { key: 'distance', title: 'How far are you willing to go?', options: DISTANCE_OPTIONS },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canProceed = selections[currentStep.key] !== null;

  const handleSelect = (value) => {
    setSelections(prev => ({ ...prev, [currentStep.key]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      onSubmit(selections);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff6b35]/20 to-[#f72585]/20 border border-[#ff6b35]/30 mb-4">
          <span className="text-lg">✨</span>
          <span className="text-sm font-medium text-white">Vibe Check</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
        <p className="text-white/50 text-sm">Step {step + 1} of {steps.length}</p>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              i <= step 
                ? 'bg-gradient-to-r from-[#ff6b35] to-[#f72585]' 
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {currentStep.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`p-4 rounded-2xl text-left transition-all duration-300 ${
              selections[currentStep.key] === option.value
                ? 'bg-gradient-to-br from-[#ff6b35] to-[#f72585] text-white scale-[1.02] shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-[1.01]'
            }`}
          >
            <div className="text-2xl mb-2">{option.icon}</div>
            <div className="font-semibold text-sm">{option.label}</div>
            <div className={`text-xs mt-0.5 ${
              selections[currentStep.key] === option.value ? 'text-white/80' : 'text-white/40'
            }`}>
              {option.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="flex-1 py-3 px-6 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/10"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
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
            "I'm Ready!"
          ) : (
            'Next'
          )}
        </button>
      </div>
    </div>
  );
}

// Compact display of completed vibe check
export function VibeCheckSummary({ vibeCheck }) {
  if (!vibeCheck) return null;

  const getLabel = (type, value) => {
    const options = {
      meal_type: MEAL_OPTIONS,
      budget_today: BUDGET_OPTIONS,
      mood: MOOD_OPTIONS,
      distance: DISTANCE_OPTIONS,
    };
    return options[type]?.find(o => o.value === value);
  };

  const items = [
    { key: 'meal_type', ...getLabel('meal_type', vibeCheck.meal_type) },
    { key: 'budget_today', ...getLabel('budget_today', vibeCheck.budget_today) },
    { key: 'mood', ...getLabel('mood', vibeCheck.mood) },
    { key: 'distance', ...getLabel('distance', vibeCheck.distance) },
  ].filter(item => item.value && item.value !== 'any');

  if (items.length === 0) {
    return (
      <div className="text-white/40 text-sm">Flexible on everything</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-white/70 text-xs"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}

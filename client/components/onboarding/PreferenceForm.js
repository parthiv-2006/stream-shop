'use client';

import { useState } from 'react';
import { SpiceSelector } from './SpiceSelector';
import { BudgetSelector } from './BudgetSelector';
import { AllergySelector } from './AllergySelector';
import toast from 'react-hot-toast';

export function PreferenceForm({ onSubmit }) {
  const [preferences, setPreferences] = useState({
    spice_level: 'medium',
    budget: 'any',
    allergies: [],
    vegetarian: false,
    disliked_cuisines: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonCuisines = [
    'Italian', 'Chinese', 'Japanese', 'Mexican', 'Thai',
    'Indian', 'American', 'Mediterranean', 'French', 'Korean',
    'Vietnamese', 'Greek', 'Spanish', 'Seafood', 'BBQ'
  ];

  const toggleCuisine = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      disliked_cuisines: prev.disliked_cuisines.includes(cuisine)
        ? prev.disliked_cuisines.filter(c => c !== cuisine)
        : [...prev.disliked_cuisines, cuisine]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!preferences.spice_level) {
      toast.error('Please select your spice tolerance');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(preferences);
      toast.success('Preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences. Please try again.');
      console.error('Preference save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Spice Level */}
      <SpiceSelector
        value={preferences.spice_level}
        onChange={(value) => setPreferences(prev => ({ ...prev, spice_level: value }))}
      />

      {/* Budget */}
      <BudgetSelector
        value={preferences.budget}
        onChange={(value) => setPreferences(prev => ({ ...prev, budget: value }))}
      />

      {/* Vegetarian Option */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Dietary Preference</label>
        <button
          type="button"
          onClick={() => setPreferences(prev => ({ ...prev, vegetarian: !prev.vegetarian }))}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
            preferences.vegetarian
              ? 'border-green-600 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <div className="font-medium text-gray-700">Vegetarian</div>
              <div className="text-xs text-gray-500">Prefer vegetarian options</div>
            </div>
            {preferences.vegetarian && (
              <span className="ml-auto text-green-600">✓</span>
            )}
          </div>
        </button>
      </div>

      {/* Allergies */}
      <AllergySelector
        value={preferences.allergies}
        onChange={(value) => setPreferences(prev => ({ ...prev, allergies: value }))}
      />

      {/* Disliked Cuisines */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Disliked Cuisines <span className="text-xs text-gray-500">(Optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {commonCuisines.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              onClick={() => toggleCuisine(cuisine)}
              className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                preferences.disliked_cuisines.includes(cuisine)
                  ? 'border-red-600 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}

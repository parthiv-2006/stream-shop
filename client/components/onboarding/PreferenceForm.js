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
    dietary_preferences: [], // Now supports multiple dietary preferences
    disliked_cuisines: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dietaryPreferences = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🌱', description: 'No meat or fish' },
    { id: 'vegan', label: 'Vegan', icon: '🌿', description: 'No animal products' },
    { id: 'pescatarian', label: 'Pescatarian', icon: '🐟', description: 'Fish but no meat' },
    { id: 'halal', label: 'Halal', icon: '☪️', description: 'Halal-certified foods' },
    { id: 'kosher', label: 'Kosher', icon: '✡️', description: 'Kosher-certified foods' },
    { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾', description: 'No gluten' },
    { id: 'lactose-free', label: 'Lactose-Free', icon: '🥛', description: 'No lactose' },
    { id: 'paleo', label: 'Paleo', icon: '🥩', description: 'Paleolithic diet' },
    { id: 'keto', label: 'Keto', icon: '🥑', description: 'Ketogenic diet' },
    { id: 'low-carb', label: 'Low-Carb', icon: '🥗', description: 'Low carbohydrate' },
    { id: 'low-sodium', label: 'Low-Sodium', icon: '🧂', description: 'Reduced salt' },
    { id: 'raw-food', label: 'Raw Food', icon: '🥕', description: 'Raw/uncooked foods' },
  ];

  const commonCuisines = [
    // Popular International
    'Italian', 'Chinese', 'Japanese', 'Mexican', 'Thai', 'Indian', 
    'American', 'Mediterranean', 'French', 'Korean', 'Vietnamese', 
    'Greek', 'Spanish', 'Turkish', 'Lebanese', 'Moroccan',
    // Regional Asian
    'Indonesian', 'Malaysian', 'Singaporean', 'Filipino', 'Cambodian',
    'Burmese', 'Sri Lankan', 'Bangladeshi', 'Pakistani', 'Nepalese',
    // Regional European
    'German', 'British', 'Irish', 'Russian', 'Polish', 'Czech',
    'Hungarian', 'Romanian', 'Portuguese', 'Swiss', 'Austrian',
    // Latin American
    'Brazilian', 'Peruvian', 'Argentine', 'Chilean', 'Colombian',
    'Cuban', 'Caribbean', 'Jamaican', 'Puerto Rican',
    // Middle Eastern & African
    'Iranian', 'Iraqi', 'Ethiopian', 'Egyptian', 'South African',
    'Nigerian', 'Senegalese',
    // Specialty
    'Seafood', 'BBQ', 'Steakhouse', 'Sushi', 'Ramen', 'Dim Sum',
    'Tapas', 'Fusion', 'Vegetarian', 'Vegan', 'Fast Food'
  ];

  const toggleCuisine = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      disliked_cuisines: prev.disliked_cuisines.includes(cuisine)
        ? prev.disliked_cuisines.filter(c => c !== cuisine)
        : [...prev.disliked_cuisines, cuisine]
    }));
  };

  const toggleDietaryPreference = (prefId) => {
    setPreferences(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(prefId)
        ? prev.dietary_preferences.filter(id => id !== prefId)
        : [...prev.dietary_preferences, prefId]
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

      {/* Dietary Preferences */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dietary Preferences <span className="text-xs text-gray-500">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {dietaryPreferences.map((pref) => (
            <button
              key={pref.id}
              type="button"
              onClick={() => toggleDietaryPreference(pref.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                preferences.dietary_preferences.includes(pref.id)
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{pref.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700 text-sm">{pref.label}</div>
                  <div className="text-xs text-gray-500 truncate">{pref.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
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

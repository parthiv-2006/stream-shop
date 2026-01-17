'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { userApi } from '@/lib/api/user';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Preference options
const SPICE_LEVELS = [
  { value: 'none', label: 'No Spice', icon: '🍚' },
  { value: 'low', label: 'Mild', icon: '🌶️' },
  { value: 'medium', label: 'Medium', icon: '🌶️🌶️' },
  { value: 'high', label: 'Hot', icon: '🌶️🌶️🌶️' },
];

const BUDGET_OPTIONS = [
  { value: 'low', label: 'Budget', icon: '$' },
  { value: 'medium', label: 'Moderate', icon: '$$' },
  { value: 'high', label: 'Splurge', icon: '$$$' },
  { value: 'any', label: 'Any', icon: '💰' },
];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'Halal', 'Kosher',
  'Gluten-Free', 'Lactose-Free', 'Keto', 'Paleo',
];

const ALLERGY_OPTIONS = [
  'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy',
  'Wheat/Gluten', 'Fish', 'Shellfish', 'Sesame',
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [editedPrefs, setEditedPrefs] = useState(null);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile,
    enabled: hasHydrated && isAuthenticated,
  });

  // Update preferences mutation
  const updatePrefsMutation = useMutation({
    mutationFn: userApi.updatePreferences,
    onSuccess: () => {
      toast.success('Preferences updated!');
      queryClient.invalidateQueries(['profile']);
      setIsEditingPrefs(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences');
    },
  });

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, hasHydrated, router]);

  useEffect(() => {
    if (profile?.preferences && !editedPrefs) {
      setEditedPrefs(profile.preferences);
    }
  }, [profile?.preferences, editedPrefs]);

  const handleSavePreferences = () => {
    updatePrefsMutation.mutate(editedPrefs);
  };

  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">Taste</span>Sync
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Hey, {profile?.username || user?.username}!</span>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <section className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/lobby/create')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">🍽️</div>
            <h2 className="text-xl font-bold mb-1">Create a Lobby</h2>
            <p className="text-blue-100 text-sm">Start a new group dining session</p>
          </button>
          
          <button
            onClick={() => router.push('/lobby/join')}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">🤝</div>
            <h2 className="text-xl font-bold mb-1">Join a Lobby</h2>
            <p className="text-green-100 text-sm">Enter a code to join friends</p>
          </button>
        </section>

        {/* Preferences Section */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Preferences</h2>
              <p className="text-sm text-gray-500">Help us find better matches for you</p>
            </div>
            {!isEditingPrefs ? (
              <button
                onClick={() => setIsEditingPrefs(true)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditingPrefs(false); setEditedPrefs(profile?.preferences); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  disabled={updatePrefsMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {updatePrefsMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {isEditingPrefs && editedPrefs ? (
            <div className="space-y-6">
              {/* Spice Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spice Tolerance</label>
                <div className="flex gap-2 flex-wrap">
                  {SPICE_LEVELS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setEditedPrefs({ ...editedPrefs, spice_level: option.value })}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        editedPrefs.spice_level === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.icon} {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <div className="flex gap-2 flex-wrap">
                  {BUDGET_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setEditedPrefs({ ...editedPrefs, budget: option.value })}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        editedPrefs.budget === option.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.icon} {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                <div className="flex gap-2 flex-wrap">
                  {DIETARY_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => setEditedPrefs({
                        ...editedPrefs,
                        dietary_preferences: toggleArrayItem(editedPrefs.dietary_preferences || [], option)
                      })}
                      className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                        (editedPrefs.dietary_preferences || []).includes(option)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                <div className="flex gap-2 flex-wrap">
                  {ALLERGY_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => setEditedPrefs({
                        ...editedPrefs,
                        allergies: toggleArrayItem(editedPrefs.allergies || [], option)
                      })}
                      className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                        (editedPrefs.allergies || []).includes(option)
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Spice Level</div>
                <div className="font-medium text-gray-900">
                  {SPICE_LEVELS.find(s => s.value === profile?.preferences?.spice_level)?.label || 'Medium'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Budget</div>
                <div className="font-medium text-gray-900">
                  {BUDGET_OPTIONS.find(b => b.value === profile?.preferences?.budget)?.label || 'Any'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Dietary</div>
                <div className="font-medium text-gray-900">
                  {(profile?.preferences?.dietary_preferences || []).length > 0
                    ? profile.preferences.dietary_preferences.slice(0, 2).join(', ') + 
                      (profile.preferences.dietary_preferences.length > 2 ? '...' : '')
                    : 'None set'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Allergies</div>
                <div className="font-medium text-gray-900">
                  {(profile?.preferences?.allergies || []).length > 0
                    ? profile.preferences.allergies.slice(0, 2).join(', ') +
                      (profile.preferences.allergies.length > 2 ? '...' : '')
                    : 'None set'}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Visit History */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Visits</h2>
              <p className="text-sm text-gray-500">Places you&apos;ve been to with your groups</p>
            </div>
            {(profile?.totalVisits || 0) > 0 && (
              <span className="text-sm text-gray-500">{profile.totalVisits} total visits</span>
            )}
          </div>

          {(profile?.visits || []).length > 0 ? (
            <div className="space-y-4">
              {profile.visits.map((visit) => (
                <div 
                  key={visit.id} 
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                    🍜
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{visit.restaurant_name}</h3>
                        <p className="text-sm text-gray-500">{visit.restaurant_cuisine}</p>
                      </div>
                      {visit.rating && (
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                          <span className="text-yellow-600">⭐</span>
                          <span className="text-sm font-medium text-yellow-700">{visit.rating}/5</span>
                        </div>
                      )}
                    </div>
                    {visit.review && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{visit.review}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(visit.visited_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="text-gray-500">No visits yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete a group dining session to see your history here
              </p>
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{profile?.totalVisits || 0}</div>
            <div className="text-sm text-gray-500">Restaurants Visited</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {profile?.visits?.filter(v => v.rating >= 4).length || 0}
            </div>
            <div className="text-sm text-gray-500">Favorites (4+ stars)</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {(profile?.preferences?.dietary_preferences || []).length}
            </div>
            <div className="text-sm text-gray-500">Dietary Preferences</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {new Set(profile?.visits?.map(v => v.restaurant_cuisine)).size || 0}
            </div>
            <div className="text-sm text-gray-500">Cuisines Explored</div>
          </div>
        </section>
      </main>
    </div>
  );
}

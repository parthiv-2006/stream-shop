'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SwipeStack } from '@/components/matching/SwipeStack';
import { useAuth } from '@/lib/hooks/useAuth';
import { lobbyApi } from '@/lib/api/lobby';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function MatchingPage() {
  const params = useParams();
  const router = useRouter();
  const lobbyId = params.lobbyId;
  const { isAuthenticated, hasHydrated } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [swipeProgress, setSwipeProgress] = useState(null);
  const [userDone, setUserDone] = useState(false);

  // Fetch lobby status to check if we should redirect
  const { data: lobbyData } = useQuery({
    queryKey: ['lobby', lobbyId],
    queryFn: () => lobbyApi.get(lobbyId),
    enabled: !!lobbyId && hasHydrated && isAuthenticated,
    refetchInterval: 3000,
  });

  // Redirect to voting if status changed
  useEffect(() => {
    if (lobbyData?.status === 'voting') {
      toast.success('Everyone is done! Moving to voting...');
      router.push(`/voting/${lobbyId}`);
    }
  }, [lobbyData?.status, lobbyId, router]);

  // Fetch restaurants
  const { data: restaurantsData, isLoading: isLoadingRestaurants, refetch: refetchRestaurants } = useQuery({
    queryKey: ['restaurants', lobbyId],
    queryFn: async () => {
      return lobbyApi.getRestaurants(lobbyId);
    },
    enabled: !!lobbyId && hasHydrated && isAuthenticated && !userDone,
    refetchInterval: false, // Don't refetch automatically
  });

  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async ({ restaurantId, direction }) => {
      return lobbyApi.swipe(lobbyId, restaurantId, direction);
    },
    onSuccess: (data) => {
      // Update progress
      if (data.progress) {
        setSwipeProgress(data.progress);
        
        // Check if user is done
        if (data.progress.userDone) {
          setUserDone(true);
          if (data.progress.allDone) {
            toast.success('Everyone is done! Moving to voting...');
            router.push(`/voting/${lobbyId}`);
          } else {
            toast.success('You\'re done! Waiting for others...', {
              icon: '⏳',
            });
          }
        }
      }

      // If transitioned to voting, redirect
      if (data.transitionedToVoting) {
        toast.success('Everyone is done! Moving to voting...');
        router.push(`/voting/${lobbyId}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record swipe');
    },
  });

  useEffect(() => {
    if (restaurantsData?.restaurants) {
      setRestaurants(restaurantsData.restaurants);
      // Set initial progress
      if (restaurantsData.totalRestaurants) {
        setSwipeProgress({
          userSwipeCount: restaurantsData.swipedCount || 0,
          totalRestaurants: restaurantsData.totalRestaurants,
          remainingCount: restaurantsData.remainingCount || restaurantsData.restaurants.length,
        });
      }
    }
  }, [restaurantsData]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, hasHydrated, router]);

  const handleSwipe = async (restaurantId, direction) => {
    try {
      await swipeMutation.mutateAsync({ restaurantId, direction });
      
      // Remove swiped restaurant from local state
      setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      
      // Track event
      if (typeof window !== 'undefined') {
        console.log('Swipe event:', { restaurantId, direction, lobbyId });
      }
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const handleEmpty = () => {
    // The SwipeStack is empty - the server will confirm when user is truly done
    // Don't set userDone here - wait for server confirmation via swipe mutation
    console.log('SwipeStack empty, waiting for server confirmation...');
  };

  if (!hasHydrated || (!isAuthenticated && hasHydrated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoadingRestaurants && !userDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  // User is done swiping, waiting for others
  if (userDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">You&apos;re Done!</h1>
            <p className="text-gray-600 mb-6">
              Waiting for other participants to finish swiping...
            </p>
            
            {swipeProgress && (
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  You swiped {swipeProgress.userSwipeCount || swipeProgress.totalRestaurants} of {swipeProgress.totalRestaurants} restaurants
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-sm text-gray-500">Checking for updates...</span>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show processing state when stack is empty but waiting for server confirmation
  const isProcessingLastSwipe = restaurants.length === 0 && !userDone && swipeMutation.isPending;
  const isWaitingForConfirmation = restaurants.length === 0 && !userDone && !swipeMutation.isPending;

  // If stack is empty but server hasn't confirmed done yet, show loading
  if (isProcessingLastSwipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Recording your last swipe...</p>
        </div>
      </div>
    );
  }

  // If stack is empty and mutation done, but userDone not set - wait for polling
  if (isWaitingForConfirmation && swipeProgress?.userSwipeCount >= swipeProgress?.totalRestaurants) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finishing up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Match</h1>
          <p className="text-gray-600">Swipe right on restaurants you like, left to pass</p>
          
          {/* Progress indicator */}
          {swipeProgress && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm">
              <span>📊</span>
              <span>
                {swipeProgress.userSwipeCount || 0} of {swipeProgress.totalRestaurants} swiped
              </span>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            Use arrow keys, or click the buttons below
          </p>
        </div>

        <SwipeStack
          restaurants={restaurants}
          onSwipe={handleSwipe}
          onEmpty={handleEmpty}
        />

        {/* Keyboard shortcuts hint */}
        <div className="mt-24 text-center">
          <div className="inline-flex gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">←</kbd>
              <span>or</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">A</kbd>
              <span>Pass</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">→</kbd>
              <span>or</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">D</kbd>
              <span>Like</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Space</kbd>
              <span>Like</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

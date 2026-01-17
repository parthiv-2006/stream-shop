'use client';

import { SwipeCard } from './SwipeCard';
import { useState, useEffect } from 'react';

export function SwipeStack({ restaurants, onSwipe, onEmpty }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedRestaurants, setSwipedRestaurants] = useState(new Set());

  useEffect(() => {
    setCurrentIndex(0);
    setSwipedRestaurants(new Set());
  }, [restaurants]);

  const handleSwipe = (restaurantId, direction) => {
    if (swipedRestaurants.has(restaurantId)) return;

    setSwipedRestaurants(prev => new Set([...prev, restaurantId]));
    onSwipe(restaurantId, direction);

    setTimeout(() => {
      if (currentIndex + 1 >= restaurants.length) {
        if (onEmpty) onEmpty();
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (currentIndex >= restaurants.length) return;

      const currentRestaurant = restaurants[currentIndex];
      if (!currentRestaurant) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleSwipe(currentRestaurant.id, 'left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleSwipe(currentRestaurant.id, 'right');
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleSwipe(currentRestaurant.id, 'right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, restaurants]);

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="text-center glass-card rounded-3xl p-12">
          <div className="text-6xl mb-4 animate-float">🍽️</div>
          <p className="text-xl text-white/70 mb-2">No more restaurants</p>
          <p className="text-white/40">Waiting for more options...</p>
        </div>
      </div>
    );
  }

  const visibleCards = restaurants.slice(currentIndex, currentIndex + 3);
  const remainingCount = restaurants.length - currentIndex;

  return (
    <div className="relative w-full max-w-sm mx-auto h-[500px]">
      {/* Card Stack */}
      {visibleCards.map((restaurant, idx) => (
        <SwipeCard
          key={restaurant.id}
          restaurant={restaurant}
          onSwipe={handleSwipe}
          index={idx}
          isTop={idx === 0}
        />
      ))}

      {/* Progress Dots */}
      <div className="absolute -bottom-4 left-0 right-0">
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: Math.min(remainingCount, 5) }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === 0 
                  ? 'w-8 bg-gradient-to-r from-[#ff6b35] to-[#f72585]' 
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
          {remainingCount > 5 && (
            <span className="text-xs text-white/40 ml-2">+{remainingCount - 5}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute -bottom-24 left-0 right-0 flex justify-center gap-6">
        <button
          onClick={() => {
            const currentRestaurant = restaurants[currentIndex];
            if (currentRestaurant) handleSwipe(currentRestaurant.id, 'left');
          }}
          className="group w-16 h-16 rounded-full bg-white/10 border-2 border-red-500/50 text-red-400 flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-300"
          aria-label="Pass"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={() => {
            const currentRestaurant = restaurants[currentIndex];
            if (currentRestaurant) handleSwipe(currentRestaurant.id, 'right');
          }}
          className="group w-16 h-16 rounded-full bg-white/10 border-2 border-green-500/50 text-green-400 flex items-center justify-center shadow-lg hover:bg-green-500 hover:text-white hover:scale-110 transition-all duration-300"
          aria-label="Like"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

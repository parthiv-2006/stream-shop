'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export function SwipeCard({ restaurant, onSwipe, index, isTop }) {
  const [dragDirection, setDragDirection] = useState(null);

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100;
    const velocityThreshold = 500;

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(restaurant.id, direction);
    } else {
      setDragDirection(null);
    }
  };

  const handleDrag = (event, info) => {
    if (Math.abs(info.offset.x) > 50) {
      setDragDirection(info.offset.x > 0 ? 'right' : 'left');
    } else {
      setDragDirection(null);
    }
  };

  const rotation = dragDirection === 'right' ? 12 : dragDirection === 'left' ? -12 : 0;

  return (
    <motion.div
      className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        zIndex: 10 - index,
        opacity: isTop ? 1 : Math.max(0.3, 0.8 - index * 0.15),
        transformOrigin: 'center bottom',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{
        rotate: rotation,
        scale: isTop ? 1 : 0.95 - index * 0.03,
        y: index * 8,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 35,
      }}
    >
      {/* Main Card */}
      <div className="relative h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-3xl overflow-hidden">
        {/* Swipe Overlays */}
        {dragDirection && (
          <motion.div
            className={`absolute inset-0 flex items-center justify-center z-20 ${
              dragDirection === 'right' 
                ? 'bg-gradient-to-r from-green-500/30 to-transparent' 
                : 'bg-gradient-to-l from-red-500/30 to-transparent'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={`text-8xl ${dragDirection === 'right' ? 'text-green-400' : 'text-red-400'}`}>
              {dragDirection === 'right' ? '💚' : '❌'}
            </div>
          </motion.div>
        )}

        {/* Image Area */}
        <div className="relative h-56 bg-gradient-to-br from-[#ff6b35]/20 to-[#f72585]/20">
          {restaurant.image ? (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-7xl opacity-50">🍽️</div>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent"></div>
          
          {/* Price Badge */}
          {restaurant.price_range && (
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold">
              {restaurant.price_range}
            </div>
          )}

          {/* Rating Badge */}
          {restaurant.rating && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ffd60a]/20 to-[#ff6b35]/20 backdrop-blur-md border border-[#ffd60a]/30 flex items-center gap-1.5">
              <span className="text-[#ffd60a]">⭐</span>
              <span className="text-white font-bold">{restaurant.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-2xl font-bold text-white mb-1 truncate">{restaurant.name}</h3>
            <p className="text-lg font-medium bg-gradient-to-r from-[#ff6b35] to-[#f72585] bg-clip-text text-transparent">
              {restaurant.cuisine}
            </p>
          </div>

          {restaurant.description && (
            <p className="text-white/50 text-sm mb-4 line-clamp-2">{restaurant.description}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.dietary_options?.slice(0, 3).map((option, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-[#4cc9f0]/20 text-[#4cc9f0] text-xs font-medium border border-[#4cc9f0]/30"
              >
                {option}
              </span>
            ))}
            {restaurant.spice_level && (
              <span className="px-2.5 py-1 rounded-full bg-[#ff6b35]/20 text-[#ff6b35] text-xs font-medium border border-[#ff6b35]/30">
                {restaurant.spice_level} spice
              </span>
            )}
          </div>

          {/* Location */}
          {restaurant.location?.address && (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <svg className="w-4 h-4 text-[#f72585]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{restaurant.location.address}</span>
            </div>
          )}
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1a1a2e] to-transparent pointer-events-none"></div>
      </div>
    </motion.div>
  );
}

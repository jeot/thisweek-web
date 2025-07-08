import { useEffect } from 'react';

type SwipeDirection = 'left' | 'right';

interface UseSwipeOptions {
  onSwipe: (direction: SwipeDirection) => void;
  threshold?: number; // in pixels
}

export function useSwipe(
  ref: React.RefObject<HTMLElement>,
  { onSwipe, threshold = 50 }: UseSwipeOptions
) {
  useEffect(() => {
    if (!ref.current) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const deltaX = touchEndX - touchStartX;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipe('right');
        } else {
          onSwipe('left');
        }
      }
    };

    const el = ref.current;
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipe, threshold]);
}


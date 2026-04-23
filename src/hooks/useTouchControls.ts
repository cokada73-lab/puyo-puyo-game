'use client';

import { Dispatch, RefObject, useEffect } from 'react';
import { GameAction } from '@/lib/puyo/types';

const SWIPE_THRESHOLD = 30;
const DOUBLE_TAP_MS = 300;

export function useTouchControls(
  ref: RefObject<HTMLElement | null>,
  dispatch: Dispatch<GameAction>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let lastTapTime = 0;
    let moveInterval: ReturnType<typeof setInterval> | null = null;

    const clearMoveInterval = () => {
      if (moveInterval !== null) {
        clearInterval(moveInterval);
        moveInterval = null;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        const action = dx > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT';
        dispatch({ type: action });
        startX = touch.clientX;
      } else if (dy > SWIPE_THRESHOLD) {
        dispatch({ type: 'SOFT_DROP' });
        startY = touch.clientY;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      clearMoveInterval();
      const touch = e.changedTouches[0];
      const dx = Math.abs(touch.clientX - startX);
      const dy = Math.abs(touch.clientY - startY);

      if (dx < 10 && dy < 10) {
        const now = Date.now();
        if (now - lastTapTime < DOUBLE_TAP_MS) {
          dispatch({ type: 'HARD_DROP' });
          lastTapTime = 0;
          return;
        }
        lastTapTime = now;

        // Tap side: left half = rotate left, right half = rotate right
        const rect = el.getBoundingClientRect();
        const relX = touch.clientX - rect.left;
        if (relX < rect.width / 2) {
          dispatch({ type: 'ROTATE_LEFT' });
        } else {
          dispatch({ type: 'ROTATE_RIGHT' });
        }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      clearMoveInterval();
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref, dispatch]);
}

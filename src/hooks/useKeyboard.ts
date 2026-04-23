'use client';

import { Dispatch, useEffect, useRef } from 'react';
import { GameAction, GamePhase } from '@/lib/puyo/types';

const DAS_DELAY = 167;
const ARR_RATE = 33;

const KEY_MAP: Record<string, GameAction['type']> = {
  ArrowLeft: 'MOVE_LEFT',
  ArrowRight: 'MOVE_RIGHT',
  ArrowDown: 'SOFT_DROP',
  KeyZ: 'ROTATE_RIGHT',
  KeyX: 'ROTATE_RIGHT',
  KeyA: 'ROTATE_LEFT',
  Space: 'HARD_DROP',
  KeyP: 'PAUSE_TOGGLE',
};

const REPEATABLE = new Set<GameAction['type']>(['MOVE_LEFT', 'MOVE_RIGHT', 'SOFT_DROP']);

export function useKeyboard(dispatch: Dispatch<GameAction>, phase: GamePhase) {
  const heldRef = useRef<Map<GameAction['type'], { dasTimer: number; arrTimer: number }>>(new Map());
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;

    const loop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      for (const [actionType, timers] of heldRef.current.entries()) {
        if (!REPEATABLE.has(actionType)) continue;

        if (timers.dasTimer > 0) {
          timers.dasTimer -= delta;
          if (timers.dasTimer <= 0) {
            dispatch({ type: actionType } as GameAction);
          }
        } else {
          timers.arrTimer -= delta;
          if (timers.arrTimer <= 0) {
            timers.arrTimer += ARR_RATE;
            dispatch({ type: actionType } as GameAction);
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const onKeyDown = (e: KeyboardEvent) => {
      const actionType = KEY_MAP[e.code];
      if (!actionType) return;
      e.preventDefault();

      if (heldRef.current.has(actionType)) return; // already held

      dispatch({ type: actionType } as GameAction);

      if (REPEATABLE.has(actionType)) {
        heldRef.current.set(actionType, { dasTimer: DAS_DELAY, arrTimer: ARR_RATE });
      } else {
        // non-repeatable: mark as held to prevent re-fire until key up
        heldRef.current.set(actionType, { dasTimer: -1, arrTimer: -1 });
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const actionType = KEY_MAP[e.code];
      if (!actionType) return;
      heldRef.current.delete(actionType);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [dispatch]);
}

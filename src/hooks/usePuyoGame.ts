'use client';

import { useEffect, useRef } from 'react';
import { useGameDispatch, useGameState } from '@/context/GameContext';
import { puyoAudio } from '@/lib/puyo/audio';
import { useKeyboard } from './useKeyboard';
import { useTouchControls } from './useTouchControls';

export function usePuyoGame(boardRef: React.RefObject<HTMLElement | null>) {
  const state = useGameState();
  const dispatch = useGameDispatch();
  const prevPhaseRef = useRef(state.phase);
  const prevMutedRef = useRef(state.isMuted);

  // rAF game loop
  useEffect(() => {
    if (state.phase === 'PAUSED' || state.phase === 'GAME_OVER' || state.phase === 'WAITING') return;

    let lastTime = performance.now();
    let rafId: number;

    const loop = (now: number) => {
      dispatch({ type: 'TICK', deltaMs: now - lastTime });
      lastTime = now;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [state.phase, dispatch]);

  // Audio side effects on phase transitions
  useEffect(() => {
    const prev = prevPhaseRef.current;
    const curr = state.phase;
    prevPhaseRef.current = curr;

    if (curr === 'POPPING') {
      puyoAudio.playSfx('pop');
      if (state.chainCount >= 2) {
        puyoAudio.playSfx('chain', state.chainCount);
      }
    }
    if (prev === 'FALLING' && curr === 'LOCKING') {
      puyoAudio.playSfx('land');
    }
    if (curr === 'GAME_OVER') {
      puyoAudio.stopBgm();
      puyoAudio.playSfx('gameover');
    }
    if ((prev === 'GAME_OVER' || prev === 'WAITING') && curr === 'SPAWN') {
      if (!state.isMuted) puyoAudio.playBgm();
    }
  }, [state.phase, state.chainCount, state.isMuted]);

  // Mute toggle side effect
  useEffect(() => {
    if (prevMutedRef.current === state.isMuted) return;
    prevMutedRef.current = state.isMuted;
    puyoAudio.setMuted(state.isMuted);
  }, [state.isMuted]);

  useKeyboard(dispatch, state.phase);
  useTouchControls(boardRef, dispatch);
}

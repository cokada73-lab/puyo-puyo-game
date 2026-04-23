'use client';

import { useGameDispatch, useGameState } from '@/context/GameContext';
import styles from './MuteButton.module.css';

export function MuteButton() {
  const { isMuted } = useGameState();
  const dispatch = useGameDispatch();

  return (
    <button
      className={`${styles.btn} ${isMuted ? styles.muted : ''}`}
      onClick={() => dispatch({ type: 'MUTE_TOGGLE' })}
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? '🔇' : '🔊'}
    </button>
  );
}

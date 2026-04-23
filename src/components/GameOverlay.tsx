'use client';

import { useGameDispatch, useGameState } from '@/context/GameContext';
import styles from './GameOverlay.module.css';

export function GameOverlay() {
  const { phase, score, hiScore, maxChain } = useGameState();
  const dispatch = useGameDispatch();

  if (phase !== 'GAME_OVER' && phase !== 'PAUSED') return null;

  const isGameOver = phase === 'GAME_OVER';

  return (
    <div className={styles.overlay}>
      <h2 className={styles.title}>{isGameOver ? 'Game Over' : 'Paused'}</h2>
      {isGameOver && (
        <>
          <div className={styles.scoreRow}>
            <span className={styles.scoreLabel}>Score</span>
            <span className={styles.scoreValue}>{score.toLocaleString()}</span>
          </div>
          <div className={styles.scoreRow}>
            <span className={styles.scoreLabel}>Best</span>
            <span className={styles.scoreValue}>{hiScore.toLocaleString()}</span>
          </div>
          <div className={styles.scoreRow}>
            <span className={styles.scoreLabel}>最大連鎖</span>
            <span className={styles.scoreValue}>{maxChain}</span>
          </div>
        </>
      )}
      <button
        className={styles.button}
        onClick={() => dispatch({ type: isGameOver ? 'RESTART' : 'PAUSE_TOGGLE' })}
      >
        {isGameOver ? 'Play Again' : 'Resume'}
      </button>
    </div>
  );
}

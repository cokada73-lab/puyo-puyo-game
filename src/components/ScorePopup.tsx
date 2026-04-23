'use client';

import { useGameDispatch, useGameState } from '@/context/GameContext';
import { COLS, VISIBLE_ROWS } from '@/lib/puyo/types';
import styles from './ScorePopup.module.css';

export function ScorePopup() {
  const { scorePopups } = useGameState();
  const dispatch = useGameDispatch();

  if (scorePopups.length === 0) return null;

  return (
    <div className={styles.container}>
      {scorePopups.map((p) => {
        const x = ((p.col + 0.5) / COLS) * 100;
        const y = ((p.row - 1) / VISIBLE_ROWS) * 100;
        return (
          <span
            key={p.id}
            className={styles.popup}
            style={{ left: `${x}%`, top: `${y}%` }}
            onAnimationEnd={() => dispatch({ type: 'DISMISS_POPUP', id: p.id })}
          >
            +{p.value.toLocaleString()}
          </span>
        );
      })}
    </div>
  );
}

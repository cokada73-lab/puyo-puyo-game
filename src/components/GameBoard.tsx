'use client';

import { useRef } from 'react';
import { useGameState } from '@/context/GameContext';
import { computeNeighborMasks, idx } from '@/lib/puyo/board';
import { getChildPosition } from '@/lib/puyo/pair';
import { COLS, VISIBLE_ROWS, PuyoColor } from '@/lib/puyo/types';
import { usePuyoGame } from '@/hooks/usePuyoGame';
import { PuyoCell } from './PuyoCell';
import styles from './GameBoard.module.css';

export function GameBoard() {
  const state = useGameState();
  const boardRef = useRef<HTMLDivElement>(null);
  usePuyoGame(boardRef);

  const neighborMasks = computeNeighborMasks(state.board);

  // Build a board overlay that includes the falling pair for neighbor mask calculation
  const displayBoard = state.board.slice();
  if (state.falling) {
    const { col, row, axisColor } = state.falling;
    displayBoard[idx(row, col)] = axisColor;
    const child = getChildPosition(state.falling);
    if (child.row >= 0 && child.row < 13 && child.col >= 0 && child.col < COLS) {
      displayBoard[idx(child.row, child.col)] = state.falling.childColor;
    }
  }
  const displayMasks = computeNeighborMasks(displayBoard);

  const cls = [
    styles.wrapper,
    state.shakeActive ? styles.shake : '',
    state.shakeActive ? styles.flash : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} ref={boardRef}>
      <div className={styles.grid}>
        {Array.from({ length: VISIBLE_ROWS }, (_, ri) => {
          const row = ri + 1; // skip hidden row 0
          return Array.from({ length: COLS }, (_, col) => {
            const i = idx(row, col);
            const color = displayBoard[i] as PuyoColor;
            const mask = displayMasks[i];
            const isPopping = state.poppingCells.has(i);
            return (
              <PuyoCell
                key={`${row}-${col}`}
                color={color}
                neighborMask={mask}
                isPopping={isPopping}
              />
            );
          });
        })}
      </div>
    </div>
  );
}

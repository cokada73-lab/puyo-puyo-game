'use client';

import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import { applyGravity, createBoard, getCell } from '@/lib/puyo/board';
import { findGroups, getPoppingIndices, popGroups } from '@/lib/puyo/chain';
import { placePair, canPlace, createSpawnPair, movePair, rotatePair, hardDropRow } from '@/lib/puyo/pair';
import { calcChainScore, fallIntervalMs, levelFromScore } from '@/lib/puyo/score';
import { getHiScore, saveHiScore } from '@/lib/puyo/storage';
import { fillQueue, generatePair } from '@/lib/puyo/queue';
import { GameAction, GameState } from '@/lib/puyo/types';

const LOCK_DELAY = 150;
const POPPING_DURATION = 500;
const GRAVITY_DURATION = 300;

function createInitialState(): GameState {
  const queue = fillQueue([]);
  return {
    board: createBoard(),
    falling: null,
    queue,
    phase: 'WAITING',
    prevPhase: null,
    score: 0,
    hiScore: getHiScore(),
    level: 1,
    chainCount: 0,
    maxChain: 0,
    poppingCells: new Set(),
    phaseTimer: 0,
    fallTimer: 0,
    lockTimer: 0,
    scorePopups: [],
    isMuted: false,
    shakeActive: false,
    popupIdCounter: 0,
  };
}

function spawnPhase(state: GameState): GameState {
  const [nextPair, ...restQueue] = state.queue;
  const queue = fillQueue(restQueue);
  const falling = createSpawnPair(nextPair.axisColor, nextPair.childColor);

  // Game over: spawn position is blocked
  if (!canPlace(state.board, falling)) {
    const hiScore = Math.max(state.score, state.hiScore);
    if (hiScore > state.hiScore) saveHiScore(hiScore);
    return { ...state, phase: 'GAME_OVER', hiScore, falling: null, queue };
  }

  return {
    ...state,
    falling,
    queue,
    phase: 'FALLING',
    fallTimer: fallIntervalMs(state.level),
    lockTimer: 0,
  };
}

function chainCheckPhase(state: GameState): GameState {
  const groups = findGroups(state.board);
  if (groups.length === 0) {
    return { ...state, phase: 'SPAWN', chainCount: 0 };
  }

  const chainCount = state.chainCount + 1;
  const maxChain = Math.max(state.maxChain, chainCount);
  const scoreGained = calcChainScore(chainCount, groups);
  const newScore = state.score + scoreGained;
  const hiScore = Math.max(newScore, state.hiScore);
  const level = levelFromScore(newScore);
  const poppingCells = getPoppingIndices(groups);

  // pick center of first group for popup position
  const firstCell = groups[0].cells[0];
  const popup = {
    id: state.popupIdCounter,
    value: scoreGained,
    col: firstCell.col,
    row: firstCell.row,
  };

  return {
    ...state,
    chainCount,
    maxChain,
    score: newScore,
    hiScore,
    level,
    poppingCells,
    phase: 'POPPING',
    phaseTimer: POPPING_DURATION,
    shakeActive: chainCount >= 2,
    scorePopups: [...state.scorePopups, popup],
    popupIdCounter: state.popupIdCounter + 1,
  };
}

function tickFalling(state: GameState, deltaMs: number): GameState {
  if (!state.falling) return { ...state, phase: 'SPAWN' };

  const interval = fallIntervalMs(state.level);
  const newFallTimer = state.fallTimer - deltaMs;

  if (newFallTimer > 0) {
    return { ...state, fallTimer: newFallTimer };
  }

  // Try to move down
  const movedDown = { ...state.falling, row: state.falling.row + 1 };
  if (canPlace(state.board, movedDown)) {
    return { ...state, falling: movedDown, fallTimer: interval + newFallTimer };
  }

  // Can't move down — start lock delay
  return { ...state, phase: 'LOCKING', lockTimer: LOCK_DELAY, fallTimer: interval };
}

function tickLocking(state: GameState, deltaMs: number): GameState {
  if (!state.falling) return { ...state, phase: 'SPAWN' };

  const newLockTimer = state.lockTimer - deltaMs;

  // If piece can fall again, cancel lock
  const movedDown = { ...state.falling, row: state.falling.row + 1 };
  if (canPlace(state.board, movedDown)) {
    return { ...state, phase: 'FALLING', lockTimer: 0 };
  }

  if (newLockTimer > 0) {
    return { ...state, lockTimer: newLockTimer };
  }

  // Lock the piece
  const placedBoard = placePair(state.board, state.falling);
  const gravityBoard = applyGravity(placedBoard);

  return {
    ...state,
    board: gravityBoard,
    falling: null,
    phase: 'CHAIN_CHECK',
    lockTimer: 0,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK': {
      const { deltaMs } = action;
      switch (state.phase) {
        case 'WAITING':
          return state;
        case 'SPAWN':
          return spawnPhase(state);
        case 'FALLING':
          return tickFalling(state, deltaMs);
        case 'LOCKING':
          return tickLocking(state, deltaMs);
        case 'CHAIN_CHECK':
          return chainCheckPhase(state);
        case 'POPPING': {
          const remaining = state.phaseTimer - deltaMs;
          if (remaining > 0) return { ...state, phaseTimer: remaining };
          const poppedBoard = popGroups(state.board, findGroups(state.board));
          const gravityBoard = applyGravity(poppedBoard);
          return {
            ...state,
            board: gravityBoard,
            poppingCells: new Set(),
            phase: 'GRAVITY',
            phaseTimer: GRAVITY_DURATION,
          };
        }
        case 'GRAVITY': {
          const remaining = state.phaseTimer - deltaMs;
          if (remaining > 0) return { ...state, phaseTimer: remaining };
          return { ...state, phase: 'CHAIN_CHECK', phaseTimer: 0, shakeActive: false };
        }
        default:
          return state;
      }
    }

    case 'MOVE_LEFT': {
      if (state.phase !== 'FALLING' && state.phase !== 'LOCKING') return state;
      if (!state.falling) return state;
      const moved = movePair(state.board, state.falling, -1);
      return { ...state, falling: moved, phase: moved !== state.falling ? 'FALLING' : state.phase };
    }

    case 'MOVE_RIGHT': {
      if (state.phase !== 'FALLING' && state.phase !== 'LOCKING') return state;
      if (!state.falling) return state;
      const moved = movePair(state.board, state.falling, 1);
      return { ...state, falling: moved, phase: moved !== state.falling ? 'FALLING' : state.phase };
    }

    case 'ROTATE_RIGHT': {
      if (state.phase !== 'FALLING' && state.phase !== 'LOCKING') return state;
      if (!state.falling) return state;
      return { ...state, falling: rotatePair(state.board, state.falling, 1), phase: 'FALLING' };
    }

    case 'ROTATE_LEFT': {
      if (state.phase !== 'FALLING' && state.phase !== 'LOCKING') return state;
      if (!state.falling) return state;
      return { ...state, falling: rotatePair(state.board, state.falling, -1), phase: 'FALLING' };
    }

    case 'SOFT_DROP': {
      if (state.phase !== 'FALLING' && state.phase !== 'LOCKING') return state;
      if (!state.falling) return state;
      const movedDown = { ...state.falling, row: state.falling.row + 1 };
      if (canPlace(state.board, movedDown)) {
        return { ...state, falling: movedDown, fallTimer: fallIntervalMs(state.level), phase: 'FALLING' };
      }
      return { ...state, phase: 'LOCKING', lockTimer: LOCK_DELAY };
    }

    case 'HARD_DROP': {
      if (state.phase !== 'FALLING' && state.phase !== 'LOCKING') return state;
      if (!state.falling) return state;
      const targetRow = hardDropRow(state.board, state.falling);
      const droppedPair = { ...state.falling, row: targetRow };
      const placedBoard = placePair(state.board, droppedPair);
      const gravityBoard = applyGravity(placedBoard);
      return {
        ...state,
        board: gravityBoard,
        falling: null,
        phase: 'CHAIN_CHECK',
      };
    }

    case 'START':
      return { ...createInitialState(), phase: 'SPAWN', isMuted: state.isMuted };

    case 'PAUSE_TOGGLE': {
      if (state.phase === 'GAME_OVER') return state;
      if (state.phase === 'PAUSED') {
        return { ...state, phase: state.prevPhase ?? 'FALLING', prevPhase: null };
      }
      return { ...state, prevPhase: state.phase, phase: 'PAUSED' };
    }

    case 'RESTART':
      return { ...createInitialState(), isMuted: state.isMuted };

    case 'MUTE_TOGGLE':
      return { ...state, isMuted: !state.isMuted };

    case 'DISMISS_POPUP':
      return { ...state, scorePopups: state.scorePopups.filter((p) => p.id !== action.id) };

    case 'SHAKE_DONE':
      return { ...state, shakeActive: false };

    default:
      return state;
  }
}

const GameStateContext = createContext<GameState | null>(null);
const GameDispatchContext = createContext<Dispatch<GameAction> | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGameState(): GameState {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within GameProvider');
  return ctx;
}

export function useGameDispatch(): Dispatch<GameAction> {
  const ctx = useContext(GameDispatchContext);
  if (!ctx) throw new Error('useGameDispatch must be used within GameProvider');
  return ctx;
}

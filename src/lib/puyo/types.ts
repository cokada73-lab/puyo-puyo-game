export type PuyoColor = 0 | 1 | 2 | 3 | 4 | 5;
// 0=empty 1=red 2=blue 3=green 4=yellow 5=purple

export const COLS = 6;
export const ROWS = 13; // row 0 is hidden spawn buffer
export const VISIBLE_ROWS = 12;
export const SPAWN_COL = 2;

export const COLOR_NAMES: Record<PuyoColor, string> = {
  0: 'empty',
  1: 'red',
  2: 'blue',
  3: 'green',
  4: 'yellow',
  5: 'purple',
};

export type Board = Uint8Array; // length COLS * ROWS

// bit0=top, bit1=right, bit2=bottom, bit3=left
export type NeighborMask = number;

export type Rotation = 0 | 1 | 2 | 3;
// 0: axis bottom, child top
// 1: axis left,   child right
// 2: axis top,    child bottom
// 3: axis right,  child left

export interface FallingPair {
  axisColor: PuyoColor;
  childColor: PuyoColor;
  col: number;
  row: number;
  rotation: Rotation;
}

export interface PuyoPair {
  axisColor: PuyoColor;
  childColor: PuyoColor;
}

export interface PopGroup {
  cells: Array<{ row: number; col: number }>;
  color: PuyoColor;
}

export interface ScorePopupEntry {
  id: number;
  value: number;
  col: number; // 0-5 board column for positioning
  row: number; // 1-12 board row
}

export type GamePhase =
  | 'WAITING'
  | 'SPAWN'
  | 'FALLING'
  | 'LOCKING'
  | 'CHAIN_CHECK'
  | 'POPPING'
  | 'GRAVITY'
  | 'GAME_OVER'
  | 'PAUSED';

export interface GameState {
  board: Board;
  falling: FallingPair | null;
  queue: PuyoPair[];
  phase: GamePhase;
  prevPhase: GamePhase | null; // saved phase for pause/resume
  score: number;
  hiScore: number;
  level: number;
  chainCount: number;
  maxChain: number;
  poppingCells: ReadonlySet<number>; // flat indices
  phaseTimer: number; // ms remaining in timed phase
  fallTimer: number; // ms until next row drop
  lockTimer: number;
  scorePopups: ScorePopupEntry[];
  isMuted: boolean;
  shakeActive: boolean;
  popupIdCounter: number;
}

export type GameAction =
  | { type: 'TICK'; deltaMs: number }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'ROTATE_RIGHT' }
  | { type: 'ROTATE_LEFT' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'PAUSE_TOGGLE' }
  | { type: 'START' }
  | { type: 'RESTART' }
  | { type: 'MUTE_TOGGLE' }
  | { type: 'DISMISS_POPUP'; id: number }
  | { type: 'SHAKE_DONE' };

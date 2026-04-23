import { Board, COLS, FallingPair, PuyoColor, Rotation, ROWS, SPAWN_COL } from './types';
import { getCell, isInBounds } from './board';

// [colDelta, rowDelta] from axis to child
const CHILD_OFFSETS: Record<Rotation, [number, number]> = {
  0: [0, -1], // child above axis
  1: [1, 0],  // child right
  2: [0, 1],  // child below
  3: [-1, 0], // child left
};

export function getChildPosition(pair: FallingPair): { col: number; row: number } {
  const [dc, dr] = CHILD_OFFSETS[pair.rotation];
  return { col: pair.col + dc, row: pair.row + dr };
}

export function canPlace(board: Board, pair: FallingPair): boolean {
  const { col, row } = pair;
  if (!isInBounds(row, col) || getCell(board, row, col) !== 0) return false;
  const child = getChildPosition(pair);
  if (!isInBounds(child.row, child.col) || getCell(board, child.row, child.col) !== 0) return false;
  return true;
}

export function hardDropRow(board: Board, pair: FallingPair): number {
  let r = pair.row;
  while (canPlace(board, { ...pair, row: r + 1 })) r++;
  return r;
}

export function rotatePair(board: Board, pair: FallingPair, dir: 1 | -1): FallingPair {
  const newRot = ((pair.rotation + dir + 4) % 4) as Rotation;
  const rotated = { ...pair, rotation: newRot };

  if (canPlace(board, rotated)) return rotated;

  // wall kick: try ±1 column
  for (const kick of [1, -1]) {
    const kicked = { ...rotated, col: rotated.col + kick };
    if (canPlace(board, kicked)) return kicked;
  }

  // rotation denied
  return pair;
}

export function createSpawnPair(axisColor: PuyoColor, childColor: PuyoColor): FallingPair {
  return {
    axisColor,
    childColor,
    col: SPAWN_COL,
    row: 1,
    rotation: 0,
  };
}

export function movePair(board: Board, pair: FallingPair, dc: number): FallingPair {
  const moved = { ...pair, col: pair.col + dc };
  return canPlace(board, moved) ? moved : pair;
}

export function placePair(board: Board, pair: FallingPair): Board {
  const child = getChildPosition(pair);
  let next = board.slice();
  next[pair.row * COLS + pair.col] = pair.axisColor;
  if (isInBounds(child.row, child.col)) {
    next[child.row * COLS + child.col] = pair.childColor;
  }
  return next;
}

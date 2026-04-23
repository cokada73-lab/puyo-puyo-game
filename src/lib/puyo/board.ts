import { Board, COLS, PuyoColor, ROWS } from './types';

export function createBoard(): Board {
  return new Uint8Array(COLS * ROWS);
}

export function idx(row: number, col: number): number {
  return row * COLS + col;
}

export function getCell(board: Board, row: number, col: number): PuyoColor {
  return board[idx(row, col)] as PuyoColor;
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

export function isEmpty(board: Board, row: number, col: number): boolean {
  if (!isInBounds(row, col)) return false;
  return board[idx(row, col)] === 0;
}

export function setCell(board: Board, row: number, col: number, color: PuyoColor): Board {
  const next = board.slice();
  next[idx(row, col)] = color;
  return next;
}

export function applyGravity(board: Board): Board {
  const next = board.slice();
  for (let c = 0; c < COLS; c++) {
    const column: PuyoColor[] = [];
    for (let r = 0; r < ROWS; r++) {
      const v = board[idx(r, c)] as PuyoColor;
      if (v !== 0) column.push(v);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      next[idx(r, c)] = column.length > 0 ? (column.pop() as PuyoColor) : 0;
    }
  }
  return next;
}

export function computeNeighborMasks(board: Board): Uint8Array {
  const masks = new Uint8Array(COLS * ROWS);
  for (let r = 1; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = getCell(board, r, c);
      if (color === 0) continue;
      let mask = 0;
      if (r > 0         && getCell(board, r - 1, c) === color) mask |= 1; // top
      if (c < COLS - 1  && getCell(board, r, c + 1) === color) mask |= 2; // right
      if (r < ROWS - 1  && getCell(board, r + 1, c) === color) mask |= 4; // bottom
      if (c > 0         && getCell(board, r, c - 1) === color) mask |= 8; // left
      masks[idx(r, c)] = mask;
    }
  }
  return masks;
}

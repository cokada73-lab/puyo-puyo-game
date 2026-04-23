import { Board, COLS, PopGroup, PuyoColor, ROWS } from './types';
import { getCell, idx, isInBounds } from './board';

export function findGroups(board: Board): PopGroup[] {
  const visited = new Uint8Array(COLS * ROWS);
  const groups: PopGroup[] = [];

  for (let r = 1; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = getCell(board, r, c);
      if (color === 0 || visited[idx(r, c)]) continue;

      const cells: Array<{ row: number; col: number }> = [];
      const stack = [{ row: r, col: c }];

      while (stack.length > 0) {
        const { row, col } = stack.pop()!;
        const i = idx(row, col);
        if (!isInBounds(row, col)) continue;
        if (visited[i]) continue;
        if (getCell(board, row, col) !== color) continue;
        visited[i] = 1;
        cells.push({ row, col });
        stack.push(
          { row: row - 1, col },
          { row: row + 1, col },
          { row, col: col - 1 },
          { row, col: col + 1 },
        );
      }

      if (cells.length >= 4) {
        groups.push({ cells, color: color as PuyoColor });
      }
    }
  }

  return groups;
}

export function popGroups(board: Board, groups: PopGroup[]): Board {
  const next = board.slice();
  for (const group of groups) {
    for (const { row, col } of group.cells) {
      next[idx(row, col)] = 0;
    }
  }
  return next;
}

export function getPoppingIndices(groups: PopGroup[]): Set<number> {
  const set = new Set<number>();
  for (const group of groups) {
    for (const { row, col } of group.cells) {
      set.add(idx(row, col));
    }
  }
  return set;
}

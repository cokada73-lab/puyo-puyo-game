import { PopGroup } from './types';

const CHAIN_BONUS = [0, 0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512];

const COLOR_BONUS = [0, 0, 3, 6, 12, 24];

function groupBonus(count: number): number {
  if (count <= 4) return 0;
  if (count >= 11) return 10;
  return count - 3;
}

export function calcChainScore(chain: number, groups: PopGroup[]): number {
  const totalPuyos = groups.reduce((sum, g) => sum + g.cells.length, 0);
  const chainBonus = CHAIN_BONUS[Math.min(chain, CHAIN_BONUS.length - 1)];
  const colorCount = new Set(groups.map((g) => g.color)).size;
  const colorBonusVal = COLOR_BONUS[Math.min(colorCount, 5)];
  const groupBonusVal = groups.reduce((sum, g) => sum + groupBonus(g.cells.length), 0);
  const bonusTotal = Math.max(1, chainBonus + colorBonusVal + groupBonusVal);
  return totalPuyos * 10 * bonusTotal;
}

export function levelFromScore(score: number): number {
  return Math.min(20, Math.floor(score / 5000) + 1);
}

export function fallIntervalMs(level: number): number {
  return Math.max(100, 800 - (level - 1) * 35);
}

const HI_SCORE_KEY = 'puyo_hi_score';

export function getHiScore(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(HI_SCORE_KEY) ?? '0', 10) || 0;
}

export function saveHiScore(score: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HI_SCORE_KEY, String(score));
}

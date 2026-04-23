import { PuyoColor, PuyoPair } from './types';

const NUM_COLORS = 5; // colors 1-5

function randomColor(): PuyoColor {
  return (Math.floor(Math.random() * NUM_COLORS) + 1) as PuyoColor;
}

export function generatePair(): PuyoPair {
  return { axisColor: randomColor(), childColor: randomColor() };
}

export function fillQueue(queue: PuyoPair[], minSize = 4): PuyoPair[] {
  const next = [...queue];
  while (next.length < minSize) next.push(generatePair());
  return next;
}

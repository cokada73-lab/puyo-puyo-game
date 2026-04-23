import { PuyoColor, NeighborMask } from '@/lib/puyo/types';
import styles from './PuyoCell.module.css';

interface Props {
  color: PuyoColor;
  neighborMask: NeighborMask;
  isPopping: boolean;
}

export function PuyoCell({ color, neighborMask, isPopping }: Props) {
  if (color === 0) return <div className={styles.cell} />;

  const cls = [
    styles.cell,
    isPopping ? styles.popping : '',
  ].join(' ');

  const puyoCls = [
    styles.puyo,
    styles[`color-${color}`],
    styles[`mask-${neighborMask}`],
  ].join(' ');

  return (
    <div className={cls}>
      <div className={puyoCls} />
    </div>
  );
}

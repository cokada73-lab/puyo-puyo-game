import { useGameState } from '@/context/GameContext';
import { PuyoCell } from './PuyoCell';
import styles from './NextPanel.module.css';

function PairPreview({ axisColor, childColor }: { axisColor: number; childColor: number }) {
  return (
    <div className={styles.pair}>
      {/* rotation 0: child on top, axis on bottom */}
      <PuyoCell color={childColor as never} neighborMask={0} isPopping={false} />
      <PuyoCell color={axisColor as never} neighborMask={0} isPopping={false} />
    </div>
  );
}

export function NextPanel() {
  const { queue } = useGameState();
  const next1 = queue[0];
  const next2 = queue[1];

  return (
    <div className={styles.panel}>
      {next1 && (
        <div className={styles.block}>
          <span className={styles.label}>Next</span>
          <PairPreview axisColor={next1.axisColor} childColor={next1.childColor} />
        </div>
      )}
      {next2 && (
        <div className={styles.block}>
          <span className={styles.label}>Next 2</span>
          <PairPreview axisColor={next2.axisColor} childColor={next2.childColor} />
        </div>
      )}
    </div>
  );
}

import { useGameState } from '@/context/GameContext';
import styles from './ScorePanel.module.css';

export function ScorePanel() {
  const { score, hiScore, level, maxChain, chainCount, phase } = useGameState();
  const isChaining = phase === 'POPPING' || phase === 'GRAVITY';

  return (
    <div className={styles.panel}>
      <div className={styles.block}>
        <span className={styles.label}>Score</span>
        <span className={styles.value}>{score.toLocaleString()}</span>
      </div>
      <div className={styles.block}>
        <span className={styles.label}>Best</span>
        <span className={styles.value}>{hiScore.toLocaleString()}</span>
      </div>
      <div className={styles.block}>
        <span className={styles.label}>Level</span>
        <span className={`${styles.value} ${styles.levelValue}`}>{level}</span>
      </div>
      <div className={styles.block}>
        <span className={styles.label}>最大連鎖</span>
        <span className={`${styles.value} ${styles.chainValue}`}>{maxChain}</span>
        {isChaining && chainCount > 0 && (
          <span className={styles.chainCurrent}>{chainCount} 連鎖中</span>
        )}
      </div>
    </div>
  );
}

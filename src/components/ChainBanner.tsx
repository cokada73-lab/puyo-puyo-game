import { useGameState } from '@/context/GameContext';
import styles from './ChainBanner.module.css';

const CHAIN_LABELS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function chainColorClass(n: number): string {
  if (n <= 1) return styles.chain1;
  if (n === 2) return styles.chain2;
  if (n === 3) return styles.chain3;
  if (n === 4) return styles.chain4;
  return styles['chain5plus'];
}

export function ChainBanner() {
  const { phase, chainCount } = useGameState();
  if (phase !== 'POPPING' || chainCount < 1) return null;

  const label = chainCount <= 10 ? CHAIN_LABELS[chainCount] : String(chainCount);
  const colorCls = chainColorClass(chainCount);

  return (
    <div className={styles.banner}>
      <span key={chainCount} className={`${styles.text} ${colorCls}`}>
        {label} Chain!
      </span>
    </div>
  );
}

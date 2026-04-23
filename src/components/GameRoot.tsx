'use client';

import { useEffect, useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import { GameBoard } from './GameBoard';
import { NextPanel } from './NextPanel';
import { ScorePanel } from './ScorePanel';
import { ChainBanner } from './ChainBanner';
import { ScorePopup } from './ScorePopup';
import { GameOverlay } from './GameOverlay';
import { MuteButton } from './MuteButton';
import styles from './GameRoot.module.css';

function GameInner() {
  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>ぷよぷよ</h1>
        <MuteButton />
      </div>
      <div className={styles.gameArea}>
        <div className={styles.sideLeft}>
          <ScorePanel />
        </div>
        <div className={styles.boardArea}>
          <GameBoard />
          <ChainBanner />
          <ScorePopup />
          <GameOverlay />
        </div>
        <div className={styles.sideRight}>
          <NextPanel />
        </div>
      </div>
      <p className={styles.controls}>
        ← → 移動 &nbsp;|&nbsp; Z/X 回転 &nbsp;|&nbsp; ↓ 落下 &nbsp;|&nbsp; Space 即落 &nbsp;|&nbsp; P 一時停止
      </p>
    </div>
  );
}

export function GameRoot() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <GameProvider>
      <GameInner />
    </GameProvider>
  );
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version Notice

This project uses Next.js 16 — read `node_modules/next/dist/docs/` before writing any code. APIs, conventions, and file structure may differ from older versions. Heed any deprecation notices.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server (requires build first)
npm run lint     # Run ESLint
```

## Architecture

- **Framework**: Next.js 16 (App Router) with TypeScript and React 19
- **Entry point**: `src/app/page.tsx`
- **Layout**: `src/app/layout.tsx` — defines root HTML, fonts (Geist), and global metadata
- **Styles**: `src/app/globals.css` for global styles; CSS Modules (`.module.css`) for component-scoped styles
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google`

All new pages and components go under `src/app/` following the App Router convention (folder = route, `page.tsx` = route entry, `layout.tsx` = shared layout).

## Goal

Build a cute and advanced Puyo Puyo puzzle game with modern UI/UX.

---

## ぷよぷよ 要件定義

### 1. ゲーム概要

かわいいビジュアルと先進的なUI/UXを持つブラウザ動作のぷよぷよパズルゲーム。シングルプレイヤー向け。

---

### 2. コアゲームルール

#### フィールド
- サイズ: 6列 × 13行（上部1行は非表示の出現バッファ）
- ぷよは上から落下し、最下行または他のぷよの上に積み重なる

#### ぷよ
- 色: 赤・青・緑・黄・紫の5色
- 2個1組（ツモ）で出現。上下または左右に並ぶ

#### 操作
| 操作 | キーボード | モバイル |
|------|-----------|---------|
| 左移動 | `←` | スワイプ左 |
| 右移動 | `→` | スワイプ右 |
| 右回転 | `Z` / `X` | タップ右側 |
| 左回転 | `A` | タップ左側 |
| 高速落下 | `↓` | スワイプ下 |
| 即時落下 | `Space` | ダブルタップ |

#### 消去ルール
- 同色のぷよが上下左右に**4個以上**繋がると消える
- 消えた後に上のぷよが落下し、再び4個以上繋がると**連鎖（れんさ）**が発生

#### 連鎖スコア
- 連鎖数・消去ぷよ数・同時消去色数に応じてスコアを加算
- 連鎖倍率: 1連鎖=1倍, 2連鎖=8倍, 3連鎖=16倍, 4連鎖以降=指数的増加

#### ゲームオーバー
- フィールド上部（3列目）までぷよが積み重なった場合

---

### 3. ゲーム機能

#### 必須機能
- **ネクストぷよ**: 次の2ツモ（2組）を表示
- **スコア表示**: 現在スコア・最高スコア（localStorage保存）
- **レベルシステム**: 一定スコアごとにレベルアップ。ぷよの落下速度が上昇
- **連鎖表示**: 連鎖数をアニメーション付きで画面中央に表示
- **ゲームオーバー画面**: スコア・最高スコア・リスタートボタンを表示
- **一時停止**: `P` キーまたはボタンで一時停止・再開

#### 追加機能
- **BGM・効果音**: 落下音・消去音・連鎖音・ゲームオーバー音（Web Audio API）
- **ミュートボタン**: サウンドのオン・オフ切り替え

---

### 4. UI/UX 要件

#### ビジュアルデザイン
- **テーマ**: パステルカラー基調のかわいい・ポップなデザイン
- **ぷよの見た目**: 丸みを帯びたぷよ。隣接する同色ぷよが繋がって見える（接続形状変化）
- **背景**: グラデーションまたはアニメーション背景
- **フォント**: 丸みのある日本語対応フォント（例: Rounded Mplus / Noto Sans JP）

#### アニメーション
- ぷよ落下・着地・消去・連鎖すべてにスムーズなアニメーションを付与
- 連鎖発生時に画面シェイクまたはフラッシュ演出
- スコア加算時にポップアップ数字アニメーション

#### レスポンシブ
- PC（キーボード操作）・スマートフォン（タッチ操作）両対応
- ゲームフィールドは画面サイズに合わせてスケール

---

### 5. 技術要件

#### 実装方針
- ゲームロジックはピュアTypeScript（Reactに依存しない）で実装し、`src/lib/puyo/` に集約
- Reactコンポーネントはレンダリングのみ担当。ゲーム状態はカスタムフック（`usePuyoGame`）で管理
- ゲームループは `requestAnimationFrame` を使用
- レンダリングは Canvas API または CSS Grid（どちらか一方に統一）

#### ファイル構成（想定）
```
src/
  app/
    page.tsx           # ゲーム画面エントリ
  components/
    GameBoard.tsx      # フィールド描画
    NextPuyo.tsx       # ネクスト表示
    ScorePanel.tsx     # スコア・レベル表示
  lib/
    puyo/
      board.ts         # フィールド状態・衝突判定
      chain.ts         # 連鎖・消去ロジック
      score.ts         # スコア計算
      types.ts         # 型定義
  hooks/
    usePuyoGame.ts     # ゲームループ・状態管理
```

#### 状態管理
- グローバル状態管理ライブラリは使用しない（`useReducer` + `useContext` で完結させる）
- ゲーム状態は `PLAYING | PAUSED | GAMEOVER` の3状態で管理

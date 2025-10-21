# UIデザインシステム設計書

作成日：2025-10-21  
バージョン：v1.0.0

---

## 1. デザインコンセプト

### 1.1 ビジョン
Duolingoのような親しみやすく、モダンで洗練された学習体験を提供する。論理学習という堅いイメージを払拭し、楽しく続けられるUIを実現する。

### 1.2 デザイン原則
- **シンプル**: 必要な情報だけを表示し、ノイズを減らす
- **直感的**: 説明なしで操作方法が理解できる
- **親しみやすい**: カラフルで楽しい雰囲気を演出
- **フィードバック**: 操作に対して即座に視覚的フィードバックを提供
- **達成感**: 進捗が可視化され、モチベーションを維持できる

---

## 2. カラーシステム

### 2.1 メインカラー
- **Primary (インディゴブルー)**: `oklch(0.5 0.2 260)`
  - 用途: メインボタン、リンク、アクティブ状態
  - 特徴: 知性・集中・信頼を表現

### 2.2 セマンティックカラー
- **Success (グリーン)**: `oklch(0.65 0.2 145)`
  - 用途: 正解フィードバック、完了状態
  - 🟢 正解時の背景、チェックマーク
  
- **Error (レッド)**: `oklch(0.577 0.245 27.325)`
  - 用途: 不正解フィードバック、エラー表示
  - 🔴 不正解時の背景、警告

- **Warning (イエロー)**: `oklch(0.8 0.15 85)`
  - 用途: 注意喚起、ヒント
  - ⚠️ 注意事項、ヒントボックス

- **Info (ライトブルー)**: `oklch(0.7 0.15 240)`
  - 用途: 情報表示、ガイダンス
  - ℹ️ ヘルプテキスト、説明

### 2.3 ニュートラルカラー
- **Background**: `oklch(0.99 0 0)` - ほぼ白
- **Surface**: `oklch(1 0 0)` - 純白
- **Border**: `oklch(0.9 0.02 260)` - 薄いインディゴグレー

---

## 3. タイポグラフィ

### 3.1 フォントファミリー
- **メイン**: Geist Sans（システムフォント）
- **コード**: Geist Mono（必要に応じて）
- **日本語**: システムデフォルト（Noto Sans JP推奨）

### 3.2 フォントスケール
```typescript
const typography = {
  // 見出し
  h1: "text-4xl font-bold",      // 36px
  h2: "text-3xl font-bold",      // 30px
  h3: "text-2xl font-semibold",  // 24px
  h4: "text-xl font-semibold",   // 20px
  
  // 本文
  body: "text-base",             // 16px
  small: "text-sm",              // 14px
  xs: "text-xs",                 // 12px
  
  // 特殊
  display: "text-5xl font-bold", // 48px（ヒーロー）
  caption: "text-xs text-muted-foreground", // キャプション
}
```

### 3.3 行間・字間
- **行間**: `leading-relaxed` (1.625) - 読みやすさ重視
- **見出し行間**: `leading-tight` (1.25) - コンパクト
- **字間**: デフォルト（調整不要）

---

## 4. スペーシングシステム

### 4.1 基本単位
- **ベース**: 4px（Tailwindデフォルト）
- **推奨値**: 4, 8, 12, 16, 24, 32, 48, 64

### 4.2 コンポーネント内余白
```typescript
const spacing = {
  card: "p-6",           // カード内部: 24px
  button: "px-6 py-3",   // ボタン: 24px × 12px
  input: "px-4 py-2",    // 入力欄: 16px × 8px
  section: "py-12",      // セクション間: 48px
  container: "px-4 md:px-8", // コンテナ: レスポンシブ
}
```

---

## 5. コンポーネントデザイン

### 5.1 ボタン

#### Primary Button
- **背景**: Primary色
- **テキスト**: 白
- **角丸**: `rounded-xl` (12px)
- **影**: `shadow-lg`
- **hover**: 明度+10%、影が大きくなる
- **サイズ**: 最小48px高さ（アクセシビリティ）

```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg px-8 py-4 text-lg font-semibold">
  答え合わせ
</Button>
```

#### Secondary Button
- **背景**: Secondary色
- **テキスト**: Secondary-foreground
- **スタイル**: Primaryと同様、控えめ

#### Ghost Button
- **背景**: 透明
- **テキスト**: Primary色
- **hover**: 薄い背景色が表示

### 5.2 カード

#### 基本カード
- **背景**: 白 (`bg-card`)
- **角丸**: `rounded-2xl` (16px)
- **影**: `shadow-md hover:shadow-xl`
- **境界線**: 薄いボーダー (`border border-border`)
- **アニメーション**: hover時に浮き上がる

```tsx
<Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
  <CardContent className="p-6">
    ...
  </CardContent>
</Card>
```

#### インタラクティブカード
- hover時に`scale-105`でわずかに拡大
- カーソルを`cursor-pointer`に変更

### 5.3 プログレスインジケーター

#### 問題進捗
- **形状**: 水平バー
- **色**: 完了=Success、現在=Primary、未完了=Muted
- **アニメーション**: プログレス増加時にスムーズ遷移

```tsx
// 問題番号表示（Duolingoスタイル）
<div className="flex items-center gap-2">
  {[1, 2, 3, 4, 5].map((num) => (
    <div
      key={num}
      className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all",
        num < current && "bg-success text-white",
        num === current && "bg-primary text-white scale-110 shadow-lg",
        num > current && "bg-muted text-muted-foreground"
      )}
    >
      {num}
    </div>
  ))}
</div>
```

#### ステップ進捗
- **形状**: ドット、またはステップバー
- **位置**: 問題下部
- **色**: 同様の配色

### 5.4 フィードバック表示

#### 正解フィードバック
```tsx
<div className="bg-success/10 border-2 border-success rounded-2xl p-6 animate-in slide-in-from-bottom">
  <div className="flex items-center gap-3">
    <CheckCircle2 className="w-8 h-8 text-success" />
    <div>
      <h3 className="text-xl font-bold text-success">正解です！</h3>
      <p className="text-sm text-muted-foreground">次のステップに進みましょう</p>
    </div>
  </div>
</div>
```

#### 不正解フィードバック
```tsx
<div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6 animate-shake-x">
  <div className="flex items-center gap-3">
    <XCircle className="w-8 h-8 text-destructive" />
    <div>
      <h3 className="text-xl font-bold text-destructive">もう一度考えてみましょう</h3>
      <p className="text-sm text-muted-foreground">ヒント: 前件と後件の関係を確認してください</p>
    </div>
  </div>
</div>
```

### 5.5 ドロップダウン・セレクト

#### スタイル
- **角丸**: `rounded-xl`
- **境界線**: `border-2` （通常よりも太め）
- **focus**: Primary色のリング、影
- **サイズ**: 大きめ（48px以上）

```tsx
<Select>
  <SelectTrigger className="rounded-xl border-2 h-12 text-base hover:border-primary focus:ring-2 focus:ring-primary">
    <SelectValue placeholder="選択してください" />
  </SelectTrigger>
</Select>
```

### 5.6 三角ロジック図

#### デザイン仕様
- **ノード**: 円形、大きめ（64px以上）
- **ノード色**: 
  - 未入力: `bg-muted`
  - 入力済み: `bg-primary/10 border-2 border-primary`
  - 正解: `bg-success/20 border-2 border-success`
  - 不正解: `bg-destructive/20 border-2 border-destructive`
- **リンク（矢印）**: 
  - 太さ: 3px
  - 色: Primary色
  - アニメーション: ホバー時に太くなる
- **全体**: カードの中に配置、影付き

---

## 6. アニメーション

### 6.1 トランジション
- **標準**: `transition-all duration-300 ease-in-out`
- **高速**: `transition-all duration-150 ease-in-out`
- **低速**: `transition-all duration-500 ease-in-out`

### 6.2 アニメーションライブラリ
- **Framer Motion**: 複雑なアニメーション
- **Tailwind Animate**: シンプルなアニメーション

### 6.3 主要アニメーション

#### フェードイン
```tsx
<div className="animate-in fade-in duration-500">...</div>
```

#### スライドイン
```tsx
<div className="animate-in slide-in-from-bottom duration-500">...</div>
```

#### スケール
```tsx
<div className="hover:scale-105 transition-transform">...</div>
```

#### シェイク（不正解時）
```css
@keyframes shake-x {
  10%, 90% { transform: translateX(-2px) }
  20%, 80% { transform: translateX(4px) }
  30%, 50%, 70% { transform: translateX(-6px) }
  40%, 60% { transform: translateX(6px) }
}
```

#### 成功時のバウンス
```tsx
<div className="animate-in zoom-in duration-300">
  <CheckCircle2 className="animate-bounce" />
</div>
```

---

## 7. レイアウト

### 7.1 レスポンシブブレークポイント
```typescript
const breakpoints = {
  sm: '640px',   // スマートフォン（縦）
  md: '768px',   // タブレット
  lg: '1024px',  // ラップトップ
  xl: '1280px',  // デスクトップ
  '2xl': '1536px' // 大画面
}
```

### 7.2 コンテナ幅
- **最大幅**: `max-w-7xl` (1280px)
- **中央配置**: `mx-auto`
- **余白**: `px-4 md:px-8 lg:px-16`

### 7.3 グリッドシステム
```tsx
// 問題一覧: カードグリッド
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {problems.map(...)}
</div>

// 問題詳細: 2カラム（PC）/ 1カラム（モバイル）
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div>論証文・問題文</div>
  <div>三角ロジック</div>
</div>
```

---

## 8. ゲーミフィケーション要素

### 8.1 達成バッジ
- **デザイン**: 円形、アイコン＋色
- **表示**: クリア時にアニメーション表示
- **サイズ**: 64px〜128px

```tsx
<div className="relative">
  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-xl animate-in zoom-in">
    <Trophy className="w-12 h-12 text-white" />
  </div>
  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
    3
  </div>
</div>
```

### 8.2 プログレスバー
- **デザイン**: 太め（8px〜12px）、角丸
- **色**: グラデーション（Primary → Success）
- **アニメーション**: 進捗増加時にスムーズ

```tsx
<div className="w-full bg-muted rounded-full h-3 overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 rounded-full"
    style={{ width: `${progress}%` }}
  />
</div>
```

### 8.3 コンボ・ストリーク
- **表示**: 連続正解時に画面上部に表示
- **アニメーション**: 数字が大きくなる＋炎アイコン

```tsx
<div className="flex items-center gap-2 bg-warning/20 border-2 border-warning rounded-full px-4 py-2 animate-bounce">
  <Flame className="w-5 h-5 text-warning" />
  <span className="font-bold text-warning">3連続正解！</span>
</div>
```

---

## 9. アイコンシステム

### 9.1 アイコンライブラリ
- **Lucide React**: 一貫性のあるモダンなアイコン

### 9.2 主要アイコン
```typescript
import {
  CheckCircle2,  // 正解
  XCircle,       // 不正解
  Trophy,        // クリア
  Flame,         // ストリーク
  ArrowRight,    // 次へ
  ArrowLeft,     // 戻る
  Home,          // ホーム
  BookOpen,      // 問題
  User,          // ユーザー
  Settings,      // 設定
  HelpCircle,    // ヘルプ
  Target,        // ゴール
} from "lucide-react"
```

### 9.3 サイズ指針
- **小**: `w-4 h-4` (16px)
- **中**: `w-6 h-6` (24px)
- **大**: `w-8 h-8` (32px)
- **特大**: `w-12 h-12` (48px)

---

## 10. アクセシビリティ

### 10.1 コントラスト比
- **テキスト**: 最低4.5:1（WCAG AA）
- **大きなテキスト**: 最低3:1
- **インタラクティブ要素**: 最低3:1

### 10.2 フォーカス管理
- **フォーカスリング**: 明確に表示（`focus:ring-2 focus:ring-primary`）
- **キーボード操作**: すべての操作をキーボードで実行可能
- **スキップリンク**: 必要に応じて実装

### 10.3 ARIAラベル
- **ボタン**: 適切なaria-label
- **インタラクティブ要素**: role属性
- **状態変化**: aria-live

---

## 11. パフォーマンス

### 11.1 画像最適化
- **形式**: WebP優先、PNG/JPGフォールバック
- **サイズ**: レスポンシブ画像
- **遅延読み込み**: `loading="lazy"`

### 11.2 アニメーション最適化
- **GPU加速**: `transform`と`opacity`を優先
- **will-change**: 必要最小限
- **リデュースモーション**: `prefers-reduced-motion`対応

---

## 12. 実装優先度

### Phase 1: 基本要素（最優先）
- ✅ カラーシステム完了
- 🔲 ボタンスタイル更新
- 🔲 カードスタイル更新
- 🔲 タイポグラフィ統一

### Phase 2: インタラクション
- 🔲 フィードバック表示の改善
- 🔲 プログレスインジケーター実装
- 🔲 アニメーション追加

### Phase 3: ゲーミフィケーション
- 🔲 達成バッジ実装
- 🔲 ストリーク機能
- 🔲 サウンドエフェクト（オプション）

### Phase 4: 細部の調整
- 🔲 レスポンシブ最適化
- 🔲 アクセシビリティ強化
- 🔲 パフォーマンス最適化

---

## 13. 参考デザイン

### Duolingo的要素
1. **明るく楽しい**: カラフルな配色、親しみやすいイラスト
2. **即座のフィードバック**: 正解/不正解を即座に表示
3. **進捗の可視化**: プログレスバー、バッジ、ストリーク
4. **大きなボタン**: タップしやすい、明確なCTA
5. **シンプルなレイアウト**: 1画面1タスク

### 独自要素
1. **三角ロジック図**: 視覚的で美しい図形表現
2. **論理的な色使い**: 落ち着いたインディゴブルーベース
3. **学術的な信頼性**: 過度にカジュアルにしない

---

## 14. 今後の拡張

- **ダークモード最適化**: より洗練されたダークテーマ
- **カスタムイラスト**: 論理学習に特化したイラスト作成
- **マイクロインタラクション**: より細やかなフィードバック
- **パーソナライゼーション**: ユーザー好みのテーマ選択

---

*このドキュメントは継続的に更新され、実装を通じて改善されます。*


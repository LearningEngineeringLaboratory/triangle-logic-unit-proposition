# 単位命題三角ロジック演習システム

単位命題三角ロジックを用いた学習演習システムです。

## 📖 概要

このシステムは、三項論証の推論形式や妥当性の判別の学習を支援するためのWebアプリケーションです。単位命題三角ロジックにより論証構造の可視化・操作が可能となっています。

### 主な機能
- 単位命題三角ロジックによる論証構造の可視化
- ステップ型演習システム
- 学習過程の詳細ログ収集
- 答え合わせ機能

## 🛠️ 技術スタック

### フロントエンド
![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react)

### UI/UX
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=flat-square&logo=radix-ui)
![Lucide React](https://img.shields.io/badge/Lucide_React-000000?style=flat-square&logo=lucide)

### バックエンド・データベース
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql)

### ユーティリティ
![ULID](https://img.shields.io/badge/ULID-000000?style=flat-square)
![CVA](https://img.shields.io/badge/CVA-000000?style=flat-square)
![clsx](https://img.shields.io/badge/clsx-000000?style=flat-square)

### デプロイ
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel)

## 🚀 セットアップ

### 前提条件
- Node.js 18.0以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/LearningEngineeringLaboratory/triangle-logic-unit-proposition.git

# 依存関係をインストール
npm install

# 環境変数を設定
# .env.localファイルを作成し、以下の環境変数を設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   │   └── register/      # ユーザー登録ページ
│   ├── (main)/            # メイン機能
│   │   └── problems/      # 問題一覧・詳細ページ
│   └── api/               # API エンドポイント
│       ├── register/      # ユーザー登録API
│       └── session/       # セッション管理API
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/uiコンポーネント
│   ├── triangle-logic/   # 単位命題三角ロジック専用
│   └── forms/            # フォーム関連
├── lib/                  # ユーティリティ・設定
│   ├── supabase.ts       # Supabaseクライアント
│   ├── problems.ts       # 問題データ取得
│   └── types.ts          # TypeScript型定義
└── hooks/                # カスタムReactフック
```

## 🎯 開発状況

- [x] Next.js初期セットアップ
- [x] Supabase接続設定
- [x] データベーススキーマ設計
- [x] ユーザー登録・セッション管理API
- [x] 問題一覧ページ実装
- [ ] 問題詳細ページ実装
- [ ] 単位命題三角ロジックUI
- [ ] ステップ型演習システム
- [ ] 答え合わせ機能

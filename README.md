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
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)

### UI/UX
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000?style=flat-square)
![Radix UI](https://img.shields.io/badge/Radix_UI-latest-161618?style=flat-square&logo=radix-ui)
![Lucide React](https://img.shields.io/badge/Lucide_React-0.544.0-000000?style=flat-square&logo=lucide)

### バックエンド・データベース
![Supabase](https://img.shields.io/badge/Supabase-2.58.0-3ECF8E?style=flat-square&logo=supabase)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791?style=flat-square&logo=postgresql)

### ユーティリティ
![ULID](https://img.shields.io/badge/ULID-3.0.1-000000?style=flat-square)
![CVA](https://img.shields.io/badge/CVA-0.7.1-000000?style=flat-square)
![clsx](https://img.shields.io/badge/clsx-2.1.1-000000?style=flat-square)

### デプロイ
![Vercel](https://img.shields.io/badge/Vercel-デプロイ-000000?style=flat-square&logo=vercel)

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
cp .env.example .env.local
# .env.localにSupabaseの接続情報を設定
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
│   ├── (main)/            # メイン機能
│   └── api/               # API エンドポイント
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/uiコンポーネント
│   ├── triangle-logic/   # 単位命題三角ロジック専用
│   └── forms/            # フォーム関連
├── lib/                  # ユーティリティ・設定
└── hooks/                # カスタムReactフック
```

## 🎯 開発状況

- [x] Next.js初期セットアップ
- [x] Supabase接続設定
- [ ] データベーススキーマ設計
- [ ] ユーザー登録機能
- [ ] 単位命題三角ロジックUI
- [ ] 演習システム実装

## 📄 ライセンス

このプロジェクトは研究目的で開発されています。

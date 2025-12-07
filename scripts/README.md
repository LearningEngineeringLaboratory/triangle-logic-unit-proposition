# 問題データインポート

## 概要

Supabaseに問題データをインポートする方法です。

## 推奨方法: CSVファイル（実験用データの一括投入に最適）

### 1. 問題をCSVファイルに記述

`data/problems/problems.csv` に問題を記述してください。

詳細は `data/problems/README.md` を参照してください。

### 2. 環境変数の設定

`.env.local` ファイルに以下を設定してください：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

または：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key
```

### 3. CSVファイルからインポート

```bash
npx tsx scripts/import-from-csv.ts data/problems/problems.csv
```

このコマンドで：
- CSVファイルを読み込み
- データを検証
- JSONB形式に変換
- Supabaseに自動投入（UPSERT）
- 結果を表示

## その他の方法

### JSONファイル + Supabase MCP

### 1. 問題をJSONファイルに記述

`data/problems/new-problems.json` に問題を記述してください。

詳細は `data/problems/README.md` を参照してください。

### 2. データの検証（オプション）

```bash
npx tsx scripts/import-from-json.ts data/problems/new-problems.json
```

このコマンドでJSONの構文や必須フィールドを確認できます。

### 3. Supabaseに追加

このチャットで以下のように依頼してください：

```
data/problems/new-problems.json の内容をSupabaseに追加してください
```

AIが自動的に：
- JSONファイルを読み込み
- データを検証
- Supabase MCPを使用して追加
- 結果を確認・報告

## スクリプト

### `import-from-csv.ts`

CSVファイルから問題データをSupabaseにインポートします。

```bash
npx tsx scripts/import-from-csv.ts [CSVファイルパス]
```

**特徴:**
- CSV形式で簡単にデータを記述可能
- JSONBフィールドもCSVの列として記述可能
- 自動的にJSONB形式に変換
- UPSERT対応（既存データは更新）

### `import-from-json.ts`

JSONファイルの検証とSQL文の生成を行います。

```bash
npx tsx scripts/import-from-json.ts [JSONファイルパス]
```

## その他の方法

- **Supabaseダッシュボード**: 管理画面から手動で追加


# 問題データインポート

## 概要

Supabaseに問題データをインポートする方法です。

## 推奨方法: JSONファイル + Supabase MCP

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

### `import-from-json.ts`

JSONファイルの検証とSQL文の生成を行います。

```bash
npx tsx scripts/import-from-json.ts [JSONファイルパス]
```

## その他の方法

- **Supabaseダッシュボード**: 管理画面から手動で追加


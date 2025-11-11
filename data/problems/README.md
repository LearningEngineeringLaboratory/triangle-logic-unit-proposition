# 問題データファイル

## ファイル構成

- `problems.json`: 既存の問題データ（全問題）
- `new-problems.json`: **新規追加用の問題データ**（このファイルに記述）

## 新規問題の追加方法

### 1. `new-problems.json`に問題を記述

`new-problems.json`を開いて、以下の形式で問題を追加してください：

```json
[
  {
    "problem_id": "TLU-1-12-v1.0.0",
    "argument": "猫は動物であり，動物は生き物である．とすると，猫は生き物である．",
    "options": [
      "猫である",
      "動物である",
      "生き物である"
    ],
    "correct_answers": {
      "step1": {
        "antecedent": "猫である",
        "consequent": "生き物である"
      },
      "step2": [
        {
          "from": "猫である",
          "to": "動物である"
        },
        {
          "from": "動物である",
          "to": "生き物である"
        }
      ],
      "step3": {
        "inference_type": "演繹推論",
        "validity": true
      }
    },
    "version": "1.0.0"
  }
]
```

### 2. データ構造の説明

#### `problem_id`
- 問題の一意なID
- 形式: `TLU-[番号]-v[バージョン]`
- 例: `TLU-1-12-v1.0.0`

#### `argument`
- 論証文（問題文）
- 例: `"PであるならばQである。また，QであるならばRである。したがって，PであるならばRである。"`

#### `options`
- 単位命題の選択肢（配列）
- 全ステップで共通の選択肢

#### `correct_answers.step1`
- 導出命題の前件・後件
```json
{
  "antecedent": "前件",
  "consequent": "後件"
}
```

#### `correct_answers.step2`
- 正解リンクの配列
- **重要**: 配列形式で記述
```json
[
  { "from": "始点", "to": "終点" },
  { "from": "始点", "to": "終点" }
]
```
- 組立不可の場合は空配列 `[]`

#### `correct_answers.step3`
- 推論形式と妥当性
```json
{
  "inference_type": "演繹推論" | "仮説推論" | "非形式推論",
  "validity": true | false
}
```

#### `correct_answers.step4`（5ステップ問題の場合のみ）
- リンクの活性/非活性
```json
[
  { "from": "始点", "to": "終点", "active": true },
  { "from": "始点", "to": "終点", "active": false }
]
```

#### `correct_answers.step5`（5ステップ問題の場合のみ）
- 妥当性のある三項論証
```json
[
  { "antecedent": "前件", "consequent": "後件" },
  { "antecedent": "前件", "consequent": "後件" }
]
```

### 3. データの検証

JSONファイルを保存したら、以下のコマンドで検証できます：

```bash
npx tsx scripts/import-from-json.ts data/problems/new-problems.json
```

このコマンドは：
- JSONファイルの構文をチェック
- 必須フィールドの存在を確認
- データ構造の妥当性を検証
- SQL文を生成（参考用）

### 4. Supabaseに追加

検証が成功したら、このチャットで以下のように依頼してください：

```
data/problems/new-problems.json の内容をSupabaseに追加してください
```

AIが自動的に：
1. JSONファイルを読み込み
2. データを検証
3. Supabase MCPを使用して追加
4. 結果を確認・報告

## 注意事項

1. **問題IDの重複**: 既存の問題IDと重複しないように注意
2. **JSON形式**: 正しいJSON形式で記述（カンマ、クォートなど）
3. **Step2の構造**: 必ず配列形式 `[{...}, {...}]` で記述
4. **文字エスケープ**: シングルクォート（'）は自動的にエスケープされます

## 例: 3ステップ問題（演繹推論）

```json
{
  "problem_id": "TLU-1-12-v1.0.0",
  "argument": "猫は動物であり，動物は生き物である．とすると，猫は生き物である．",
  "options": ["猫である", "動物である", "生き物である"],
  "correct_answers": {
    "step1": {
      "antecedent": "猫である",
      "consequent": "生き物である"
    },
    "step2": [
      { "from": "猫である", "to": "動物である" },
      { "from": "動物である", "to": "生き物である" }
    ],
    "step3": {
      "inference_type": "演繹推論",
      "validity": true
    }
  },
  "version": "1.0.0"
}
```

## 例: 組立不可の問題

```json
{
  "problem_id": "TLU-1-13-v1.0.0",
  "argument": "問題文...",
  "options": ["選択肢1", "選択肢2"],
  "correct_answers": {
    "step1": {
      "antecedent": "前件",
      "consequent": "後件"
    },
    "step2": [],  // 空配列（組立不可）
    "step3": {
      "inference_type": "非形式推論",
      "validity": false
    }
  },
  "version": "1.0.0"
}
```

## 例: 5ステップ問題（仮説推論）

```json
{
  "problem_id": "TLU-1-14-v1.0.0",
  "argument": "問題文...",
  "options": ["選択肢1", "選択肢2", "選択肢3"],
  "correct_answers": {
    "step1": {
      "antecedent": "前件",
      "consequent": "後件"
    },
    "step2": [
      { "from": "始点", "to": "終点" }
    ],
    "step3": {
      "inference_type": "仮説推論",
      "validity": false
    },
    "step4": [
      { "from": "始点", "to": "終点", "active": true },
      { "from": "始点", "to": "終点", "active": false }
    ],
    "step5": [
      { "antecedent": "前件", "consequent": "後件" },
      { "antecedent": "前件", "consequent": "後件" }
    ]
  },
  "version": "1.0.0"
}
```


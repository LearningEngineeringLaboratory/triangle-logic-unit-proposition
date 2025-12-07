# 問題データ管理

このディレクトリには、問題データのインポート用ファイルが含まれます。

## ファイル形式

### CSV形式（推奨）

`problems.csv` ファイルを使用して、問題データを一括投入できます。

#### CSVフォーマット

| 列名 | 説明 | 必須 | 例 |
|------|------|------|-----|
| `problem_id` | 問題ID（一意） | ✅ | `TLU-A-v1.0.0` |
| `argument` | 論証文（問題文） | ✅ | `PであるならばQである。また，QであるならばRである。したがって，PであるならばRである。` |
| `version` | 問題バージョン | ✅ | `1.0.0` |
| `options` | 選択肢（カンマ区切り） | ❌ | `Pである,Qである,Rである` |
| `step1_antecedent` | Step1の前件 | ❌ | `Pである` |
| `step1_consequent` | Step1の後件 | ❌ | `Rである` |
| `step2_links` | Step2のリンク（\|区切り、各リンクは from,to 形式） | ❌ | `Pである,Qである\|Qである,Rである` |
| `step3_inference_type` | Step3の推論形式 | ❌ | `演繹推論` / `仮説推論` / `非形式推論` |
| `step3_validity` | Step3の妥当性（true/false、空欄可） | ❌ | `true` |
| `step3_verification` | Step3の検証結果（true/false、空欄可） | ❌ | `true` |
| `step4_links` | Step4のリンク（\|区切り、各リンクは from,to,active 形式、複数パターンは \|\| で区切る、オプション） | ❌ | `Pである,Qである,true\|Qである,Rである,true` または `Pである,Qである,true\|Qである,Rである,true\|\|Pである,Rである,true` |
| `step5_premises` | Step5の前提（\|区切り、各前提は antecedent,consequent 形式、複数パターンは \|\| で区切る、オプション） | ❌ | `Pである,Qである\|Qである,Rである` または `Pである,Qである\|Qである,Rである\|\|Pである,Rである` |

#### 使用例

```csv
problem_id,argument,version,options,step1_antecedent,step1_consequent,step2_links,step3_inference_type,step3_validity,step3_verification,step4_links,step5_premises
TLU-A-v1.0.0,"PであるならばQである。また，QであるならばRである。したがって，PであるならばRである。",1.0.0,"Pである,Qである,Rである",Pである,Rである,"Pである,Qである|Qである,Rである",演繹推論,true,true,,
TLU-B-v1.0.0,"PであるならばQである。また，QであるならばRである。したがって，RであるならばSである。",1.0.0,"Pである,Qである,Rである,Sである",Rである,Sである,,非形式推論,false,,,
TLU-1-02-v1.0.0,"カラスは卵を産む生き物であり，鳥は卵を産む生き物である．とすると，カラスは鳥である．",1.0.0,"カラスである,鳥である,卵を産む生き物である",カラスである,鳥である,"カラスである,卵を産む生き物である|鳥である,卵を産む生き物である",仮説推論,false,true,"卵を産む生き物である,カラスである,true|卵を産む生き物である,鳥である,false|鳥である,卵を産む生き物である,true","カラスである,卵を産む生き物である|卵を産む生き物である,鳥である"
```

#### インポート方法

```bash
npx tsx scripts/import-from-csv.ts data/problems/problems.csv
```

### JSON形式

`problems.json` ファイルを使用して、問題データを一括投入できます。

#### JSONフォーマット

```json
[
  {
    "problem_id": "TLU-A-v1.0.0",
    "argument": "PであるならばQである。また，QであるならばRである。したがって，PであるならばRである。",
    "options": ["Pである", "Qである", "Rである"],
    "correct_answers": {
      "step1": {
        "antecedent": "Pである",
        "consequent": "Rである"
      },
      "step2": {
        "premise": "Qである",
        "link_directions": {
          "antecedent-link": true,
          "consequent-link": true
        },
        "impossible": false
      },
      "step3": {
        "inference_type": "演繹推論",
        "validity": true,
        "verification": true
      }
    },
    "version": "1.0.0"
  }
]
```

#### インポート方法

```bash
npx tsx scripts/import-from-json.ts data/problems/problems.json
```

## データ構造の詳細

### correct_answers の構造

#### Step1（導出命題）

```json
{
  "step1": {
    "antecedent": "Pである",
    "consequent": "Rである"
  }
}
```

#### Step2（所与命題）

**リンクがある場合:**
```json
{
  "step2": [
    {"from": "Pである", "to": "Qである"},
    {"from": "Qである", "to": "Rである"}
  ]
}
```

**組立不可の場合（空配列）:**
```json
{
  "step2": []
}
```

**CSVでの記述方法:**
- リンクがある場合: `Pである,Qである|Qである,Rである` （`from,to`形式を`|`で区切る）
- 組立不可の場合: 空欄（空文字列）

#### Step3（推論形式と妥当性）

```json
{
  "step3": {
    "inference_type": "演繹推論",  // "演繹推論" / "仮説推論" / "非形式推論"
    "validity": true,              // true / false
    "verification": true           // true / false
  }
}
```

#### Step4（オプション：妥当性のある三角ロジック）

Step3で演繹推論以外の場合のみ使用。各リンクに`active`フラグが必要。

**単一パターンの場合:**
```json
{
  "step4": [
    {"from": "カラスである", "to": "卵を産む生き物である", "active": true},
    {"from": "卵を産む生き物である", "to": "鳥である", "active": true},
    {"from": "鳥である", "to": "卵を産む生き物である", "active": false}
  ]
}
```

**複数パターンの場合（2次元配列）:**
```json
{
  "step4": [
    [{"from": "人間である", "to": "サルである", "active": true}, ...],
    [{"from": "人間である", "to": "肺呼吸である", "active": true}, ...],
    ...
  ]
}
```

**CSVでの記述方法:**
- 単一パターン: `from,to,active|from,to,active` （例: `カラスである,卵を産む生き物である,true|卵を産む生き物である,鳥である,true`）
- 複数パターン: `from,to,active|...||from,to,active|...` （`||`でパターンを区切る）
- `active`は`true`/`false`（空欄の場合は`true`がデフォルト）

#### Step5（オプション：妥当性のある三項論証）

Step3で演繹推論以外の場合のみ使用。

**単一パターンの場合:**
```json
{
  "step5": [
    {"antecedent": "カラスである", "consequent": "卵を産む生き物である"},
    {"antecedent": "卵を産む生き物である", "consequent": "鳥である"}
  ]
}
```

**複数パターンの場合（2次元配列）:**
```json
{
  "step5": [
    [{"antecedent": "人間である", "consequent": "サルである"}, {"antecedent": "サルである", "consequent": "二足歩行である"}],
    [{"antecedent": "人間である", "consequent": "肺呼吸である"}, {"antecedent": "肺呼吸である", "consequent": "二足歩行である"}],
    ...
  ]
}
```

**CSVでの記述方法:**
- 単一パターン: `antecedent,consequent|antecedent,consequent` （例: `カラスである,卵を産む生き物である|卵を産む生き物である,鳥である`）
- 複数パターン: `antecedent,consequent|...||antecedent,consequent|...` （`||`でパターンを区切る）
```

## 注意事項

1. **problem_id の一意性**: 同じ `problem_id` でインポートすると、既存のデータが更新されます（UPSERT）
2. **文字エンコーディング**: CSVファイルは UTF-8 で保存してください
3. **カンマを含む文字列**: CSVでカンマを含む文字列（論証文など）はダブルクォートで囲んでください
4. **真偽値**: `true` / `false` / `1` / `0` / `yes` / `no` / `y` / `n` のいずれかで記述可能
5. **空欄**: オプション項目は空欄でも構いません

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

**注意**: 
- `step3_validity`と`step3_verification`は不要（`inference_type`から自動計算されます）
- `step4_links`と`step5_premises`は不要（Step1とStep2から自動計算されます）

#### 使用例

```csv
problem_id,argument,version,options,step1_antecedent,step1_consequent,step2_links,step3_inference_type
TLU-A-v1.0.0,"PであるならばQである。また，QであるならばRである。したがって，PであるならばRである。",1.0.0,"Pである,Qである,Rである",Pである,Rである,"Pである,Qである|Qである,Rである",演繹推論
TLU-B-v1.0.0,"PであるならばQである。また，QであるならばRである。したがって，RであるならばSである。",1.0.0,"Pである,Qである,Rである,Sである",Rである,Sである,,非形式推論
TLU-1-02-v1.0.0,"カラスは卵を産む生き物であり，鳥は卵を産む生き物である．とすると，カラスは鳥である．",1.0.0,"カラスである,鳥である,卵を産む生き物である",カラスである,鳥である,"カラスである,卵を産む生き物である|鳥である,卵を産む生き物である",仮説推論
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

#### Step3（推論形式）

**重要**: `validity`と`verification`は`inference_type`から自動計算されるため、DBには保存不要です。

```json
{
  "step3": {
    "inference_type": "演繹推論"  // "演繹推論" / "仮説推論" / "非形式推論"
  }
}
```

**自動計算ルール:**
- `演繹推論` → `validity: true`, `verification: true`
- `仮説推論` → `validity: false`, `verification: true`
- `非形式推論` → `validity: false`, `verification: false`

#### Step4（妥当性のある三角ロジック）

**重要**: Step4の答え合わせは、Step1とStep2のデータから自動計算されるため、DBには保存不要です。

- Step2のリンクからPremiseNode（XXX）を抽出
- 必須リンクの存在確認:
  - `from: antecedent, to: XXX, active: true` が存在
  - `from: XXX, to: consequent, active: true` が存在
- それ以外のリンクはすべて`active: false`

#### Step5（妥当性のある三項論証）

**重要**: Step5の答え合わせは、Step1とStep4のデータから自動計算されるため、DBには保存不要です。

- Step4で使用されたXXXを特定
- 以下の2つのpremisesが存在（順序不問）:
  - `{ antecedent: Step1のantecedent, consequent: XXX }`
  - `{ antecedent: XXX, consequent: Step1のconsequent }`

## 答え合わせ処理の仕様

### DBに保存が必要なデータ

- **Step1**: `antecedent`, `consequent`（必須）
- **Step2**: リンク配列 `[{from, to}, ...]`（必須、組立不可の場合は空配列）
- **Step3**: `inference_type`のみ（必須）

### 自動計算されるデータ

- **Step3**: `validity`と`verification`は`inference_type`から自動計算
- **Step4**: Step1とStep2から自動判定（DB保存不要）
- **Step5**: Step1とStep4から自動判定（DB保存不要）

詳細は `src/lib/utils.ts` の `calculateValidityAndVerification()` と `src/lib/answer-validation.ts` を参照してください。

## 注意事項

1. **problem_id の一意性**: 同じ `problem_id` でインポートすると、既存のデータが更新されます（UPSERT）
2. **文字エンコーディング**: CSVファイルは UTF-8 で保存してください
3. **カンマを含む文字列**: CSVでカンマを含む文字列（論証文など）はダブルクォートで囲んでください
4. **空欄**: オプション項目は空欄でも構いません
5. **Step3のvalidity/verification**: CSVには記述不要（`inference_type`から自動計算されます）
6. **Step4とStep5**: CSVには記述不要（Step1とStep2から自動計算されます）
